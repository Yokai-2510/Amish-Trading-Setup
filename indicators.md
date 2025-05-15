This document provides a concise overview of the technical indicator modules available in the system.

---
## 1. Moving Average (MA)

-   **Module**: `MA.py`
-   **Calculates**: Simple (SMA), Exponential (EMA), or Weighted (WMA) Moving Average. Can also calculate a second, smoothed MA for crossover signals.
-   **Key Parameters (JSON)**:
    -   `ma_length`: Period for the primary MA.
    -   `source_data`: Price field to use (close, open, high, low, hl2, hlc3, ohlc4).
    -   `offset`: Shifts the MA line.
    -   `smoothing_method`: "SMA", "EMA", "WMA" for the primary MA.
    -   `smoothed_ma_length`: Period for the second MA (for MA cross MA signals).
    -   `smoothed_ma_method`: Smoothing method for the second MA.
-   **Output Fields (in Redis `calculated_indicators`)**:
    -   `primary_ma_value_t1`: Value of the primary MA on the last completed candle.
    -   `smoothed_ma_value_t1_cond5`: Value of the smoothed MA (if used by active condition).
    -   `live_ltp_used`: LTP if used for a cross condition.
    -   `close_t1_used`: Closing price of the last candle.
-   **Conditions (`active_condition`)**:
    -   **Entry**:
        -   `1`: Price (LTP/Close) crosses above MA.
        -   `2`: Candle closes above MA.
        -   `3`: Two consecutive candles close above MA.
        -   `4`: Two consecutive candles close above MA, and last close > previous close.
        -   `5`: Primary MA crosses above Smoothed MA.
    -   **Exit**:
        -   `1`: Price (LTP/Close) crosses below MA.
        -   `2`: Candle closes below MA.
        -   `3`: Two consecutive candles close below MA.
        -   `4`: Two consecutive candles close below MA, and last close < previous close.
        -   `5`: Primary MA crosses below Smoothed MA.

---

## 2. Relative Strength Index (RSI)

-   **Module**: `RSI.py`
-   **Calculates**: Relative Strength Index and an optional smoothed Moving Average of the RSI.
-   **Key Parameters (JSON)**:
    -   `rsi_length`: Period for RSI calculation.
    -   `smoothing_method`: "SMA", "EMA", "WMA" for the MA of RSI.
    -   `smoothing_length`: Period for the MA of RSI.
    -   `threshold_value`: Level for RSI comparison (e.g., 30, 70).
-   **Output Fields**:
    -   `rsi_value_t1`: RSI value of the last completed candle.
    -   `smoothed_rsi_ma_value_t1_cond1`: Value of the smoothed RSI MA (if used).
    -   `threshold_value_used`: The threshold value applied.
-   **Conditions (`active_condition`)**:
    -   **Entry**:
        -   `1`: RSI crosses above its Smoothed MA.
        -   `2`: RSI > `threshold_value`.
        -   `3`: RSI < `threshold_value`.
    -   **Exit**:
        -   `1`: RSI crosses below its Smoothed MA.
        -   `2`: RSI < `threshold_value`.
        -   `3`: RSI > `threshold_value`.

---

## 3. Stochastic RSI (StochRSI)

-   **Module**: `Stoch_RSI.py`
-   **Calculates**: Stochastic RSI (%K and %D lines) from an RSI series.
-   **Key Parameters (JSON)**:
    -   `rsi_length`: Period for the underlying RSI.
    -   `stoch_length`: Period for the Stochastic calculation on RSI.
    -   `k_smoothing_period`: Smoothing period for %K (usually SMA).
    -   `d_smoothing_period`: Smoothing period for %D (usually SMA of %K).
    -   `d_smoothing_method`: "SMA", "EMA", "WMA" for %D smoothing.
    -   `k_threshold_value`: Level for %K comparison.
-   **Output Fields**:
    -   `percent_k_value_t1`: %K value of the last completed candle.
    -   `percent_d_value_t1`: %D value of the last completed candle.
    -   `k_threshold_value_used`: The threshold value applied to %K.
-   **Conditions (`active_condition`)**:
    -   **Entry**:
        -   `1`: %K crosses above %D.
        -   `2`: %K > `k_threshold_value`.
        -   `3`: %K < `k_threshold_value`.
        -   `4`: %K == `k_threshold_value`.
    -   **Exit**:
        -   `1`: %K crosses below %D.
        -   `2`: %K < `k_threshold_value`.
        -   `3`: %K > `k_threshold_value`.
        -   `4`: %K == `k_threshold_value`.

---

## 4. Moving Average Convergence Divergence (MACD)

