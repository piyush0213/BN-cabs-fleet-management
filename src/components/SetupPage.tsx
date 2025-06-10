import React, { useState, useEffect } from 'react';
import { Car, User, Home, Key, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { getVehicles, saveVehicles, getDrivers, saveDrivers, getUsers, saveUsers } from '../utils/storage';
import { Vehicle, Driver, User as UserType } from '../types';

const SetupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers' | 'room' | 'pins'>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState({ number: '', type: '', assignedDriver: '' });

  useEffect(() => {
    setVehicles(getVehicles());
    setDrivers(getDrivers());
    setUsers(getUsers());
  }, []);

  // Vehicle Management
  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVehicle: Vehicle = {
      id: editingVehicle ? editingVehicle.id : Date.now().toString(),
      ...vehicleForm
    };

    const updatedVehicles = editingVehicle
      ? vehicles.map(v => v.id === editingVehicle.id ? newVehicle : v)
      : [...vehicles, newVehicle];

    saveVehicles(updatedVehicles);
    setVehicles(updatedVehicles);
    
    setVehicleForm({ number: '', type: '', assignedDriver: '' });
    setShowVehicleForm(false);
    setEditingVehicle(null);
    alert(editingVehicle ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleForm(vehicle);
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
      saveVehicles(updatedVehicles);
      setVehicles(updatedVehicles);
      alert('Vehicle deleted successfully!');
    }
  };

  // Room Rent Management
  const handleRoomRentToggle = (driverId: string) => {
    const updatedDrivers = drivers.map(driver => 
      driver.id === driverId 
        ? { ...driver, roomRent: !driver.roomRent }
        : driver
    );
    saveDrivers(updatedDrivers);
    setDrivers(updatedDrivers);
  };

  // PIN Management
  const handlePinUpdate = (userId: string, newPin: string) => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, pin: newPin } : user
    );
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    alert('PIN updated successfully!');
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Setup</h2>
          <p className="text-sm text-gray-600 mt-1">Manage vehicles, drivers, and system settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Vehicle Assignment</span>
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'drivers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span>View Driver Details</span>
            </button>
            <button
              onClick={() => setActiveTab('room')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'room'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Room Allocation</span>
            </button>
            <button
              onClick={() => setActiveTab('pins')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'pins'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Driver Login PINs</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'vehicles' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Vehicle Assignment</h3>
                <button
                  onClick={() => {
                    setShowVehicleForm(true);
                    setEditingVehicle(null);
                    setVehicleForm({ number: '', type: '', assignedDriver: '' });
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Vehicle Number</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Assigned Driver</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{vehicle.number}</td>
                        <td className="px-4 py-3">{vehicle.type}</td>
                        <td className="px-4 py-3">{vehicle.assignedDriver || 'Unassigned'}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {vehicles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No vehicles added yet. Click "Add Vehicle" to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Driver Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((driver) => (
                  <div key={driver.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{driver.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        driver.dlStatus === 'Verified' ? 'bg-green-100 text-green-800' : 
                        driver.dlStatus === 'Rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {driver.dlStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Mobile:</span>
                        <span className="ml-2 font-medium">{driver.mobile}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium">{driver.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">DL Number:</span>
                        <span className="ml-2 font-medium">{driver.dlNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Room Rent:</span>
                        <span className="ml-2 font-medium">{driver.roomRent ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {drivers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No drivers registered yet. Go to Joining Form to add drivers.
                </div>
              )}
            </div>
          )}

          {activeTab === 'room' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Room Allocation (₹50/day)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Driver Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Mobile</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Room Rent</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{driver.name}</td>
                        <td className="px-4 py-3">{driver.mobile}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            driver.roomRent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {driver.roomRent ? 'Yes (₹50/day)' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRoomRentToggle(driver.id)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              driver.roomRent 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {driver.roomRent ? 'Remove' : 'Assign'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {drivers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No drivers registered yet. Go to Joining Form to add drivers.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pins' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Driver Login PINs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Driver Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Username</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Current PIN</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">New PIN</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.filter(user => user.role === 'driver').map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3">{user.username}</td>
                        <td className="px-4 py-3">****</td>
                        <td className="px-4 py-3">
                          <input
                            type="password"
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const newPin = (e.target as HTMLInputElement).value;
                                handlePinUpdate(user.id, newPin);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="Enter 4-digit PIN"]`) as HTMLInputElement;
                              if (input && input.closest('tr') === document.querySelector(`tr:has(td:contains("${user.name}"))`)) {
                                handlePinUpdate(user.id, input.value);
                                input.value = '';
                              }
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-medium"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.filter(user => user.role === 'driver').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No driver accounts found. Driver accounts are created automatically when adding drivers in Joining Form.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Form Modal */}
      {showVehicleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button
                onClick={() => setShowVehicleForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleForm.number}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, number: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., KA01AB1234"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="MPV">MPV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Driver</label>
                <select
                  value={vehicleForm.assignedDriver}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, assignedDriver: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.name}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVehicleForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingVehicle ? 'Update' : 'Add'} Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupPage;