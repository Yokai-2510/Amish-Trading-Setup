You are absolutely right. A design document should be complete, with no placeholders. My apologies for the oversight.

Here is the final version of the Modular Code Design, with all components explicitly listed and described concisely.

---

### **Design Document 3: Modular Code Design**

---
#### **1. Purpose**

This document provides the definitive blueprint for the application's source code structure. It outlines the project's directory layout, the precise responsibility of each module, and their interactions. This design enforces a strict separation of concerns, maximizes code reusability, and ensures a maintainable and scalable architecture.

#### **2. Project Directory Structure (Tree View)**

```
/trading_platform/
│
├── 📄 main.py                         # Master Command-Line Interface (CLI) Entry Point
├── 📄 requirements.txt               # Project-wide dependencies for all workers
│
├── 📂 source/
│   │
│   ├── 📄 run.py                     # Internal script to launch and manage live worker processes
│   ├── 📄 config.toml                 # (Template Only) Default configuration settings
│   │
│   ├── 📂 Backend_API/
│   │   ├── 📄 main.py                  # API server (FastAPI) entry point
│   │   └── 📂 routers/
│   │       ├── 📄 strategies.py         # Endpoints for managing strategies
│   │       ├── 📄 dashboard.py          # Endpoints for serving real-time state data
│   │       └── 📄 backtest.py           # Endpoints for triggering and viewing backtests
│   │
│   ├── 📂 Data_Ingestion/
│   │   ├── 📄 websocket_manager.py    # Manages broker WebSocket connection and subscriptions
│   │   ├── 📄 candle_processor.py     # Manages the real-time candle "working set" in Redis
│   │   ├── 📄 indicator_processor.py  # Worker to calculate and store all technical indicators
│   │   └── 📂 indicator_library/
│   │       ├── 📄 MA.py                # Moving Average calculation logic
│   │       ├── 📄 RSI.py               # Relative Strength Index calculation logic
│   │       ├── 📄 Stoch_RSI.py          # Stochastic RSI calculation logic
│   │       ├── 📄 MACD.py               # MACD calculation logic
│   │       ├── 📄 BB.py                 # Bollinger Bands calculation logic
│   │       ├── 📄 ADX.py                # Average Directional Index calculation logic
│   │       ├── 📄 Supertrend.py         # Supertrend calculation logic
│   │       ├── 📄 VolumeAnalysis.py     # Volume-based indicators calculation logic
│   │       ├── 📄 Fibonacci.py          # Fibonacci levels calculation logic
│   │       ├── 📄 Trend_Analysis.py     # Candle pattern trend analysis logic
│   │       └── 📄 CCI.py               # Commodity Channel Index calculation logic
│   │
│   ├── 📂 Evaluation/
│   │   ├── 📄 live_evaluator.py       # Worker to evaluate live data against strategy rules
│   │   ├── 📄 backtester.py           # On-demand script to run historical simulations
│   │   ├── 📄 options_logic.py        # Shared evaluation logic for options strategies
│   │   └── 📄 stocks_logic.py         # Shared evaluation logic for stocks strategies
│   │
│   ├── 📂 Execution/
│   │   └── 📄 execution_worker.py     # Worker to execute trades based on signals
│   │
│   └── 📂 Utilities/
│       ├── 📄 config_loader.py        # Reads and provides access to configurations from MongoDB
│       ├── 📄 login_manager.py        # Fetches and refreshes the broker access token
│       ├── 📄 instrument_manager.py   # Helper functions for querying the instrument master
│       ├── 📄 data_models.py          # Pydantic models for data consistency
│       └── 📂 clients/
│           ├── 📄 redis_client.py     # Provides a standardized, configured Redis client
│           └── 📄 mongo_client.py     # Provides a standardized, configured MongoDB client
│
└── 📂 docs/
    ├── 📄 1_High_Level_Architecture.md
    ├── 📄 2_Data_Architecture.md
    ├── 📄 3_Modular_Code_Design.md
    └── 📄 4_Core_Logic_Flows.md
```

#### **3. Module Responsibilities**

##### **Root Level**
*   **`main.py`:** Master CLI entry point. Parses arguments to start the live engine (`start-live-trading`) or run a backtest (`run-backtest`).
*   **`requirements.txt`:** Lists all Python dependencies for the project.

##### **`source/`**
*   **`run.py`:** Internal process manager. Imports and launches all live worker processes (`Data_Ingestion`, `Evaluation`, `Execution`) using `multiprocessing`.

##### **`source/Backend_API/`**
*   **`main.py`:** FastAPI server entry point, run by a server like Uvicorn.
*   **`routers/`:** Define all API endpoints.
    *   **`strategies.py`:** Manages strategy CRUD in MongoDB and updates the Redis config cache.
    *   **`dashboard.py`:** Reads real-time state from Redis to serve the UI.
    *   **`backtest.py`:** Triggers backtest runs and serves results from MongoDB.

##### **`source/Data_Ingestion/`**
*   **`websocket_manager.py`:** Manages the broker WebSocket. Dynamically determines instrument subscriptions by reading all live strategies. Writes tick data to Redis.
*   **`candle_processor.py`:** Manages the "Hybrid Candle Strategy." Seeds and maintains fixed-size, real-time candle lists in Redis for indicator calculation.
*   **`indicator_processor.py`:** A worker that reads live candle data from Redis, calculates all indicators for all active strategies using the `indicator_library`, and writes results to Redis.
*   **`indicator_library/`:** A library of pure, stateless modules, each containing the mathematical logic for a single technical indicator. They accept a DataFrame and parameters and return calculated data.

##### **`source/Evaluation/`**
*   **`live_evaluator.py`:** A worker that continuously reads Redis (indicators, positions, status). It uses logic from `options_logic.py` or `stocks_logic.py` to check for trade signals and creates `signal:*` keys in Redis upon detection.
*   **`backtester.py`:** An on-demand script that loads historical data and strategies from MongoDB. It reuses the exact same logic from `indicator_library` and `options/stocks_logic.py` to run simulations, writing final results to MongoDB.
*   **`options_logic.py`:** Shared library for all options-specific evaluation logic (e.g., strike selection, risk checks).
*   **`stocks_logic.py`:** Shared library for all stocks-specific evaluation logic (e.g., handling multiple positions, overnight reconciliation).

##### **`source/Execution/`**
*   **`execution_worker.py`:** A worker that monitors Redis for `signal:*` keys. It executes trades (paper or live), manages the lifecycle of active positions in Redis, and archives completed trades to MongoDB.

##### **`source.Utilities/`**
*   **`config_loader.py`:** Connects to MongoDB on startup using an environment variable and loads all global configurations into memory for application-wide access.
*   **`login_manager.py`:** Manages fetching and refreshing the broker access token, storing it in Redis.
*   **`instrument_manager.py`:** Provides helper functions to query the `instrument_master` collection in MongoDB.
*   **`data_models.py`:** Defines the strict data structures (e.g., using Pydantic) for `Strategy`, `TradeLog`, etc., ensuring data consistency.
*   **`clients/`:** Provides configured, singleton client instances for connecting to databases.
    *   **`redis_client.py`:** Returns a connected Redis client.
    *   **`mongo_client.py`:** Returns a connected MongoDB client.

---
