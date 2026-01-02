
***

### **Document 1: Introduction**

**Purpose:** This document provides a high-level overview of the Trading Setup, its core philosophy, and its primary capabilities.

The Trading Setup is a powerful, event-driven platform designed for the creation, backtesting, and automated execution of algorithmic trading strategies for both the stocks and options markets.

	**Core Philosophy:**

*   **Parallelism & Independence:** The system is built to run multiple, distinct strategy "sets" simultaneously. Each set operates as an independent trading robot with its own configuration, rules, and P&L tracking.
*   **Deep Customization:** Every aspect of a strategy, from instrument selection and indicator parameters to risk management and execution logic, is fully configurable through a structured interface.
*   **Clarity and Control:** The design aims to provide a clear, unambiguous relationship between the user's configuration and the bot's behavior, giving the trader complete control over their automated systems.
*   **Analysis-Driven:** A core feature is a robust backtesting engine that allows for rigorous historical analysis of any strategy, ensuring data-driven decision-making before any capital is deployed.

***

### **Document 2: Strategy Configurations Overview**

**Purpose:** This document explains the hierarchical structure used to organize and manage all trading strategies within the system.

#### **Hierarchical Structure**

The system uses a four-level hierarchy to provide a clear and organized framework for strategy management.

```
Trading System
├── Group 1: Stocks
│   ├── Set 1
│   ├── Set 2
│   ├── Set 3
│   └── Set 4
└── Group 2: Options
    ├── Set 1
    ├── Set 2
    ...
    └── Set 8
```

1.  **Groups (Top Level):** The system is divided into two primary asset class groups: **Stocks** and **Options**. This provides the highest level of separation.
2.  **Sets (Second Level):** A "Set" is a complete, self-contained trading strategy. It includes everything from which instrument to trade to when to enter and exit. The system supports 4 parallel Stock Sets and 8 parallel Option Sets.
3.  **Categories (Third Level):** Within each Set, the configuration is broken down into 6 logical categories. This allows for a structured and intuitive editing experience.
4.  **Parameters/Customization (Fourth Level):** These are the individual fields and rules within each category that define the precise behavior of the strategy.

#### **Set Configuration Template**

Both Stocks and Options sets share a nearly identical configuration structure, ensuring a consistent user experience. The only difference is in the "Instrument" configuration category.

*   **Group 1 (Stocks) Set Configuration Categories:**
    1.  Set Configuration
    2.  **Stocks** Configurations
    3.  Entry Indicators
    4.  Exit Indicators
    5.  Entry Conditions
    6.  Exit Conditions
*   **Group 2 (Options) Set Configuration Categories:**
    1.  Set Configuration
    2.  **Options** Configurations
    3.  Entry Indicators
    4.  Exit Indicators
    5.  Entry Conditions
    6.  Exit Conditions

***

### **Document 3: Stocks Strategy Configuration**

**Purpose:** This document provides a detailed breakdown of all configurable parameters available for a **Stocks Strategy Set**.

#### **Category 1: Set Configurations**
*This section defines the identity, operational schedule, and performance of the strategy set.*
*   **Set Name:** A user-friendly name (e.g., "Nifty50 Momentum").
*   **Set Active Toggle:** The master On/Off switch for the entire set.
*   **Broker Selection:** The brokerage account this set will trade on.
*   **Start Time:** The time of day the set begins evaluating for new trade entries.
*   **End Time:** The time of day the set stops evaluating for new entries.
*   **Entry Conditions Refresh Interval:** Defines, in seconds, how frequently to check for a new trade.
*   **Exit Conditions Refresh Interval:** Defines, in seconds, how frequently to check an active position for an exit signal.

#### **Category 2: Stocks Configurations**
*This section defines the specific stocks the strategy will trade.*
*   **Trading Instruments:** A user-defined list where up to 30 individual stocks can be added.
*   **Quantity:** A default quantity can be set for all stocks, or specified individually for each stock.
*   **Collective Stocks Selection:** Pre-defined baskets of stocks can be added (e.g., "All Nifty 50 Stocks").

