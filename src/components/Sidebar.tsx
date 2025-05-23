import { MessageSquare, Settings, Shield, Plug } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: 'connections' | 'configuration' | 'logs') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'connections', label: 'Connections', icon: Plug },
    { id: 'configuration', label: 'Messages', icon: MessageSquare },
    { id: 'logs', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">WAZZAP</h1>
            <p className="text-xs text-gray-500">WhatsApp Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = item.id === 'connections' && activeTab === 'connections';
            const Icon = item.icon;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (item.id === 'connections') onTabChange('connections');
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">admin@wazzap.mx</p>
          </div>
        </div>
      </div>
    </div>
  );
}
