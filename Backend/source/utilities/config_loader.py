# source/utilities/config_loader.py

import toml
import os
import sys

def load_config():
    """
    Loads the configuration from the config.toml file.

    The function searches for the config file starting from the project's root
    directory. It raises a FileNotFoundError if the config cannot be found.

    Returns:
        dict: A dictionary containing the configuration settings.
    """
    try:
        # The config file is located in the 'data' directory at the project root.
        config_path = os.path.join('data', 'config.toml')
        
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Configuration file not found at: {config_path}")

        with open(config_path, 'r') as f:
            config = toml.load(f)
        
        return config

    except Exception as e:
        print(f"CRITICAL ERROR: Could not load configuration. {e}", file=sys.stderr)
        sys.exit(1) # Exit the application if config cannot be loaded

# Load the configuration once when the module is first imported.
# Any other module that imports CONFIG will get this same object.
CONFIG = load_config()

if __name__ == '__main__':
    # Standalone test for this module
    print("--- Running Standalone Test for config_loader.py ---")
    print("Configuration loaded successfully.")
    print("\n[redis] section:")
    print(CONFIG.get('redis'))
    print("\n[mongodb] section:")
    print(CONFIG.get('mongodb'))
    print("\n--- Test Complete ---")