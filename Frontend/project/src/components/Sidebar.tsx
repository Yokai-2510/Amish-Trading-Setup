// src/components/Sidebar.tsx
import React from 'react';
import { 
  Home, TrendingUp, Monitor, Cloud, FileText, TestTube, Settings, User, Activity, BarChart3
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'strategies', label: 'Strategies', icon: TrendingUp, badge: '4' },
    { id: 'monitor', label: 'Live Monitor', icon: Monitor },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'connections', label: 'Connections', icon: Cloud },
    { id: 'logs', label: 'System Logs', icon: FileText },
    { id: 'backtesting', label: 'Backtesting', icon: TestTube },
    { id: 'alerts', label: 'Alerts', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="w-[260px] bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">TradingBot</h1>
            <p className="text-xs text-slate-500">Pro Console</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.id === activeSection;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-200 text-sm group ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                  isActive 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 bg-emerald-50/80 rounded-lg">
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800">System Online</p>
            <p className="text-xs text-emerald-700">All services running</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;