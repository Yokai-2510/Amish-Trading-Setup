# scripts/setup_database.py

import sys
import os
from copy import deepcopy
from datetime import datetime
import pytz

# Add the 'source' directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'source')))

from utilities.clients.mongo_client import get_db
from utilities.data_models import Strategy, SystemConfig

def setup_database_structure():
    """
    Establishes the entire required database structure in MongoDB.
    This script is idempotent - it can be run multiple times without causing errors.
    """
    print("--- Starting Master Database Setup ---")
    
    try:
        db = get_db()

        # --- 1. Ensure all collections exist ---
        required_collections = [
            "system_config", "system_status", "strategies", "instrument_master",
            "historical_candles", "trade_logs", "backtest_results", "system_logs"
        ]
        print("INFO: Verifying collections...")
        for coll_name in required_collections:
            if coll_name not in db.list_collection_names():
                db.create_collection(coll_name)
                print(f"  -> Created collection: '{coll_name}'")
        print("✅ All collections are present.")

        # --- 2. Seed the System Configuration ---
        print("\nINFO: Seeding system configuration...")
        config_collection = db.system_config
        
        config_data = {
            "_id": "global_settings",
            "redis_config": { "host": "localhost", "port": 6379, "db": 0 },
            "mongodb_config": { "uri": "mongodb://trading_setup_test:Fumaken%40%232510@localhost:27017/", "database_name": "trading_platform" },
            "upstox_credentials": {
                # IMPORTANT: Fill in your credentials here before running for the first time
                "api_key": "YOUR_API_KEY_HERE",
                "secret_key": "YOUR_SECRET_KEY_HERE",
                "redirect_uri": "https://www.yokai2510.com",
                "totp_key": "YOUR_TOTP_KEY_HERE",
                "mobile_no": "YOUR_MOBILE_NO_HERE",
                "pin": "YOUR_PIN_HERE"
            },
            "instrument_manager_settings": {
                "strike_range": 15,
                "force_instrument_download": False
            },
            "system_settings": { "log_level": "INFO", "max_websocket_reconnect_attempts": 10 }
        }
        
        SystemConfig(**config_data)
        config_collection.update_one({"_id": "global_settings"}, {"$set": config_data}, upsert=True)
        print("✅ System configuration document created/updated.")

        # --- 3. Seed the System Status Document ---
        print("\nINFO: Seeding system status...")
        status_collection = db.system_status
        
        # This document will be updated by the live workers
        status_data = {
            "_id": "login_status",
            "status": "NOT_ATTEMPTED", # e.g., SUCCESS, FAILED, IN_PROGRESS
            "message": "System has not attempted to log in yet.",
            "timestamp_iso": datetime.now(pytz.utc).isoformat(),
            "force_login": False # This can be toggled by the API to trigger a new login
        }
        # Only insert this document if it doesn't already exist
        status_collection.update_one({"_id": "login_status"}, {"$setOnInsert": status_data}, upsert=True)
        print("✅ Default login status document created (if it did not exist).")

        # --- 4. Seed Placeholder Strategies ---
        print("\nINFO: Seeding placeholder strategies...")
        strategy_collection = db.strategies
        
        # (Strategy generation logic remains the same)
        base_options_strategy = {
            "_id": "option_set_1", "asset_type": "options",
            "set_config": { "set_id": "option_set_1", "set_name": "BankNifty Scalper", "description": "A sample scalping strategy for BankNifty.", "set_active_status": False },
            "instrument_config": { "underlying_symbol": "BANKNIFTY", "underlying_key": "NSE_INDEX|Nifty Bank", "option_type": "CE", "trade_type": "Buy", "expiry": "2025-09-25", "strike_selection": "ATM", "strike_offset": 0, "custom_strike_value": None },
            "trade_parameters": { "order_type": "MARKET", "product_type": "INTRADAY", "quantity_type": "Lots", "quantity_value": 1, "trade_mode": "paper", "bypass_order_confirmation": True, "broker": "upstox" },
            "entry_config": { "start_time": "09:20:00", "end_time": "15:00:00", "exclude_time_active": False, "exclusion_start_time": "12:00:00", "exclusion_end_time": "13:00:00", "entry_check_interval": 1, "chart_type": "candlestick", "time_frame": "1m" },
            "exit_config": { "exit_check_interval": 1, "chart_type": "candlestick", "time_frame": "1m", "stop_loss": {"active": True, "type": "percentage", "value": 15}, "target_profit": {"active": True, "type": "percentage", "value": 30}, "time_based_exit": {"active": True, "type": "fixed", "fixed_exit_time": "15:10:00", "from_entry_time": "60M"} },
            "entry_indicators": [], "exit_indicators": []
        }
        base_stocks_strategy = {
            "_id": "stock_set_1", "asset_type": "stocks",
            "set_config": { "set_id": "stock_set_1", "set_name": "Nifty50 Momentum", "description": "A sample momentum strategy for stocks.", "set_active_status": False },
            "instrument_config": { "stocks": [{"name": "RELIANCE", "quantity": 10}] },
            "trade_parameters": { "order_type": "MARKET", "product_type": "INTRADAY", "quantity_type": "Quantity", "quantity_value": 1, "trade_mode": "paper", "bypass_order_confirmation": True, "broker": "upstox" },
            "entry_config": { "start_time": "09:30:00", "end_time": "15:00:00", "exclude_time_active": False, "exclusion_start_time": "12:00:00", "exclusion_end_time": "13:00:00", "entry_check_interval": 5, "chart_type": "candlestick", "time_frame": "5m" },
            "exit_config": { "exit_check_interval": 2, "chart_type": "candlestick", "time_frame": "5m", "stop_loss": {"active": True, "type": "percentage", "value": 5}, "target_profit": {"active": True, "type": "percentage", "value": 10}, "time_based_exit": {"active": False, "type": "fixed", "fixed_exit_time": "15:15:00", "from_entry_time": "120M"} },
            "entry_indicators": [], "exit_indicators": []
        }
        
        all_strategies = []
        all_strategies.append(base_options_strategy)
        for i in range(2, 9):
            new_strat = deepcopy(base_options_strategy); set_id = f"option_set_{i}"; new_strat["_id"] = set_id; new_strat["set_config"]["set_id"] = set_id; new_strat["set_config"]["set_name"] = f"Option Strategy {i}"; all_strategies.append(new_strat)
        all_strategies.append(base_stocks_strategy)
        for i in range(2, 5):
            new_strat = deepcopy(base_stocks_strategy); set_id = f"stock_set_{i}"; new_strat["_id"] = set_id; new_strat["set_config"]["set_id"] = set_id; new_strat["set_config"]["set_name"] = f"Stock Strategy {i}"; new_strat["instrument_config"]["stocks"] = []; all_strategies.append(new_strat)
        
        for strat_data in all_strategies:
            Strategy(**strat_data)
            strategy_collection.update_one({"_id": strat_data["_id"]}, {"$set": strat_data}, upsert=True)
        print(f"✅ {len(all_strategies)} placeholder strategies created/updated.")

    except Exception as e:
        print(f"❌ An error occurred during database setup: {e}", file=sys.stderr)
        return False
    return True

if __name__ == "__main__":
    if setup_database_structure():
        print("\n--- ✅ Master Database Setup Complete ---")
    else:
        print("\n--- ❌ Master Database Setup Failed ---")