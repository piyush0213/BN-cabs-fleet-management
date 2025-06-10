import React, { useState, useEffect } from 'react';
import { Car, Database, Calendar, Settings, UserPlus, BarChart3 } from 'lucide-react';
import Login from './components/Login';
import Header from './components/Header';
import EntryPage from './components/EntryPage';
import DatabasePage from './components/DatabasePage';
import WeeklySummaryPage from './components/WeeklySummaryPage';
import SetupPage from './components/SetupPage';
import JoiningFormPage from './components/JoiningFormPage';
import SummaryPage from './components/SummaryPage';
import { getCurrentUser } from './utils/storage';

function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('entry');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('entry');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'entry', label: 'Entry', icon: Car },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'weekly', label: 'Weekly Summary', icon: Calendar },
    ...(currentUser.role === 'admin' ? [
      { id: 'setup', label: 'Setup', icon: Settings },
      { id: 'joining', label: 'Joining Form', icon: UserPlus },
      { id: 'summary', label: 'Summary', icon: BarChart3 }
    ] : [])
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'entry':
        return <EntryPage />;
      case 'database':
        return <DatabasePage />;
      case 'weekly':
        return currentUser.role === 'admin' ? <WeeklySummaryPage /> : <div className="p-6 text-center text-gray-500">Access denied</div>;
      case 'setup':
        return <SetupPage />;
      case 'joining':
        return <JoiningFormPage />;
      case 'summary':
        return <SummaryPage />;
      default:
        return <EntryPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-full">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;