#### **Category 3 & 4: Entry & Exit Indicators**
*See "Indicator & Rule Engine Specification" document for full details.*
This section allows for the creation of a logical chain of indicator-based conditions using `AND`/`OR` gates to define the precise rules for entering or exiting a trade.

#### **Category 5: Entry Configuration**
*This section refines the timing and market context for entering a trade.*
*   **Entry Chart Type:** The chart on which Entry Indicators are calculated (`Candlestick`, `Heiken Ashi`, `Renko`).
*   **Entry Chart Time Frame:** The candle interval for the chart (`1m`, `5m`, `15m`, etc.).
*   **Entry Time Exclusion:** A specific window of time (From/To) during which the bot is forbidden from opening new positions.

#### **Category 6: Exit Configuration**
*This section defines the rules for closing an active position. An exit is triggered if **ANY** of these active conditions are met.*
*   **Exit Chart Type:** The chart settings for calculating Exit Indicators.
*   **Exit Chart Time Frame:** The candle interval for the exit chart.
*   **Stop Loss Setting:**
    *   **Type:** Exit based on absolute `Price` points or a `Percentage` of the entry price.
    *   **Value:** The specific point or percentage value for the stop loss.
    *   **Risk Limits:** `Max Stop Loss per Day` and `Max Stop Loss per Trade` (in absolute currency).
    *   **Time-Based Stop Loss:** Exits a trade if it has been open for a specified number of minutes.
*   **Target/Profit Setting:**
    *   **Type:** Exit based on absolute `Price` points or a `Percentage` of the entry price.
    *   **Value:** The specific point or percentage value for the profit target.

***

### **Document 4: Options Strategy Configuration**

**Purpose:** This document provides a detailed breakdown of all configurable parameters available for an **Options Strategy Set**.

#### **Category 1: Set Configurations**
*(Identical to Stocks Strategy Set)*

#### **Category 2: Options Configurations**
*This section defines the specific options contract the strategy will trade.*
*   **Option Index:** The underlying index to trade (`Nifty`, `Bank Nifty`).
*   **Option Type:** The contract type (`CE` - Call or `PE` - Put).
*   **Trade Type:** The action to open a position (`Buy` or `Sell`).
*   **Expiry:** The desired expiration date of the option contract.
*   **Strike Selection:** The logic for choosing the strike price:
    *   `ATM (At The Money)`: Selects the strike closest to the spot price.
    *   `ITM (In The Money)`: Selects a strike that is already profitable, based on a user-defined **OTM/ITM Strike Value** offset.
    *   `OTM (Out of The Money)`: Selects a strike that is not yet profitable, based on a user-defined **OTM/ITM Strike Value** offset.
*   **Lot Size:** The quantity to trade, defined in lots.

#### **Category 3 & 4: Entry & Exit Indicators**
*(Identical to Stocks Strategy Set. See "Indicator & Rule Engine Specification" document for full details.)*

#### **Category 5: Entry Configuration**
*(Identical to Stocks Strategy Set)*

#### **Category 6: Exit Configuration**
*(Identical to Stocks Strategy Set)*

***

### **Document 5: Indicator & Rule Engine Specification**

**Purpose:** This document provides a detailed overview of every technical indicator available in the system, including their parameters and the specific trigger conditions they support.

*(This section is a direct, complete inclusion of the detailed indicator documentation you provided.)*

#### **1. Moving Average (MA)**
*   **Module:** `MA.py`
*   **Calculates:** Simple (SMA), Exponential (EMA), or Weighted (WMA) Moving Average. Can also calculate a second, smoothed MA for crossover signals.
*   **Key Parameters:** `ma_length`, `source_data`, `offset`, `smoothing_method`, `smoothed_ma_length`, `smoothed_ma_method`.
*   **Conditions (`active_condition`):**
    *   **Entry:** `1`: Price crosses above MA, `2`: Candle closes above MA, `3`: Two consecutive candles close above MA, `4`: Two consecutive candles close above MA & last close > prev close, `5`: Primary MA crosses above Smoothed MA.
    *   **Exit:** `1`: Price crosses below MA, `2`: Candle closes below MA, `3`: Two consecutive candles close below MA, `4`: Two consecutive candles close below MA & last close < prev close, `5`: Primary MA crosses below Smoothed MA.

