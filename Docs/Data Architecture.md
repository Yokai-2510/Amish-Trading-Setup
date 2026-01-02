
---
#### **1. Purpose**

This document defines the complete data structure for the Algorithmic Trading Platform. It serves as the definitive schema for both the persistent database (MongoDB) and the real-time cache (Redis). This design ensures data integrity, performance, and provides a clear contract for all system modules.

#### **2. Data Storage Architecture**

The system employs a dual-database strategy to optimize for distinct use cases: persistence and real-time performance.

*   **MongoDB:** Serves as the system's permanent, queryable archive and the single source of truth for all configurations and historical records. It is optimized for storage, complex queries, and data analysis.

*   **Redis:** Serves as the high-speed, volatile state machine for the live trading engine. It holds only the ephemeral data required for immediate operations and is optimized for low-latency reads and writes.

#### **3. MongoDB Schema**

**Database:** `trading_platform`

The database is structured into discrete collections, each serving a specific domain. This ensures scalability, performance, and avoids data integrity issues inherent in single-document or single-collection models.

```
[DATABASE: trading_platform]
 │
 ├─ 📂 COLLECTION: system_config
 │   │  // Purpose: A centralized store for all global, environment-specific configurations.
 │   └─ 📄 DOCUMENT (_id: "global_settings")
 │      ├─ 📝 redis_config:
 │      │   ├─ host: "localhost"
 │      │   ├─ port: 6379
 │      │   └─ db: 0
 │      │
 │      ├─ 📝 upstox_credentials:
 │      │   ├─ user_id: "user_account_1"
 │      │   ├─ api_key: "..."
 │      │   ├─ secret_key: "..."
 │      │   ├─ totp_key: "..."
 │      │   ├─ mobile_no: "..."
 │      │   └─ pin: "..."
 │      │
 │      └─ 📝 system_settings:
 │          ├─ log_level: "INFO"
 │          └─ max_websocket_reconnect_attempts: 10
 │
 ├─ 📂 COLLECTION: strategies
 │   │  // Purpose: The master library of all user-defined trading strategies.
 │   └─ 📄 DOCUMENT (_id: "option_set_1")
 │      ├─ set_name: "BankNifty Live Breakout"
 │      ├─ asset_type: "options" | "stocks"
 │      ├─ is_active: true
 │      ├─ config: { ... }
 │      └─ indicators_config: { ... }
 │
 ├─ 📂 COLLECTION: historical_candles
 │   │  // Purpose: An immutable archive of all historical market data, indexed for efficient retrieval.
 │   └─ 📄 DOCUMENT (_id: "BANKNIFTY_2025-09-08")
 │      ├─ instrument_key: "NSE_INDEX|Nifty Bank"
 │      ├─ date: "2025-09-08"
 │      └─ candles: [ {t, o, h, l, c, v}, ... ]
 │
 ├─ 📂 COLLECTION: trade_logs
 │   │  // Purpose: An archive of every completed live/paper trade for performance analysis and auditing.
 │   └─ 📄 DOCUMENT (_id: "trade_live_12345")
 │      ├─ set_id: "option_set_1"             // Indexed for filtering
 │      ├─ asset_type: "options" | "stocks"
 │      ├─ instrument_key: "NSE_EQ|RELIANCE"
 │      ├─ entry_timestamp: "..."             // Indexed for date range queries
 │      ├─ exit_timestamp: "..."
 │      ├─ pnl: { ... }
 │      ├─ entry: { ... }
 │      └─ exit: { ... }
 │
 ├─ 📂 COLLECTION: backtest_results
 │   │  // Purpose: Stores the complete, self-contained results of every backtest run.
 │   └─ 📄 DOCUMENT (_id: "backtest_run_xyz")
 │      ├─ status: "COMPLETED" | "RUNNING" | "FAILED"
 │      ├─ 📝 run_parameters:
 │      │   ├─ strategy_id_source: "option_set_1"
 │      │   ├─ start_date: "2024-01-01"
 │      │   └─ end_date: "2024-06-30"
 │      │
 │      ├─ 📝 strategy_snapshot:  // An immutable copy of the strategy configuration for this run.
 │      │   ├─ config: { ... }
 │      │   └─ indicators_config: { ... }
 │      │
 │      ├─ 📝 summary:
 │      │   ├─ net_pnl: 12500
 │      │   └─ ... (win_rate, max_drawdown, etc.)
 │      │
 │      └─ 📝 trades: [ ... ]  // An array of every simulated trade.
 │
 └─ 📂 COLLECTION: system_logs
     │  // Purpose: A queryable log for system events, errors, and warnings.
     └─ 📄 DOCUMENT (_id: ObjectId())
        ├─ timestamp: "..."                        // Indexed for date range queries
        ├─ level: "INFO" | "ERROR" | "WARNING"     // Indexed for filtering
        ├─ component: "WebSocket" | "EvaluationWorker" // Indexed for filtering
        ├─ set_id: "option_set_1" (optional)      // Indexed for filtering
        └─ message: "Successfully fetched new access token."
```

---

#### **4. Redis Schema**

**Purpose:** To serve as the real-time, high-speed state machine for the live trading engine. The keyspace is logically structured using a `scope:type:id` convention.

```
[REDIS KEYSPACE (Logical View)]
 │
 ├─ 📂 system:
 │   └─ 🔑 system:access_token                 (String) // The broker API access token.
 │
 ├─ 📂 market_data:
 │   ├─ 🔑 market_data:instrument:{key}        (Hash)   // Latest tick data (ltp, open, etc.).
 │   └─ 🔑 market_data:candles:{key}           (List)   // The "hot" working set of the most recent N candles.
 │
 ├─ 📂 state:options:{set_id}
 │   │  // State for an options strategy, which handles one position at a time.
 │   ├─ 🔑 ...:status       (Hash)   // High-level operational status flags.
 │   ├─ 🔑 ...:position     (JSON)   // JSON object for the single active option position. EXISTS ONLY IF ACTIVE.
 │   └─ 🔑 ...:indicators   (JSON)   // Calculated indicator values for the underlying instrument.
 │
 ├─ 📂 state:stocks:{set_id}
 │   │  // State for a stocks strategy, which handles multiple parallel positions.
 │   ├─ 🔑 ...:status       (Hash)   // High-level operational status flags for the set.
 │   ├─ 🔑 ...:positions    (Hash)   // A Redis Hash where each field is an active stock position. EXISTS ONLY IF ACTIVE.
 │   │   ├─ FIELD "{instrument_key_1}": '{...position_details...}' (JSON string)
 │   │   └─ FIELD "{instrument_key_2}": '{...position_details...}' (JSON string)
 │   │
 │   └─ 🔑 ...:indicators   (Hash)   // A Redis Hash where each field contains indicator results for a specific stock.
 │       ├─ FIELD "{instrument_key_1}": '{...indicator_results...}' (JSON string)
 │       └─ FIELD "{instrument_key_2}": '{...indicator_results...}' (JSON string)
 │
 ├─ 📂 signals:
 │   │  // Temporary, ephemeral keys that function as a command queue.
 │   ├─ 🔑 signal:entry:{set_id}               (JSON)   // Command to enter a trade.
 │   └─ 🔑 signal:exit:{set_id}                (JSON)   // Command to exit a trade.
 │
 └─ 📂 stats:
     └─ 🔑 stats:daily:{set_id}                (Hash)   // Running counters for the current trading day.
```
---
