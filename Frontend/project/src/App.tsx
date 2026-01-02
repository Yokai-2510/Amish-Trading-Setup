import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LiveMonitor from './components/LiveMonitor';
import Connections from './components/Connections';
import SelectionModal from './components/SelectionModal';
import Strategies from './components/Strategies';

// --- INTERFACES ---

interface ConnectionStatus {
  status: 'authenticated' | 'not_authenticated' | 'connected' | 'disconnected' | 'error';
  lastChecked?: string;
}

interface BrokerCredentials {
  apiKey?: string;
  secretKey?: string;
  redirectUrl?: string;
  totpKey?: string;
  mobileNumber?: string;
  pin?: string;
  clientId?: string;
  clientPassword?: string;
  totp?: string; 
  userName?: string;
  password?: string;
  consumerKey?: string;
  consumerSecret?: string;
  neoFinKey?: string;
}

interface GoogleSheetsCredentials {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
}

interface MarketDataItem {
  id: number;
  type: 'stock' | 'option';
  name: string;
  value: number;
  change: number;
  changePercent: number;
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

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLiveTrading, setIsLiveTrading] = useState(false);

  // --- MOCK DATA & STATE ---

  const [marketData, setMarketData] = useState<MarketDataItem[]>([
    { id: 1, type: 'option', name: 'Nifty 50', value: 23420.5, change: 125.3, changePercent: 0.54 },
    { id: 2, type: 'stock', name: 'Reliance', value: 2950.75, change: -12.45, changePercent: -0.42 },
    { id: 3, type: 'option', name: 'BANKNIFTY', value: 245.50, change: 45.80, changePercent: 22.95 },
  ]);

  const [allStrategies] = useState<Record<string, Strategy[]>>({
    stocks: [
      { setId: 'S_SET_001', name: 'Stock Momentum', pnl: 1250, activeTrade: true, strategyActive: true, type: 'Stock', tradesToday: 5 },
      { setId: 'S_SET_002', name: 'Stock Swing', pnl: -450, activeTrade: false, strategyActive: true, type: 'Stock', tradesToday: 2 },
      { setId: 'S_SET_003', name: 'Stock Scalping', pnl: 2100, activeTrade: true, strategyActive: false, type: 'Stock', tradesToday: 12 },
      { setId: 'S_SET_004', name: 'Stock Value', pnl: 800, activeTrade: false, strategyActive: true, type: 'Stock', tradesToday: 1 },
    ],
    options: [
      { setId: 'O_SET_001', name: 'Nifty Scalp', pnl: 4250.5, activeTrade: true, strategyActive: true, type: 'Option', tradesToday: 15 },
      { setId: 'O_SET_002', name: 'Bank Nifty Swing', pnl: 2890.25, activeTrade: true, strategyActive: true, type: 'Option', tradesToday: 6 },
      { setId: 'O_SET_003', name: 'Options Straddle', pnl: -1240.75, activeTrade: false, strategyActive: false, type: 'Option', tradesToday: 4 },
      { setId: 'O_SET_004', name: 'Momentum Play', pnl: 1850.0, activeTrade: true, strategyActive: true, type: 'Option', tradesToday: 8 },
      { setId: 'O_SET_005', name: 'Expiry Hero', pnl: 7300, activeTrade: false, strategyActive: true, type: 'Option', tradesToday: 3 },
      { setId: 'O_SET_006', name: 'Iron Condor', pnl: -950, activeTrade: true, strategyActive: true, type: 'Option', tradesToday: 7 },
      { setId: 'O_SET_007', name: 'Credit Spread', pnl: 1500, activeTrade: false, strategyActive: true, type: 'Option', tradesToday: 2 },
      { setId: 'O_SET_008', name: 'Debit Spread', pnl: 650, activeTrade: true, strategyActive: false, type: 'Option', tradesToday: 9 },
    ],
  });

  const [displayedStrategies, setDisplayedStrategies] = useState<Strategy[]>(
    allStrategies.options.slice(0, 4)
  );

  // CORRECTED: Restored the actual data for these states
  const [pnlData] = useState({
    realized: 15420.50,
    unrealized: -2340.75,
    totalCapital: 500000,
    capitalUsed: 125000,
    activeTrades: 8,
    drawdown: -1.2
  });
    
  const [tradeAnalytics] = useState({
    winRate: 68.5,
    totalTrades: 147,
    winningTrades: 101,
    losingTrades: 46,
    profitFactor: 1.85,
    avgWin: 850.25,
    avgLoss: -420.75
  });

  const [systemHealth] = useState({
    api: { status: 'connected', latency: '12ms' },
    websocket: { status: 'connected', latency: '8ms' },
    redis: { status: 'connected', latency: '2ms' },
    mongodb: { status: 'connected', latency: '15ms' }
  });
    
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatus>>({
    upstox: { status: 'not_authenticated' },
    zerodha: { status: 'authenticated' },
    angelone: { status: 'error' },
    kotak: { status: 'not_authenticated' },
    redis: { status: 'connected' },
    mongodb: { status: 'connected' },
    googlesheets: { status: 'not_authenticated' }
  });
    
  const [credentials, setCredentials] = useState<Record<string, any>>({
    upstox: { apiKey: 'your_api_key_here', secretKey: 'your_secret_key_here', redirectUrl: 'https://127.0.0.1:8000', totpKey: '', mobileNumber: '9876543210', pin: '123456' },
    zerodha: { apiKey: 'your_api_key', secretKey: 'your_secret_key', clientId: 'AB1234', clientPassword: '', totp: '' },
    angelone: { userName: 'your_username', password: '', apiKey: 'your_api_key' },
    kotak: { consumerKey: 'your_consumer_key', consumerSecret: '', neoFinKey: 'your_neo_fin_key', mobileNumber: '9876543210', password: '' },
    googlesheets: { type: "service_account", project_id: "market-data-442900", private_key_id: "ecf23767fe44ee749272c9043a99f2786846cd52", private_key: "...", client_email: "market-data@market-data-442900.iam.gserviceaccount.com", client_id: "113691985281829850337", auth_uri: "https://accounts.google.com/o/oauth2/auth", token_uri: "https://oauth2.googleapis.com/token", auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs", client_x509_cert_url: "...", universe_domain: "googleapis.com" }
  });
    
  const [activeTrades] = useState([
    { id: 'T001', symbol: 'NIFTY2410023500CE', side: 'BUY' as const, quantity: 50, price: 245.50, timestamp: '10:25:30', status: 'OPEN' as const, pnl: 2250, strategy: 'Momentum Play' },
    { id: 'T002', symbol: 'BANKNIFTY2410050000PE', side: 'SELL' as const, quantity: 25, price: 180.75, timestamp: '10:18:45', status: 'OPEN' as const, pnl: -850, strategy: 'Options Straddle' },
    { id: 'T003', symbol: 'NIFTY50-EQ', side: 'BUY' as const, quantity: 100, price: 23415.00, timestamp: '09:45:12', status: 'PARTIAL' as const, pnl: 550, strategy: 'Nifty Scalping' }
  ]);
    
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  // --- HANDLERS & HELPERS ---

  const handleOpenModal = (cardId: number) => {
    setEditingCardId(cardId);
    setIsModalOpen(true);
  };

  const handleSaveChanges = (newItem: { type: 'stock' | 'option'; name: string }) => {
    if (editingCardId !== null) {
      setMarketData(prevData =>
        prevData.map(card =>
          card.id === editingCardId ? { ...card, type: newItem.type, name: newItem.name, value: Math.random() * 20000, change: (Math.random() - 0.5) * 200, changePercent: (Math.random() - 0.5) * 2, } : card
        )
      );
    }
  };

  const handleCredentialChange = (service: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [service]: { ...prev[service], [field]: value }
    }));
  };
    
  const handleSaveCredentials = (service: string) => {
    console.log(`Saving credentials for ${service}:`, credentials[service]);
    setTimeout(() => {
      setConnectionStatuses(prev => ({
        ...prev,
        [service]: { status: 'authenticated', lastChecked: new Date().toLocaleString() }
      }));
    }, 1000);
  };
    
  const handleTestConnection = (service: string) => {
    console.log(`Testing connection for ${service}`);
    setConnectionStatuses(prev => ({
      ...prev,
      [service]: { status: 'connected', lastChecked: new Date().toLocaleString() }
    }));
  };

  const getSectionTitle = () => {
    const section = activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
    switch (activeSection) {
        case 'dashboard': return 'System Dashboard';
        case 'monitor': return 'Live Trading Monitor';
        case 'strategies': return 'Trading Strategies';
        case 'analytics': return 'Performance Analytics';
        case 'connections': return 'Connection Management';
        default: return section;
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
        case 'dashboard': return 'Real-time overview of market data, P&L, and system health';
        case 'monitor': return 'Live monitoring of active trades and positions';
        case 'strategies': return 'Manage and configure trading strategies';
        case 'analytics': return 'Detailed performance analysis and reporting';
        case 'connections': return 'Configure broker APIs, databases, and integrations';
        default: return 'Manage your settings';
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard
            marketData={marketData}
            pnlData={pnlData}
            tradeAnalytics={tradeAnalytics}
            strategies={displayedStrategies}
            systemHealth={systemHealth}
            onEditCard={handleOpenModal}
            allStrategies={allStrategies}
            onStrategyDisplayChange={setDisplayedStrategies}
          />
        );
      case 'monitor':
        return (
          <LiveMonitor
            activeTrades={activeTrades}
            isLiveTrading={isLiveTrading}
            onToggleLiveTrading={() => setIsLiveTrading(!isLiveTrading)}
          />
        );
      case 'strategies':
        return <Strategies />;
      case 'connections':
        return (
          <Connections
            connectionStatuses={connectionStatuses}
            credentials={credentials}
            onCredentialChange={handleCredentialChange}
            onSaveCredentials={handleSaveCredentials}
            onTestConnection={handleTestConnection}
          />
        );
      default:
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚧</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{getSectionTitle()}</h3>
              <p className="text-slate-500 mb-6">This section is currently under development.</p>
              <button onClick={() => setActiveSection('dashboard')} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Back to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>TradingBot</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{getSectionTitle()}</h1>
              <p className="text-slate-600 mt-1">{getSectionDescription()}</p>
            </div>
            {activeSection === 'monitor' && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLiveTrading ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className={`text-sm font-medium ${isLiveTrading ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {isLiveTrading ? 'Live Trading Active' : 'Trading Paused'}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>

      <SelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveChanges}
        currentItem={marketData.find(c => c.id === editingCardId)}
      />
    </div>
  );
};

export default App;