#### **2. Relative Strength Index (RSI)**
*   **Module:** `RSI.py`
*   **Calculates:** Relative Strength Index and an optional smoothed Moving Average of the RSI.
*   **Key Parameters:** `rsi_length`, `smoothing_method`, `smoothing_length`, `threshold_value`.
*   **Conditions (`active_condition`):**
    *   **Entry:** `1`: RSI crosses above its Smoothed MA, `2`: RSI > `threshold_value`, `3`: RSI < `threshold_value`.
    *   **Exit:** `1`: RSI crosses below its Smoothed MA, `2`: RSI < `threshold_value`, `3`: RSI > `threshold_value`.

#### **3. Stochastic RSI (StochRSI)**
*   **Module:** `Stoch_RSI.py`
*   **Calculates:** Stochastic RSI (%K and %D lines) from an RSI series.
*   **Key Parameters:** `rsi_length`, `stoch_length`, `k_smoothing_period`, `d_smoothing_period`, `d_smoothing_method`, `k_threshold_value`.
*   **Conditions (`active_condition`):**
    *   **Entry:** `1`: %K crosses above %D, `2`: %K > `k_threshold_value`, `3`: %K < `k_threshold_value`, `4`: %K == `k_threshold_value`.
    *   **Exit:** `1`: %K crosses below %D, `2`: %K < `k_threshold_value`, `3`: %K > `k_threshold_value`, `4`: %K == `k_threshold_value`.

#### **4. Moving Average Convergence Divergence (MACD)**
*   **Module:** `MACD.py`
*   **Calculates:** MACD Line, Signal Line, and Histogram.
*   **Key Parameters:** `fast_ema_length`, `slow_ema_length`, `source_data`, `signal_line_length`.
*   **Conditions (`active_condition`):**
    *   **Entry:** `1`: MACD Line crosses above Signal Line, `2`: Two consecutive positive Histogram bars, `3`: MACD Line is above zero.
    *   **Exit:** `1`: MACD Line crosses below Signal Line, `2`: Two consecutive negative Histogram bars, `3`: MACD Line crosses below zero.

#### **5. Bollinger Bands (BB)**
*   **Module:** `BB.py`
*   **Calculates:** Upper Band, Middle Band (MA), and Lower Band.
*   **Key Parameters:** `ma_length`, `moving_average_type`, `standard_deviation_multiplier`.
*   **Conditions (`active_condition`):**
    *   **Entry:** `1`: Price crosses above Middle Band, `2`: Candle closes above Middle Band, `3`: Two consecutive candles close above Middle Band.
    *   **Exit:** `1`: Price crosses below Middle Band, `2`: Candle closes below Middle Band, `3`: Two consecutive red candles close below Middle Band, `4`: Price touches/crosses Upper Band.

#### **6. Average Directional Index (ADX)**
*   **Module:** `ADX.py`
*   **Calculates:** ADX, +DI, and -DI.
*   **Key Parameters:** `adx_smoothing_period`, `di_length`, `adx_threshold_value`.
*   **Conditions (`active_condition`):** `1`: ADX > `adx_threshold_value`, `2`: ADX < `adx_threshold_value`, `3`: ADX == `adx_threshold_value`.

#### **7. Supertrend**
*   **Module:** `Supertrend.py`
*   **Calculates:** Supertrend line and its direction.
*   **Key Parameters:** `atr_length`, `multiplier_factor`.
*   **Conditions (`active_condition`):**
    *   **Entry:** `1`: Supertrend indicates an upward trend, `2`: Candle closes above Supertrend line, `3`: LTP crosses above Supertrend line.
    *   **Exit:** `1`: Supertrend indicates a downward trend, `2`: Price crosses below Supertrend line, `3`: Candle closes below Supertrend line.

