import React, { useState } from 'react';
import {
  ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity, DollarSign, Users, Target, Edit, ChevronRight
} from 'lucide-react';

interface MarketDataItem {
    id: number;
    type: 'stock' | 'option';
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }
  
  interface PnlData {
    realized: number;
    unrealized: number;
    totalCapital: number;
    capitalUsed: number;
    activeTrades: number;
    drawdown: number;
  }
  
  interface TradeAnalytics {
    winRate: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
  }
  
  interface Strategy {
    setId: string;
    name: string;
    pnl: number;
    activeTrade: boolean;
    strategyActive: boolean;
    type: 'Stock' | 'Option';
    tradesToday: number;
  }

interface DashboardProps {
  marketData: MarketDataItem[];
  pnlData: PnlData;
  tradeAnalytics: TradeAnalytics;
  strategies: Strategy[]; // This will now be controlled by the component's internal state
  systemHealth: Record<string, { status: string; latency: string }>;
  onEditCard: (cardId: number) => void;
  allStrategies: Record<string, Strategy[]>;
  onStrategyDisplayChange: (strategies: Strategy[]) => void; // This might become redundant but kept for prop consistency
}

const Dashboard: React.FC<DashboardProps> = ({
  marketData,
  pnlData,
  tradeAnalytics,
  systemHealth,
  onEditCard,
  allStrategies,
}) => {
    const [strategyFilter, setStrategyFilter] = useState('options');
    const [optionsPage, setOptionsPage] = useState(0);
    const STRATEGIES_PER_PAGE = 4;

    const handleStrategyFilterChange = (type: string) => {
        setStrategyFilter(type);
        setOptionsPage(0); // Reset page index when switching filters
    };

    const handleNextOptions = () => {
        const totalOptionPages = Math.ceil(allStrategies.options.length / STRATEGIES_PER_PAGE);
        setOptionsPage(prev => (prev + 1) % totalOptionPages);
    };

    const formatSetId = (setId: string): string => {
        const parts = setId.split('_');
        if (parts.length < 3) return setId;
        const type = parts[0] === 'S' ? 'Stock' : 'Option';
        const number = parseInt(parts[2], 10);
        return `${type} Set ${number}`;
    };

    const getVisibleStrategies = () => {
        if (strategyFilter === 'stocks') {
            return allStrategies.stocks.slice(0, 4);
        }
        const startIndex = optionsPage * STRATEGIES_PER_PAGE;
        const endIndex = startIndex + STRATEGIES_PER_PAGE;
        return allStrategies.options.slice(startIndex, endIndex);
    };

    const visibleStrategies = getVisibleStrategies();

    const renderMarketCard = (card: MarketDataItem) => {
    const isPositive = card.change >= 0;
    return (
      <div key={card.id} className="bg-white rounded-xl border border-slate-200 p-6 transition-all duration-200 hover:shadow-lg relative">
        <button
          onClick={() => onEditCard(card.id)}
          className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">{card.name}</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full capitalize">{card.type}</span>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-slate-900">{card.value.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div className="flex items-center gap-2">
            {isPositive ? <ArrowUp className="w-4 h-4 text-emerald-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />}
            <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{card.change.toFixed(2)} ({isPositive ? '+' : ''}{card.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    );
  };

    const renderMetricCard = (title: string, value: string, icon: React.ElementType, trend?: 'up' | 'down', trendValue?: string) => {
        const IconComponent = icon;
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-indigo-600" />
              </div>
              {trend && trendValue && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {trendValue}
                </div>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
              <div className="text-sm text-slate-600">{title}</div>
            </div>
          </div>
        );
      };
    
      const netPnL = pnlData.realized + pnlData.unrealized;
      const capitalUtilization = (pnlData.capitalUsed / pnlData.totalCapital) * 100;

  return (
    <div className="space-y-8">
      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {marketData.map(renderMarketCard)}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {renderMetricCard('Net P&L', `₹${netPnL.toLocaleString('en-IN')}`, DollarSign, netPnL >= 0 ? 'up' : 'down', `${((netPnL / pnlData.totalCapital) * 100).toFixed(2)}%`)}
        {renderMetricCard('Win Rate', `${tradeAnalytics.winRate}%`, Target, tradeAnalytics.winRate >= 60 ? 'up' : 'down', `${tradeAnalytics.winningTrades}/${tradeAnalytics.totalTrades}`)}
        {renderMetricCard('Active Trades', pnlData.activeTrades.toString(), Activity)}
        {renderMetricCard('Capital Usage', `${capitalUtilization.toFixed(1)}%`, Users, capitalUtilization <= 80 ? 'up' : 'down', `₹${pnlData.capitalUsed.toLocaleString('en-IN')}`)}
      </div>

      {/* Strategies Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Strategies Overview</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => handleStrategyFilterChange('stocks')} className={`px-3 py-1 text-sm rounded-md font-medium ${strategyFilter === 'stocks' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Stocks</button>
            <button onClick={() => handleStrategyFilterChange('options')} className={`px-3 py-1 text-sm rounded-md font-medium ${strategyFilter === 'options' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Options</button>
            {strategyFilter === 'options' && allStrategies.options.length > STRATEGIES_PER_PAGE && (
              <button onClick={handleNextOptions} className="p-2 text-slate-500 rounded-md hover:bg-slate-200 hover:text-indigo-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${strategyFilter === 'options' ? 'lg:grid-cols-4' : 'lg:grid-cols-4'} gap-4`}>
          {visibleStrategies.map(strategy => (
            <div key={strategy.setId} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
              <div>
                <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded">{formatSetId(strategy.setId)}</span>
                <h4 className="font-semibold text-slate-800 mt-2">{strategy.name}</h4>
              </div>
              <div>
                <p className="text-sm text-slate-600">P/L</p>
                <p className={`font-bold text-lg ${strategy.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {strategy.pnl >= 0 ? '+' : ''}₹{strategy.pnl.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex justify-between"><span>Position:</span> <span className={`font-medium ${strategy.activeTrade ? 'text-emerald-600' : 'text-slate-500'}`}>{strategy.activeTrade ? 'Active' : 'Inactive'}</span></div>
                <div className="flex justify-between"><span>Status:</span> <span className={`font-medium ${strategy.strategyActive ? 'text-emerald-600' : 'text-red-500'}`}>{strategy.strategyActive ? 'Active' : 'Paused'}</span></div>
                <div className="flex justify-between"><span>Type:</span> <span className="font-medium">{strategy.type}</span></div>
                <div className="flex justify-between"><span>Trades:</span> <span className="font-medium">{strategy.tradesToday}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Log and System Connections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Trade Executions</h3>
          <div className="text-center py-16 text-slate-500">
            <p>Live trade feed will appear here.</p>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">System Connections</h3>
          <div className="space-y-3">
            {Object.entries(systemHealth).map(([key, health]) => {
              const displayName = key === 'api' ? 'Main Broker API' : key.charAt(0).toUpperCase() + key.slice(1);
              const isConnected = health.status === 'connected';
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{displayName}</span>
                  <span className={`font-semibold ${isConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isConnected ? `Connected (${health.latency})` : 'Disconnected'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;