import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  status: 'OPEN' | 'CLOSED' | 'PARTIAL';
  pnl: number;
  strategy: string;
}

interface LiveMonitorProps {
  activeTrades: Trade[];
  isLiveTrading: boolean;
  onToggleLiveTrading: () => void;
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({
  activeTrades,
  isLiveTrading,
  onToggleLiveTrading
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTradeSideColor = (side: string) => {
    return side === 'BUY' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-50';
      case 'CLOSED': return 'text-slate-600 bg-slate-50';
      case 'PARTIAL': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Trading Control Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">Live Trading Monitor</h2>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isLiveTrading ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isLiveTrading ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`} />
              <span className="text-sm font-medium">
                {isLiveTrading ? 'Live Trading' : 'Trading Paused'}
              </span>
            </div>
            <button
              onClick={onToggleLiveTrading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLiveTrading 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isLiveTrading ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Trading
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Trading
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">Active Trades</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {activeTrades.filter(t => t.status === 'OPEN').length}
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-600">Winning</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {activeTrades.filter(t => t.pnl > 0).length}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">Losing</span>
            </div>
            <div className="text-2xl font-bold text-red-700">
              {activeTrades.filter(t => t.pnl < 0).length}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">Total P&L</span>
            </div>
            <div className={`text-2xl font-bold ${
              activeTrades.reduce((sum, trade) => sum + trade.pnl, 0) >= 0 
                ? 'text-emerald-700' : 'text-red-700'
            }`}>
              ₹{activeTrades.reduce((sum, trade) => sum + trade.pnl, 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Active Trades Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Active Trades</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {activeTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No active trades
                  </td>
                </tr>
              ) : (
                activeTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{trade.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTradeSideColor(trade.side)}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {trade.quantity.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      ₹{trade.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trade.status)}`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {trade.strategy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                      {trade.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;