#### **8. Volume Analysis**
*   **Module:** `VolumeAnalysis.py`
*   **Calculates:** Moving Average of Volume.
*   **Key Parameters:** `volume_ma_length`, `smoothing_method`, `upward_threshold_value` (%), `downward_threshold_value` (%), `min_absolute_volume`, `max_absolute_volume`.
*   **Conditions (`active_condition`):** `1`: Volume vs % of Volume MA, `2`: Volume vs Volume MA, `3`: Volume == Volume MA, `4`: Volume within absolute range.

#### **9. Fibonacci Levels**
*   **Module:** `Fibonacci.py`
*   **Calculates:** Retracement/extension levels based on user-provided swing points.
*   **Key Parameters:** `swing_high_price`, `swing_low_price`, `is_uptrend_swing`, `target_fib_level_key`.
*   **Conditions (`active_condition`):**
    *   **Entry:** `1`: Price crosses ABOVE target, `3`: Price is currently ABOVE target.
    *   **Exit:** `1`: Price crosses BELOW target, `2`: Price crosses ABOVE target (for profit taking).

#### **10. Trend Analysis (Candle Patterns)**
*   **Module:** `TrendAnalysis.py`
*   **Analyzes:** Sequences of consecutive up/down candles.
*   **Key Parameters:** `uptrend_candles`, `downtrend_candles`.
*   **Conditions:** Entry on `N` consecutive green candles closing higher; Exit on `N` consecutive red candles closing lower.

#### **11. Commodity Channel Index (CCI)**
*   **Module:** `CCI.py`
*   **Calculates:** Commodity Channel Index and an optional smoothed MA of the CCI.
*   **Key Parameters:** `length`, `smoothing_line`, `smoothing_length`, `upper_limit`, `lower_limit`.
*   **Conditions (`active_condition`):**
    *   **Entry:** `1`: CCI crosses above Smoothed MA, `2`: CCI > `upper_limit`, `3`: CCI < `upper_limit`, `4`: CCI crosses above `upper_limit`.
    *   **Exit:** `1`: CCI crosses below Smoothed MA, `2`: CCI < `lower_limit`, `3`: CCI > `upper_limit`, `4`: CCI crosses below `upper_limit`, `5`: CCI crosses above `lower_limit`.

***

### **Document 6: Backtesting & Analysis Specification**

**Purpose:** This document defines the functionality and principles of the backtesting engine.

*   **Core Functionality:** To simulate the performance of any saved strategy configuration against a specified range of historical market data.

*   **The Snapshot Principle:**
    *   **For Backtesting:** When a backtest is initiated, the system takes a **complete, immutable snapshot** of the *entire* strategy configuration at that moment. This snapshot is stored with the backtest results. This guarantees that the backtest is a scientifically repeatable experiment, unaffected by any subsequent changes to the live strategy.
    *   **For Live Trading:** When a **live trade is entered**, a snapshot of all relevant exit-related configurations (Stop Loss, Target Profit, and all Exit Indicators) is stored with the active position in Redis. The exit evaluation for that specific trade will refer to this snapshot, ensuring that live changes made to a strategy's exit rules **do not affect an already open position.**

*   **Inputs for a Backtest Run:**
    1.  The Strategy Set to be tested.
    2.  A `Start Date` for the simulation.
    3.  An `End Date` for the simulation.

*   **Output & Analysis Report:**
    *   Upon completion, the backtester saves a detailed, permanent report to the database.
    *   The UI will provide a dedicated section to view these reports, which will include:
        1.  **The Original Strategy Snapshot:** For full transparency and reproducibility.
        2.  **Summary Performance Metrics:** Total P&L, Win Rate, Max Drawdown, Profit Factor, Sharpe Ratio, Average trade duration, etc.
        3.  **Detailed Trade Log:** A complete, filterable list of every single simulated trade, including entry/exit timestamps, prices, P&L, and the specific indicator condition that triggered the entry/exit.