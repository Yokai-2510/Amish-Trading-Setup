# source/utilities/clients/mongo_client.py

import pymongo
import sys
import os

# Ensure the source directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from utilities.config_loader import CONFIG

# This variable will hold the single, global connection object
_mongo_client = None

def get_mongo_client():
    """
    Establishes a connection to MongoDB if one does not exist,
    and returns the client. This follows a singleton pattern.

    Returns:
        pymongo.MongoClient: The active MongoDB client instance.
    """
    global _mongo_client
    if _mongo_client is None:
        try:
            print("INFO: Initializing new MongoDB connection...")
            uri = CONFIG['mongodb']['uri']
            _mongo_client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
            # The ismaster command is cheap and does not require auth.
            _mongo_client.admin.command('ismaster')
            print("INFO: MongoDB connection successful.")
        except Exception as e:
            print(f"CRITICAL ERROR: Could not connect to MongoDB. {e}", file=sys.stderr)
            sys.exit(1)
    return _mongo_client

def get_db():
    """
    Returns a handle to the specific database defined in the config.

    Returns:
        pymongo.database.Database: The database instance.
    """
    client = get_mongo_client()
    return client[CONFIG['mongodb']['database_name']]

if __name__ == '__main__':
    # Standalone test for this module
    print("--- Running Standalone Test for mongo_client.py ---")
    
    # Get the client for the first time
    client1 = get_mongo_client()
    print(f"First client object ID: {id(client1)}")
    
    # Get a specific database and collection
    db = get_db()
    print(f"Database handle: {db.name}")
    
    # Get the client a second time
    client2 = get_mongo_client()
    print(f"Second client object ID: {id(client2)}")
    
    if id(client1) == id(client2):
        print("✅ Singleton pattern confirmed: Both client objects are the same.")
    else:
        print("❌ ERROR: Singleton pattern failed.")
        
    print("--- Test Complete ---")