-   **Module**: `MACD.py`
-   **Calculates**: MACD Line, Signal Line, and Histogram.
-   **Key Parameters (JSON)**:
    -   `fast_ema_length`: Period for the fast EMA.
    -   `slow_ema_length`: Period for the slow EMA.
    -   `source_data`: Price field for EMAs (close, open, etc.).
    -   `signal_line_length`: Period for the Signal Line EMA (of MACD Line).
-   **Output Fields**:
    -   `macd_value_t1`: MACD Line value.
    -   `signal_value_t1`: Signal Line value.
    -   `histogram_value_t1`: Histogram value.
-   **Conditions (`active_condition`)**:
    -   **Entry**:
        -   `1`: MACD Line crosses above Signal Line.
        -   `2`: Two consecutive positive Histogram bars.
        -   `3`: MACD Line is above zero.
    -   **Exit**:
        -   `1`: MACD Line crosses below Signal Line.
        -   `2`: Two consecutive negative Histogram bars.
        -   `3`: MACD Line crosses below zero.

---

## 5. Bollinger Bands (BB)

-   **Module**: `BB.py`
-   **Calculates**: Upper Band, Middle Band (MA), and Lower Band.
-   **Key Parameters (JSON)**:
    -   `ma_length`: Period for the Middle Band MA.
    -   `moving_average_type`: "SMA", "EMA", "WMA" for the Middle Band.
    -   `standard_deviation_multiplier`: Multiplier for standard deviation to calculate bands.
-   **Output Fields**:
    -   `upper_band_t1`, `middle_band_t1`, `lower_band_t1`: Values of the bands.
    -   `live_ltp_used_for_event`: LTP if used for a cross/touch condition.
-   **Conditions (`active_condition`)**:
    -   **Entry**:
        -   `1`: Price (LTP/Close) crosses above Middle Band.
        -   `2`: Candle closes above Middle Band.
        -   `3`: Two consecutive candles close above Middle Band.
    -   **Exit**:
        -   `1`: Price (LTP/Close) crosses below Middle Band.
        -   `2`: Candle closes below Middle Band.
        -   `3`: Two consecutive red candles close below Middle Band.
        -   `4`: Price (LTP/High) touches/crosses Upper Band.

---

## 6. Average Directional Index (ADX)

-   **Module**: `ADX.py`
-   **Calculates**: ADX, +DI (Positive Directional Indicator), -DI (Negative Directional Indicator).
-   **Key Parameters (JSON)**:
    -   `adx_smoothing_period`: Smoothing period for ADX.
    -   `di_length`: Period for +DI and -DI calculation.
    -   `adx_threshold_value`: Level for ADX comparison.
-   **Output Fields**:
    -   `adx_value_t1`: ADX value.
    -   `plus_di_value_t1`: +DI value.
    -   `minus_di_value_t1`: -DI value.
    -   `threshold_value_used`: The ADX threshold applied.
-   **Conditions (`active_condition`)**:
    -   **Entry/Exit**:
        -   `1`: ADX > `adx_threshold_value`.
        -   `2`: ADX < `adx_threshold_value`.
        -   `3`: ADX == `adx_threshold_value`.

---

## 7. Supertrend

-   **Module**: `Supertrend.py`
-   **Calculates**: Supertrend line and its current direction (uptrend/downtrend).
-   **Key Parameters (JSON)**:
    -   `atr_length`: Period for ATR calculation.
    -   `multiplier_factor`: Multiplier for ATR to determine band offset.
-   **Output Fields**:
    -   `supertrend_value_t1`: Value of the Supertrend line.
    -   `supertrend_direction_t1`: Direction (1 for uptrend, -1 for downtrend).
    -   `close_price_t1_used`: Closing price of the last candle.
    -   `live_ltp_used`: LTP if used for a cross condition.
-   **Conditions (`active_condition`)**:
    -   **Entry**:
        -   `1`: Supertrend indicates an upward trend (`supertrend_direction_t1 == 1`).
        -   `2`: Candle closes above Supertrend line (implies uptrend).
        -   `3` (Optional, if implemented for LTP): LTP crosses above Supertrend line.
    -   **Exit**:
        -   `1`: Supertrend indicates a downward trend (`supertrend_direction_t1 == -1`).
        -   `2`: Price (LTP/Close) crosses below Supertrend line.
        -   `3`: Candle closes below Supertrend line (implies downtrend).

---

## 8. Volume Analysis

