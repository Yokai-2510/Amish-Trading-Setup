# source/utilities/login_manager.py

import sys
import os
import time
import pyotp
import requests
import json
from urllib.parse import parse_qs, urlparse, quote
from playwright.sync_api import sync_playwright
from datetime import datetime, time as dt_time, timedelta
import pytz

# Add the 'source' directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import our own utility modules
from utilities.clients.mongo_client import get_db
from utilities.clients.redis_client import get_redis_client
from utilities.data_models import SystemConfig

# Define constants for Redis and Mongo objects
ACCESS_TOKEN_KEY = "system:access_token"
IST = pytz.timezone('Asia/Kolkata')

def _is_token_still_valid(status_data: dict) -> bool:
    """
    Checks if the existing token is still valid based on its fetch time.
    Token expires at 3:30 AM IST the next day.
    """
    if not status_data or status_data.get("status") != "SUCCESS":
        return False

    last_fetch_str = status_data.get("timestamp_iso")
    if not last_fetch_str:
        return False

    try:
        last_fetch_dt = datetime.fromisoformat(last_fetch_str).astimezone(IST)
        now_ist = datetime.now(IST)
        expiry_time = dt_time(3, 30)

        if last_fetch_dt.time() >= expiry_time:
            expiry_dt = (last_fetch_dt.date() + timedelta(days=1))
        else:
            expiry_dt = last_fetch_dt.date()
            
        full_expiry_dt = IST.localize(datetime.combine(expiry_dt, expiry_time))
        return now_ist < full_expiry_dt
    except Exception as e:
        print(f"WARNING: Could not parse token timestamp. Assuming invalid. Error: {e}")
        return False

def _update_login_status(status_collection, status: str, message: str, force_login_val: bool):
    """Updates the login status document in MongoDB."""
    status_payload = {
        "status": status,
        "message": message,
        "timestamp_iso": datetime.now(pytz.utc).isoformat(),
        "force_login": force_login_val
    }
    status_collection.update_one({"_id": "login_status"}, {"$set": status_payload}, upsert=True)


def fetch_and_store_access_token():
    """
    The main function to manage the broker access token.

    1. Checks for a `force_login` flag in the database.
    2. Checks if the current token in Redis is still valid.
    3. If necessary, performs the full browser login to get a new token.
    4. Updates the token in Redis and the status in MongoDB.
    """
    print("--- Running Access Token Manager ---")
    
    try:
        redis_client = get_redis_client()
        db = get_db()
        status_collection = db.system_status
        config_collection = db.system_config

        # --- 1. Fetch Current Status and Config ---
        login_status_doc = status_collection.find_one({"_id": "login_status"})
        config_doc = config_collection.find_one({"_id": "global_settings"})

        if not login_status_doc or not config_doc:
            raise Exception("Critical documents ('login_status' or 'global_settings') not found in database.")

        force_login = login_status_doc.get("force_login", False)

        # --- 2. Check for Existing Valid Token ---
        if not force_login:
            existing_token = redis_client.get(ACCESS_TOKEN_KEY)
            if existing_token and _is_token_still_valid(login_status_doc):
                message = f"Valid token from {login_status_doc.get('timestamp_iso')} already exists. Skipping login."
                print(f"INFO: {message}")
                # No status update needed as it's already SUCCESS
                return existing_token

        print("INFO: Token is invalid, expired, or a forced login is requested. Starting new login.")
        _update_login_status(status_collection, "IN_PROGRESS", "Attempting to fetch new access token.", force_login)

        # --- 3. Fetch Credentials & Perform Login ---
        system_config = SystemConfig(**config_doc)
        creds = system_config.upstox_credentials
        
        # (The Playwright and Requests logic is identical to the previous correct versions)
        rurl_encoded = quote(creds.redirect_uri, safe="")
        auth_url = f'https://api-v2.upstox.com/login/authorization/dialog?response_type=code&client_id={creds.api_key}&redirect_uri={rurl_encoded}'
        auth_code = None
        print("INFO: Launching browser automation...")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            context = browser.new_context()
            page = context.new_page()
            def handle_request(request):
                nonlocal auth_code
                if auth_code is None and creds.redirect_uri in request.url and 'code=' in request.url:
                    auth_code = parse_qs(urlparse(request.url).query)['code'][0]
            page.on('request', handle_request)
            page.goto(auth_url, wait_until='load', timeout=60000)
            page.locator("#mobileNum").fill(creds.mobile_no)
            page.get_by_role("button", name="Get OTP").click()
            page.wait_for_selector("#otpNum", state="visible", timeout=30000)
            otp = pyotp.TOTP(creds.totp_key).now()
            page.locator("#otpNum").fill(otp)
            page.get_by_role("button", name="Continue").click()
            page.wait_for_selector("input[type='password']", state="visible", timeout=30000)
            page.get_by_label("Enter 6-digit PIN").fill(creds.pin)
            page.get_by_role("button", name="Continue").click()
            page.wait_for_timeout(7000) # Increased wait time
            browser.close()
        if not auth_code:
            raise Exception("Failed to obtain authorization code via Playwright.")
        print("INFO: Auth code captured.")

        print("INFO: Exchanging for access token...")
        token_url = 'https://api-v2.upstox.com/login/authorization/token'
        headers = {'accept': 'application/json', 'Api-Version': '2.0', 'Content-Type': 'application/x-www-form-urlencoded'}
        data = {'code': auth_code, 'client_id': creds.api_key, 'client_secret': creds.secret_key, 'redirect_uri': creds.redirect_uri, 'grant_type': 'authorization_code'}
        response = requests.post(token_url, headers=headers, data=data, timeout=30)
        response.raise_for_status()
        access_token = response.json().get('access_token')
        if not access_token:
            raise Exception("No access token in broker's response.")

        # --- 4. Store Token and Final Status ---
        redis_client.set(ACCESS_TOKEN_KEY, access_token)
        success_message = "New access token fetched and stored successfully."
        # IMPORTANT: Set force_login back to False after a successful run
        _update_login_status(status_collection, "SUCCESS", success_message, False)
        print(f"✅ {success_message}")
        return access_token

    except Exception as e:
        error_message = f"Login process failed: {e}"
        print(f"❌ ERROR: {error_message}", file=sys.stderr)
        # Try to get a handle to the collection to update status even on failure
        try:
            db = get_db()
            status_collection = db.system_status
            login_status_doc = status_collection.find_one({"_id": "login_status"})
            force_login = login_status_doc.get("force_login", False)
            _update_login_status(status_collection, "FAILED", error_message, force_login)
        except Exception as update_e:
            print(f"CRITICAL: Could not even update failure status. Error: {update_e}", file=sys.stderr)
        return None


if __name__ == '__main__':
    print("--- Running Standalone Test for login_manager.py ---")
    
    # Prerequisite check for Playwright browsers
    playwright_browser_path = os.path.expanduser('~/.cache/ms-playwright')
    if not os.path.exists(playwright_browser_path):
         print("WARNING: Playwright browsers not found.")
         print("Please run this one-time command: playwright install")
         sys.exit(1)

    # To simulate a manual trigger from the UI, you could do this:
    # db = get_db()
    # db.system_status.update_one({"_id": "login_status"}, {"$set": {"force_login": True}})
    # print("INFO: 'force_login' flag set to True for testing.")

    token = fetch_and_store_access_token()
    
    if token:
        print("\n--- ✅ Login Manager Test Successful ---")
    else:
        print("\n--- ❌ Login Manager Test Failed ---")