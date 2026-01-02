# source/utilities/data_models.py

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Union, Optional
from enum import Enum

# =============================================================================
# ENUMS
# =============================================================================

class AssetType(str, Enum):
    OPTIONS = "options"
    STOCKS = "stocks"

class TradeMode(str, Enum):
    PAPER = "paper"
    LIVE = "live"
    
class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"

class ProductType(str, Enum):
    INTRADAY = "INTRADAY"
    DELIVERY = "DELIVERY"

class OptionType(str, Enum):
    CE = "CE"
    PE = "PE"

class TradeType(str, Enum):
    BUY = "Buy"
    SELL = "Sell"

class StrikeSelection(str, Enum):
    ATM = "ATM"
    ITM = "ITM"
    OTM = "OTM"
    CUSTOM = "Custom"
    
class LogicGate(str, Enum):
    FIRST = "FIRST"
    AND = "AND"
    OR = "OR"

# =============================================================================
# STRATEGY SUB-MODELS
# =============================================================================

class SetConfig(BaseModel):
    set_id: str
    set_name: str
    description: str
    set_active_status: bool
    
class RiskManagementConfig(BaseModel):
    max_trades_per_day: int
    max_loss_per_day_absolute: float
    max_loss_per_trade_percentage: float

class InstrumentStock(BaseModel):
    name: str
    quantity: int

class InstrumentConfigStocks(BaseModel):
    stocks: List[InstrumentStock] = []

class InstrumentConfigOptions(BaseModel):
    underlying_symbol: str
    underlying_key: str
    option_type: OptionType
    trade_type: TradeType
    expiry: str
    strike_selection: StrikeSelection
    strike_offset: int = 0
    custom_strike_value: Optional[str] = None

class TradeParameters(BaseModel):
    order_type: OrderType
    product_type: ProductType
    quantity_type: str
    quantity_value: int
    trade_mode: TradeMode
    bypass_order_confirmation: bool
    broker: str

class EntryConfig(BaseModel):
    start_time: str
    end_time: str
    exclude_time_active: bool
    exclusion_start_time: str
    exclusion_end_time: str
    entry_check_interval: int
    chart_type: str
    time_frame: str
    
class StopLossConfig(BaseModel):
    active: bool
    type: str
    value: float

class TargetProfitConfig(BaseModel):
    active: bool
    type: str
    value: float
    
class TimeBasedExitConfig(BaseModel):
    active: bool
    type: str
    fixed_exit_time: str
    from_entry_time: str

class ExitConfig(BaseModel):
    exit_check_interval: int
    chart_type: str
    time_frame: str
    stop_loss: StopLossConfig
    target_profit: TargetProfitConfig
    time_based_exit: TimeBasedExitConfig

class Indicator(BaseModel):
    id: str
    type: str
    name: str
    logic: LogicGate
    active: bool
    parameters: Dict[str, Union[int, float, str]]
    active_condition: str

# =============================================================================
# TOP-LEVEL STRATEGY MODEL
# =============================================================================

class Strategy(BaseModel):
    id: str = Field(..., alias="_id")
    asset_type: AssetType
    set_config: SetConfig
    instrument_config: Union[InstrumentConfigOptions, InstrumentConfigStocks]
    trade_parameters: TradeParameters
    entry_config: EntryConfig
    exit_config: ExitConfig
    entry_indicators: List[Indicator]
    exit_indicators: List[Indicator]

    class Config:
        validate_by_name = True # Updated from allow_population_by_field_name
        
    @validator('instrument_config', pre=True, always=True)
    def check_instrument_config_type(cls, v, values):
        asset_type = values.get('asset_type')
        if asset_type == AssetType.OPTIONS:
            return InstrumentConfigOptions(**v)
        elif asset_type == AssetType.STOCKS:
            return InstrumentConfigStocks(**v)
        raise ValueError("Invalid asset_type for instrument_config validation")

# =============================================================================
# SYSTEM CONFIG MODEL
# =============================================================================

class RedisConfig(BaseModel):
    host: str
    port: int
    db: int

class MongoDBConfig(BaseModel):
    uri: str
    database_name: str
    
class UpstoxCredentials(BaseModel):
    api_key: str
    secret_key: str
    redirect_uri: str  
    totp_key: str
    mobile_no: str
    pin: str

class SystemSettings(BaseModel):
    log_level: str
    max_websocket_reconnect_attempts: int

class SystemConfig(BaseModel):
    redis_config: RedisConfig
    mongodb_config: MongoDBConfig
    upstox_credentials: UpstoxCredentials
    system_settings: SystemSettings