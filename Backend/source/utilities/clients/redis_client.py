# source/utilities/clients/redis_client.py

import redis
import sys
import os

# Ensure the source directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from utilities.config_loader import CONFIG

# This variable will hold the single, global connection object
_redis_client = None

def get_redis_client():
    """
    Establishes a connection to Redis if one does not exist,
    and returns the client. This follows a singleton pattern.

    Returns:
        redis.Redis: The active Redis client instance.
    """
    global _redis_client
    if _redis_client is None:
        try:
            print("INFO: Initializing new Redis connection...")
            _redis_client = redis.Redis(
                host=CONFIG['redis']['host'],
                port=CONFIG['redis']['port'],
                db=CONFIG['redis']['db'],
                decode_responses=True
            )
            _redis_client.ping()
            print("INFO: Redis connection successful.")
        except Exception as e:
            print(f"CRITICAL ERROR: Could not connect to Redis. {e}", file=sys.stderr)
            sys.exit(1)
    return _redis_client

if __name__ == '__main__':
    # Standalone test for this module
    print("--- Running Standalone Test for redis_client.py ---")

    # Get the client for the first time
    client1 = get_redis_client()
    print(f"First client object ID: {id(client1)}")
    
    # Get the client a second time
    client2 = get_redis_client()
    print(f"Second client object ID: {id(client2)}")
    
    if id(client1) == id(client2):
        print("✅ Singleton pattern confirmed: Both client objects are the same.")
    else:
        print("❌ ERROR: Singleton pattern failed.")
    
    # Test a simple command
    client1.set("test:singleton", "success")
    value = client2.get("test:singleton")
    if value == "success":
        print("✅ Read/Write test successful via singleton client.")
    client1.delete("test:singleton")

    print("--- Test Complete ---")