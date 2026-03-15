import React, { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Config from './pages/Config.jsx';
import BotStatus from './components/BotStatus.jsx';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'config', label: 'Configurar Bot', icon: '⚙️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            🤖 WhatsApp Bot <span className="text-green-400">Business</span>
          </h1>
          <BotStatus />
        </div>
      </header>

      {/* Nav */}
      <nav className="border-b border-white/10 px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-green-400 text-green-400'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'config' && <Config />}
      </main>
    </div>
  );
}
