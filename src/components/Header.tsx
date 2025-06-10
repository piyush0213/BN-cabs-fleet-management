import React, { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { getCurrentUser, setCurrentUser, getDrivers } from '../utils/storage';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const currentUser = getCurrentUser();
  const drivers = getDrivers();
  const driverProfile = drivers.find(d => d.name === currentUser?.name);

  const handleLogout = () => {
    setCurrentUser(null);
    onLogout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">BN Cab's</h1>
          <p className="text-sm text-gray-600">Fleet Management System</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-medium text-gray-900">{currentUser?.name}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Profile</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Profile Information</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Name:</label>
                      <p className="font-medium">{currentUser?.name}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Role:</label>
                      <p className="font-medium capitalize">{currentUser?.role}</p>
                    </div>
                    {driverProfile && (
                      <>
                        <div>
                          <label className="text-gray-500">Mobile:</label>
                          <p className="font-medium">{driverProfile.mobile}</p>
                        </div>
                        <div>
                          <label className="text-gray-500">Email:</label>
                          <p className="font-medium">{driverProfile.email}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-gray-500">DL Number:</label>
                          <p className="font-medium">{driverProfile.dlNumber}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;