-   **Module**: `VolumeAnalysis.py`
-   **Calculates**: Moving Average of Volume.
-   **Key Parameters (JSON)**:
    -   `volume_ma_length`: Period for the Volume MA.
    -   `smoothing_method`: "SMA", "EMA", "WMA" for Volume MA.
    -   `upward_threshold_value` (%): For Volume > X% of Volume MA.
    -   `downward_threshold_value` (%): For Volume < X% of Volume MA.
    -   `min_absolute_volume`, `max_absolute_volume`: For absolute volume range checks.
-   **Output Fields**:
    -   `volume_t1`: Raw volume of the last candle.
    -   `volume_ma_t1`: Volume MA value.
-   **Conditions (`active_condition`)**:
    -   **Entry/Exit**:
        -   `1`: Volume > `upward_threshold_value`% of Volume MA (Entry) / Volume < `downward_threshold_value`% of Volume MA (Exit).
        -   `2`: Volume < Volume MA (Entry) / Volume > Volume MA (Exit).
        -   `3`: Volume == Volume MA (Entry).
        -   `4`: Volume is between `min_absolute_volume` and `max_absolute_volume` (Entry) / Volume is NOT between specified min/max (Exit).

---

## 9. Fibonacci Levels

-   **Module**: `Fibonacci.py`
-   **Calculates**: Fibonacci retracement and extension levels based on *provided* swing high and swing low points.
-   **Key Parameters (JSON)**:
    -   `swing_high_price`: Price of the significant swing high. **(Must be provided)**
    -   `swing_low_price`: Price of the significant swing low. **(Must be provided)**
    -   `is_uptrend_swing` (boolean): `true` if the swing was Low-to-High, `false` if High-to-Low.
    -   `target_fib_level_key` (string): The specific Fib level to check against (e.g., "0.618", "1.618", "-0.236").
-   **Output Fields**:
    -   `fib_levels_calculated`: Dictionary of all calculated Fib level prices.
    -   `target_fib_level_key_used`: The `target_fib_level_key` from params.
    -   `target_fib_level_price`: The price of the target Fib level.
    -   `current_price_checked`: LTP or Close price used for comparison.
-   **Conditions (`active_condition`)**:
    -   **Entry**:
        -   `1`: Price (LTP/Close) crosses ABOVE `target_fib_level_price`.
        -   `3`: Price (LTP/Close) is currently ABOVE `target_fib_level_price`.
    -   **Exit**:
        -   `1`: Price (LTP/Close) crosses BELOW `target_fib_level_price`.
        -   `2`: Price (LTP/Close) crosses ABOVE `target_fib_level_price` (e.g., profit target).

---

## 10. Trend Analysis (Candle Patterns)

-   **Module**: `TrendAnalysis.py`
-   **Analyzes**: Sequences of consecutive up/down candles with closing conditions.
-   **Key Parameters (JSON)**:
    -   `uptrend_candles`: Number of consecutive uptrend candles for entry signal.
    -   `downtrend_candles`: Number of consecutive downtrend candles for exit signal.
-   **Output Fields**:
    -   `last_n_candles_checked`: Number of candles evaluated for the condition.
-   **Conditions (Implicit in Entry/Exit module call)**:
    -   **Entry**: `uptrend_candles` consecutive green candles, each closing above the previous candle's close.
    -   **Exit**: `downtrend_candles` consecutive red candles, each closing below the previous candle's close.

---

## 11. Commodity Channel Index (CCI) - Revised

-   **Module**: `CCI.py`
-   **Calculates**: Commodity Channel Index and an optional smoothed MA of the CCI.
-   **Key Parameters (JSON)**:
    -   `length`: Period for CCI calculation.
    -   `smoothing_line`: Method ("SMA", "EMA", "WMA") for MA of CCI.
    -   `smoothing_length`: Period for MA of CCI.
    -   `upper_limit`: Upper threshold for CCI comparison (e.g., 100).
    -   `lower_limit`: Lower threshold for CCI comparison (e.g., -100).
-   **Output Fields**:
    -   `cci_value_t1`: CCI value of the last completed candle.
    -   `smoothed_cci_value_t1`: Smoothed MA of CCI value.
    -   `limit_value_used`: The upper/lower limit applied in the condition.
-   **Conditions (`active_condition`)**:
    -   **Entry**:
        -   `1`: CCI crosses above its Smoothed MA.
        -   `2`: CCI > `upper_limit`.
        -   `3`: CCI < `upper_limit`.
        -   `4`: CCI crosses above `upper_limit`.
    -   **Exit**:
        -   `1`: CCI crosses below its Smoothed MA.
        -   `2`: CCI < `lower_limit`.
        -   `3`: CCI > `upper_limit`.
        -   `4`: CCI crosses below `upper_limit`.
        -   `5`: CCI crosses above `lower_limit`.

---
