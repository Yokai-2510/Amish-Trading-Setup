import React, { useState } from 'react';
import { 
  TrendingUp, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  TestTube,
  FileText
} from 'lucide-react';

interface ConnectionStatus {
  status: 'authenticated' | 'not_authenticated' | 'connected' | 'disconnected' | 'error';
  lastChecked?: string;
}

// Interface for all possible broker fields
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

// Interface for all Google Sheets fields from the JSON
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

interface ConnectionsProps {
  connectionStatuses: Record<string, ConnectionStatus>;
  credentials: Record<string, BrokerCredentials | GoogleSheetsCredentials>;
  onCredentialChange: (service: string, field: string, value: string) => void;
  onSaveCredentials: (service: string) => void;
  onTestConnection: (service: string) => void;
}

const Connections: React.FC<ConnectionsProps> = ({
  connectionStatuses,
  credentials,
  onCredentialChange,
  onSaveCredentials,
  onTestConnection
}) => {
  const [activeTab, setActiveTab] = useState('broker_apis');
  const [selectedBroker, setSelectedBroker] = useState<string>('upstox');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const brokers = [
    { id: 'upstox', name: 'Upstox', logo: 'UP', color: 'bg-orange-100 text-orange-700' },
    { id: 'zerodha', name: 'Zerodha', logo: 'ZE', color: 'bg-blue-100 text-blue-700' },
    { id: 'angelone', name: 'Angel One', logo: 'AO', color: 'bg-red-100 text-red-700' },
    { id: 'kotak', name: 'Kotak Securities', logo: 'KS', color: 'bg-green-100 text-green-700' }
  ];

  const tabs = [
    { id: 'broker_apis', label: 'Broker APIs', icon: TrendingUp },
    { id: 'google_sheets', label: 'Google Sheets', icon: FileText },
    { id: 'connections', label: 'Connections', icon: Database }
  ];

  const getBrokerFields = (brokerId: string) => {
    const fieldConfigs: Record<string, Array<{ key: keyof BrokerCredentials; label: string; type: string }>> = {
        upstox: [
            { key: 'apiKey', label: 'API Key', type: 'text' },
            { key: 'secretKey', label: 'Secret Key', type: 'password' },
            { key: 'redirectUrl', label: 'Redirect URL (RURL)', type: 'text' },
            { key: 'totpKey', label: 'TOTP Key', type: 'password' },
            { key: 'mobileNumber', label: 'Mobile Number', type: 'text' },
            { key: 'pin', label: 'PIN (6-digit)', type: 'password' },
        ],
        zerodha: [
            { key: 'apiKey', label: 'API Key', type: 'text' },
            { key: 'secretKey', label: 'Secret Key', type: 'password' },
            { key: 'clientId', label: 'Client ID', type: 'text' },
            { key: 'clientPassword', label: 'Client Password', type: 'password' },
            { key: 'totp', label: 'TOTP (6-digit App Code)', type: 'text' }
        ],
        angelone: [
            { key: 'userName', label: 'User Name', type: 'text' },
            { key: 'password', label: 'Password', type: 'password' },
            { key: 'apiKey', label: 'API Key', type: 'text' },
        ],
        kotak: [
            { key: 'consumerKey', label: 'Consumer Key', type: 'text' },
            { key: 'consumerSecret', label: 'Consumer Secret', type: 'password' },
            { key: 'neoFinKey', label: 'Neo Fin Key', type: 'text' },
            { key: 'mobileNumber', label: 'Mobile Number', type: 'text' },
            { key: 'password', label: 'Kotak Password', type: 'password' }
        ]
    };
    return fieldConfigs[brokerId] || [];
  };
  
  const getGoogleSheetFields = () => {
    return [
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'project_id', label: 'Project ID', type: 'text' },
      { key: 'private_key_id', label: 'Private Key ID', type: 'text' },
      { key: 'private_key', label: 'Private Key', type: 'textarea' },
      { key: 'client_email', label: 'Client Email', type: 'text' },
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'auth_uri', label: 'Auth URI', type: 'text' },
      { key: 'token_uri', label: 'Token URI', type: 'text' },
      { key: 'auth_provider_x509_cert_url', label: 'Auth Provider x509 Cert URL', type: 'text' },
      { key: 'client_x509_cert_url', label: 'Client x509 Cert URL', type: 'text' },
      { key: 'universe_domain', label: 'Universe Domain', type: 'text' },
    ];
  };

  const getStatusBadge = (status: ConnectionStatus['status']) => {
    const configs = {
      authenticated: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, text: 'Authenticated' },
      connected: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, text: 'Connected' },
      not_authenticated: { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: AlertCircle, text: 'Not Authenticated' },
      disconnected: { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: AlertCircle, text: 'Disconnected' },
      error: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, text: 'Error' }
    };
    
    const config = configs[status];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3.5 h-3.5" />
        {config.text}
      </span>
    );
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const renderCredentialForm = () => {
    const broker = brokers.find(b => b.id === selectedBroker);
    const fields = getBrokerFields(selectedBroker);
    const brokerCreds = credentials[selectedBroker] as BrokerCredentials || {};
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${broker?.color}`}>
              <span className="font-bold text-base">{broker?.logo}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{broker?.name}</h3>
              <p className="text-sm text-slate-500">API Configuration</p>
            </div>
          </div>
          {getStatusBadge(connectionStatuses[selectedBroker]?.status || 'not_authenticated')}
        </div>
        <div className="space-y-4 mb-6">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
              <div className="relative">
                <input
                  type={field.type === 'password' && !showPasswords[`${selectedBroker}-${field.key}`] ? 'password' : 'text'}
                  value={brokerCreds[field.key as keyof BrokerCredentials] || ''}
                  onChange={(e) => onCredentialChange(selectedBroker, field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
                {field.type === 'password' && (
                  <button type="button" onClick={() => togglePasswordVisibility(`${selectedBroker}-${field.key}`)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPasswords[`${selectedBroker}-${field.key}`] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {connectionStatuses[selectedBroker]?.lastChecked ? `Last checked: ${connectionStatuses[selectedBroker].lastChecked}` : 'Not yet checked.'}
          </p>
          <div className="flex gap-3">
            <button onClick={() => onSaveCredentials(selectedBroker)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => onTestConnection(selectedBroker)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium flex items-center justify-center gap-2 text-sm">
              <TestTube className="w-4 h-4" /> Test
            </button>
          </div>
        </div>
      </div>
    );
  };
  
    const renderGoogleSheetsForm = () => {
    const fields = getGoogleSheetFields();
    const googleSheetCreds = credentials.googlesheets as GoogleSheetsCredentials || {};
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Google Sheets API</h3>
              <p className="text-sm text-slate-500">For trade logging and reports</p>
            </div>
          </div>
          {getStatusBadge(connectionStatuses.googlesheets?.status || 'not_authenticated')}
        </div>
        <div className="space-y-4 mb-6">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={googleSheetCreds[field.key as keyof GoogleSheetsCredentials] || ''}
                  onChange={(e) => onCredentialChange('googlesheets', field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white min-h-[120px] text-xs font-mono"
                  placeholder={`Paste ${field.label.toLowerCase()}`}
                />
              ) : (
                <input
                  type={'text'}
                  value={googleSheetCreds[field.key as keyof GoogleSheetsCredentials] || ''}
                  onChange={(e) => onCredentialChange('googlesheets', field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-sm"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
            <button onClick={() => onSaveCredentials('googlesheets')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm">
                Integrate Google Sheets
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-slate-200 rounded-t-xl">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'broker_apis' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-sm font-medium text-slate-900 mb-4 px-1">Select Broker</h3>
            <div className="flex flex-col gap-2">
              {brokers.map((broker) => (
                <button key={broker.id} onClick={() => setSelectedBroker(broker.id)} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${selectedBroker === broker.id ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${broker.color}`}><span className="font-semibold text-sm">{broker.logo}</span></div>
                  <span className="font-medium text-slate-900 flex-1 text-sm">{broker.name}</span>
                  <div className={`w-2 h-2 rounded-full ${connectionStatuses[broker.id]?.status === 'authenticated' || connectionStatuses[broker.id]?.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3"><h3 className="text-sm font-medium text-slate-900 mb-4">Configuration</h3>{renderCredentialForm()}</div>
        </div>
      )}

      {activeTab === 'google_sheets' && (
        <div className="max-w-3xl mx-auto">
          {renderGoogleSheetsForm()}
        </div>
      )}
      
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3"><div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center"><Database className="w-6 h-6 text-red-600" /></div>
                <div><h3 className="font-semibold text-slate-900">Redis Cache</h3><p className="text-sm text-slate-500">In-memory data store</p></div>
              </div>
              {getStatusBadge(connectionStatuses.redis?.status || 'disconnected')}
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Host:</span><span className="text-slate-900 font-medium">localhost</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Port:</span><span className="text-slate-900 font-medium">6379</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Database:</span><span className="text-slate-900 font-medium">0</span></div>
            </div>
            <button onClick={() => onTestConnection('redis')} className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm">
              <TestTube className="w-4 h-4" /> Test Connection
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3"><div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center"><Database className="w-6 h-6 text-green-600" /></div>
                <div><h3 className="font-semibold text-slate-900">MongoDB</h3><p className="text-sm text-slate-500">Document database</p></div>
              </div>
              {getStatusBadge(connectionStatuses.mongodb?.status || 'disconnected')}
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Host:</span><span className="text-slate-900 font-medium">localhost</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Port:</span><span className="text-slate-900 font-medium">27017</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Database:</span><span className="text-slate-900 font-medium">trading_bot</span></div>
            </div>
            <button onClick={() => onTestConnection('mongodb')} className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm">
              <TestTube className="w-4 h-4" /> Test Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;