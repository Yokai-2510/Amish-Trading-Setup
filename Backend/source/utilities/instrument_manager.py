# source/utilities/instrument_manager.py

import sys
import os
import requests
import gzip
import shutil
import json
from typing import List , Dict
from collections import defaultdict, Counter
from datetime import datetime
import pytz

# Add the 'source' directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utilities.clients.mongo_client import get_db
from utilities.clients.redis_client import get_redis_client

# --- Module Constants ---
# Using a 'data' directory in the project root for cache/temp files
CACHE_DIR = "data"
INSTRUMENT_MASTER_GZ_FILE = "complete.json.gz"
INSTRUMENT_MASTER_JSON_FILE = "complete.json"
UPSTOX_INSTRUMENTS_URL = "https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz"
IST = pytz.timezone('Asia/Kolkata')


def _download_and_extract_master_file() -> bool:
    """
    Downloads the gzipped master instrument file from Upstox and extracts it.
    Returns True on success, False on failure.
    """
    gz_path = os.path.join(CACHE_DIR, INSTRUMENT_MASTER_GZ_FILE)
    json_path = os.path.join(CACHE_DIR, INSTRUMENT_MASTER_JSON_FILE)
    
    print("INFO: Downloading master instrument file from Upstox...")
    try:
        response = requests.get(UPSTOX_INSTRUMENTS_URL, stream=True, timeout=60)
        response.raise_for_status()
        
        with open(gz_path, 'wb') as f:
            shutil.copyfileobj(response.raw, f)
        print("INFO: Download complete. Extracting...")

        with gzip.open(gz_path, 'rb') as f_in, open(json_path, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
        
        os.remove(gz_path) # Clean up the gzipped file
        print("INFO: Extraction complete.")
        return True
    except Exception as e:
        print(f"❌ ERROR: Failed during master file download/extraction: {e}")
        return False

def get_instrument_master_from_file() -> List[Dict]:
    """
    Ensures the master JSON file is available in the cache, downloading if
    necessary, and then loads it into memory.
    """
    json_path = os.path.join(CACHE_DIR, INSTRUMENT_MASTER_JSON_FILE)
    
    if not os.path.exists(json_path):
        print("INFO: Master instrument file not found in cache.")
        if not _download_and_extract_master_file():
            return [] # Return empty list on failure
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ ERROR: Failed to read or parse master JSON file: {e}")
        return []

def update_instrument_master_in_db():
    """
    The main function for this module. Fetches the complete instrument list from
    the broker, structures it, and upserts it into the MongoDB collection.
    """
    print("\n--- Starting Instrument Master Update Process ---")
    
    try:
        db = get_db()
        collection = db.instrument_master
        all_instruments = get_instrument_master_from_file()

        if not all_instruments:
            raise Exception("Could not retrieve instrument list from source.")

        print(f"INFO: Retrieved {len(all_instruments)} total instruments. Processing and structuring...")

        # Use defaultdict to group options by their underlying
        options_by_underlying = defaultdict(list)
        stocks_and_indices = []

        for inst in all_instruments:
            instrument_key = inst.get("instrument_key")
            if not instrument_key:
                continue

            # Standardize expiry date format
            if 'expiry' in inst:
                try:
                    inst['expiry_date'] = datetime.strptime(inst['expiry'], '%Y-%m-%d').strftime('%Y-%m-%d')
                except (ValueError, TypeError):
                    inst['expiry_date'] = None
            
            # Group options, separate everything else
            if inst.get("instrument_type") in ["CE", "PE"] and inst.get("underlying_key"):
                options_by_underlying[inst["underlying_key"]].append(inst)
            else:
                stocks_and_indices.append(inst)

        # --- Prepare documents for MongoDB ---
        documents_to_upsert = []

        # 1. Create documents for Stocks, Indices, etc.
        for inst in stocks_and_indices:
            doc = {
                "_id": inst["instrument_key"], # Use instrument_key as the unique ID
                **inst
            }
            # If this is an index that has options, add the options array to it
            if inst["instrument_key"] in options_by_underlying:
                doc["options"] = options_by_underlying[inst["instrument_key"]]
            
            documents_to_upsert.append(doc)

        print(f"INFO: Processed {len(documents_to_upsert)} primary instruments (Stocks, Indices).")
        print("INFO: Now upserting into MongoDB. This may take a moment...")

        # --- Perform Bulk Upsert Operation ---
        # Using a bulk write operation is vastly more efficient than individual updates.
        from pymongo import UpdateOne
        
        bulk_operations = [
            UpdateOne({'_id': doc['_id']}, {'$set': doc}, upsert=True)
            for doc in documents_to_upsert
        ]

        if bulk_operations:
            result = collection.bulk_write(bulk_operations)
            print("INFO: Bulk write operation summary:")
            print(f"  - Matched: {result.matched_count}, Upserted: {result.upserted_count}, Modified: {result.modified_count}")
        
        print(f"✅ SUCCESS: Instrument master database is now up-to-date.")

    except Exception as e:
        print(f"❌ ERROR in instrument master update process: {e}", file=sys.stderr)


if __name__ == '__main__':
    # Standalone test for this module.
    # It will download the master file (if not present) and populate the local DB.
    print("--- Running Standalone Test for instrument_manager.py ---")
    update_instrument_master_in_db()
    print("\n--- ✅ Instrument Manager Test Complete ---")