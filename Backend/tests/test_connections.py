import sys
import os
import pymongo
import redis
import uuid
import time
from datetime import datetime

# --- Configuration Setup ---
# Add 'source' to path to allow importing utilities
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'source')))

try:
    from utilities.config_loader import CONFIG
except ImportError:
    print("❌ ERROR: Could not import config_loader. Make sure you are running this from the 'Backend' directory.")
    print("   Command: python tests/test_connections.py")
    sys.exit(1)

# --- Helper Functions ---

def get_mongo_client():
    uri = CONFIG['mongodb']['uri']
    return pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)

def get_redis_client():
    return redis.Redis(
        host=CONFIG['redis']['host'],
        port=CONFIG['redis']['port'],
        db=CONFIG['redis']['db'],
        decode_responses=True # Important for reading strings back correctly
    )

# --- Test Modes ---

def run_connection_ping():
    """Simple Ping Test (Read Only)"""
    print("\n--- 📡 Running Simple Connection Ping ---")

    # MongoDB
    try:
        db_name = CONFIG['mongodb']['database_name']
        print(f"   MongoDB ({db_name})... ", end="", flush=True)
        client = get_mongo_client()
        client.admin.command('ping')
        print("✅ Online")
    except Exception as e:
        print(f"❌ Failed: {e}")

    # Redis
    try:
        r_host = CONFIG['redis']['host']
        print(f"   Redis ({r_host})... ", end="", flush=True)
        client = get_redis_client()
        client.ping()
        print("✅ Online")
    except Exception as e:
        print(f"❌ Failed: {e}")
    print("-----------------------------------------")


def run_full_crud_test():
    """Full Create-Read-Delete Test (Write Access)"""
    print("\n--- 🧪 Running Full CRUD (Write/Read) Test ---")
    
    test_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().isoformat()

    # --- MongoDB Test ---
    print("\n1. MongoDB Operations:")
    try:
        client = get_mongo_client()
        db = client[CONFIG['mongodb']['database_name']]
        collection = db['__connection_test_temp'] # Temp collection

        # CREATE
        doc = {"_id": test_id, "status": "active", "ts": timestamp}
        collection.insert_one(doc)
        print(f"   📝 Write: Inserted document with ID '{test_id}'")

        # READ
        fetched = collection.find_one({"_id": test_id})
        if fetched and fetched['ts'] == timestamp:
            print(f"   🔍 Read:  Verified document data.")
        else:
            print(f"   ❌ Read:  Data mismatch or not found!")
            raise Exception("Data verification failed")

        # DELETE
        collection.delete_one({"_id": test_id})
        print(f"   🗑️  Delete: Removed test document.")
        
        # Cleanup collection
        collection.drop()
        print("   ✅ MongoDB CRUD Test Passed.")

    except Exception as e:
        print(f"   ❌ MongoDB CRUD Failed: {e}")

    # --- Redis Test ---
    print("\n2. Redis Operations:")
    try:
        client = get_redis_client()
        key = f"test_key_{test_id}"
        value = f"test_value_{timestamp}"

        # CREATE
        client.set(key, value)
        print(f"   📝 Write: Set Key '{key}'")

        # READ
        fetched_value = client.get(key)
        if fetched_value == value:
            print(f"   🔍 Read:  Verified value matches.")
        else:
            print(f"   ❌ Read:  Value mismatch! Got {fetched_value}")
            raise Exception("Data verification failed")

        # DELETE
        client.delete(key)
        print(f"   🗑️  Delete: Removed test key.")
        print("   ✅ Redis CRUD Test Passed.")

    except Exception as e:
        print(f"   ❌ Redis CRUD Failed: {e}")

    print("---------------------------------------------")

# --- Main Menu ---

if __name__ == "__main__":
    while True:
        print("\nSelect Test Mode:")
        print("1. Simple Connection Ping (Safe)")
        print("2. Full Write/Read/Delete Test (Verifies permissions)")
        print("0. Exit")
        
        choice = input("\nEnter choice (0-2): ").strip()

        if choice == '1':
            run_connection_ping()
        elif choice == '2':
            run_full_crud_test()
        elif choice == '0':
            print("Exiting.")
            sys.exit(0)
        else:
            print("Invalid choice.")