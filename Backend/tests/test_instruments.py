# tests/generate_instrument_reports.py

import sys
import os
import json
import csv
from datetime import datetime
from typing import List, Dict, Set, Tuple

def generate_reports_from_local_json():
    """
    Reads the raw complete.json file directly from the disk and correctly
    extracts all stocks and all unique option underlying/expiry combinations.
    This script DOES NOT use MongoDB.
    """
    print("--- Starting Local JSON Parsing and Report Generation ---")
    
    try:
        # Define the path to the JSON file in the 'data' directory
        json_path = os.path.join('data', 'complete.json')
        
        if not os.path.exists(json_path):
            print(f"❌ ERROR: The file '{json_path}' was not found.")
            print("Please ensure the instrument_manager.py has been run at least once to download it.")
            return

        print(f"INFO: Reading local file: '{json_path}'...")
        with open(json_path, 'r', encoding='utf-8') as f:
            all_instruments: List[Dict] = json.load(f)

        print(f"INFO: Successfully loaded {len(all_instruments)} total instruments from the JSON file.")

        stock_rows: List[Dict] = []
        # Use a set of tuples to automatically handle uniqueness of (symbol, key, expiry)
        unique_option_triplets: Set[Tuple[str, str, str]] = set()

        for instrument in all_instruments:
            # --- Identify Stocks ---
            if instrument.get("instrument_type") in ["EQUITY", "EQ"]:
                symbol = instrument.get("tradingsymbol") or instrument.get("trading_symbol")
                key = instrument.get("instrument_key")
                if symbol and key:
                    stock_rows.append({
                        "trading_symbol": symbol,
                        "instrument_key": key
                    })

            # --- Identify Option Contracts and extract their info ---
            if instrument.get("instrument_type") in ["CE", "PE"]:
                underlying_symbol = instrument.get("underlying_symbol")
                underlying_key = instrument.get("underlying_key")
                expiry_timestamp = instrument.get("expiry")

                # We must have all three pieces of information to proceed
                if not all([underlying_symbol, underlying_key, expiry_timestamp]):
                    continue

                try:
                    # Convert the millisecond timestamp to a YYYY-MM-DD date string
                    formatted_expiry = datetime.fromtimestamp(int(expiry_timestamp) / 1000).strftime('%Y-%m-%d')
                    unique_option_triplets.add( (underlying_symbol, underlying_key, formatted_expiry) )
                except (ValueError, TypeError, OSError):
                    # Safely ignore any contracts with invalid timestamp formats
                    continue
        
        # Convert the set of unique triplets back into a list of dictionaries
        final_option_rows = [
            {"underlying_symbol": triplet[0], "underlying_key": triplet[1], "expiry_date": triplet[2]}
            for triplet in unique_option_triplets
        ]
        
        print(f"INFO: Found {len(stock_rows)} stocks in the local file.")
        print(f"INFO: Found {len(final_option_rows)} unique underlying/expiry combinations.")

        # --- Write CSV Files ---
        if stock_rows:
            stocks_csv_path = "all_stocks_list.csv"
            print(f"INFO: Writing stocks to '{stocks_csv_path}'...")
            with open(stocks_csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=["trading_symbol", "instrument_key"])
                writer.writeheader()
                writer.writerows(sorted(stock_rows, key=lambda x: x['trading_symbol']))
            print(f"✅ Successfully created '{stocks_csv_path}'.")

        if final_option_rows:
            options_csv_path = "all_option_underlyings_and_expiries.csv"
            print(f"INFO: Writing option underlyings to '{options_csv_path}'...")
            with open(options_csv_path, 'w', newline='', encoding='utf-8') as f:
                fieldnames = ["underlying_symbol", "underlying_key", "expiry_date"]
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(sorted(final_option_rows, key=lambda x: (x['underlying_symbol'], x['expiry_date'])))
            print(f"✅ Successfully created '{options_csv_path}'.")

    except Exception as e:
        print(f"❌ An error occurred during local file parsing: {e}", file=sys.stderr)


if __name__ == "__main__":
    generate_reports_from_local_json()
    print("\n--- ✅ Report Generation Complete ---")