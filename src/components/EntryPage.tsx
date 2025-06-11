import React, { useState, useEffect } from 'react';
import { Save, Share2, Calendar, Car, User } from 'lucide-react';
import { getDrivers, getVehicles, getEntries, saveEntries, getCurrentUser } from '../utils/storage';
import { calculatePayPercent, calculateSalary, calculatePayable, calculateCommission, calculatePL, getRoomRent, formatCurrency } from '../utils/calculations';
import { Entry, Driver, Vehicle } from '../types';

const EntryPage: React.FC = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    driver: '',
    vehicle: '',
    earnings: 0,
    cashCollection: 0,
    offlineEarnings: 0,
    offlineCash: 0,
    trips: 0,
    toll: 0,
    cng: 0,
    petrol: 0,
    otherExpenses: 0,
    loginHours: 0,
    openingBalance: 0
  });

  const [calculations, setCalculations] = useState({
    roomRent: 0,
    payPercent: 0,
    salary: 0,
    payable: 0,
    commission: 0,
    pl: 0
  });

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const currentUser = getCurrentUser();

  useEffect(() => {
    setDrivers(getDrivers());
    setVehicles(getVehicles());
  }, []);

  useEffect(() => {
    const roomRent = getRoomRent(formData.driver, drivers);
    const payPercent = calculatePayPercent(formData.earnings, formData.offlineEarnings, formData.loginHours);
    const salary = calculateSalary(formData.earnings, formData.offlineEarnings, payPercent);
    const payable = calculatePayable(
      formData.earnings,
      formData.offlineEarnings,
      formData.cashCollection,
      formData.offlineCash,
      salary,
      formData.cng,
      formData.petrol,
      formData.otherExpenses,
      formData.openingBalance,
      roomRent
    );
    const commission = calculateCommission(formData.cashCollection, formData.earnings);
    const pl = calculatePL(
      formData.earnings,
      formData.offlineEarnings,
      salary,
      formData.cng,
      formData.toll,
      formData.petrol,
      formData.otherExpenses
    );

    setCalculations({
      roomRent,
      payPercent,
      salary,
      payable,
      commission,
      pl
    });
  }, [formData, drivers]);

  const handleDriverSelect = (driverName: string) => {
    setFormData(prev => ({ ...prev, driver: driverName }));
    setDriverSearch(driverName);
    setShowDriverDropdown(false);

    // Auto-fill vehicle if assigned
    const assignedVehicle = vehicles.find(v => v.assignedDriver === driverName);
    if (assignedVehicle) {
      setFormData(prev => ({ ...prev, vehicle: assignedVehicle.number }));
      setVehicleSearch(assignedVehicle.number);
    }
  };

  const handleVehicleSelect = (vehicleNumber: string) => {
    setFormData(prev => ({ ...prev, vehicle: vehicleNumber }));
    setVehicleSearch(vehicleNumber);
    setShowVehicleDropdown(false);
  };

  const handleSave = () => {
    const entries = getEntries();
    const newEntry: Entry = {
      id: Date.now().toString(),
      ...formData,
      ...calculations
    };

    entries.push(newEntry);
    saveEntries(entries);

    alert('Entry saved successfully!');
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      driver: '',
      vehicle: '',
      earnings: 0,
      cashCollection: 0,
      offlineEarnings: 0,
      offlineCash: 0,
      trips: 0,
      toll: 0,
      cng: 0,
      petrol: 0,
      otherExpenses: 0,
      loginHours: 0,
      openingBalance: 0
    });
    setDriverSearch('');
    setVehicleSearch('');
  };

  const handleShare = () => {
    const message = `BN Cab's Daily Report
Date: ${formData.date}
Driver: ${formData.driver}
Vehicle: ${formData.vehicle}

Earnings: ${formatCurrency(formData.earnings)}
Cash Collection: ${formatCurrency(formData.cashCollection)}
Trips: ${formData.trips}
Login Hours: ${formData.loginHours}

Salary: ${formatCurrency(calculations.salary)}
Payable: ${formatCurrency(calculations.payable)}

Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v => 
    v.number.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Entry</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Row 1: Date, Driver, Vehicle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={driverSearch}
                onChange={(e) => {
                  setDriverSearch(e.target.value);
                  setFormData(prev => ({ ...prev, driver: e.target.value }));
                  setShowDriverDropdown(true);
                }}
                onFocus={() => setShowDriverDropdown(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Select or type driver name"
              />
              {showDriverDropdown && filteredDrivers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleDriverSelect(driver.name)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50"
                    >
                      {driver.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={vehicleSearch}
                onChange={(e) => {
                  setVehicleSearch(e.target.value);
                  setFormData(prev => ({ ...prev, vehicle: e.target.value }));
                  setShowVehicleDropdown(true);
                }}
                onFocus={() => setShowVehicleDropdown(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Select or type vehicle number"
              />
              {showVehicleDropdown && filteredVehicles.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle.number)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50"
                    >
                      {vehicle.number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Row 2: Earnings, Cash Collection, Offline Earnings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Earnings</label>
            <input
              type="number"
              step="0.01"
              value={formData.earnings}
              onChange={(e) => setFormData(prev => ({ ...prev, earnings: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cash Collection</label>
            <input
              type="number"
              step="0.01"
              value={formData.cashCollection}
              onChange={(e) => setFormData(prev => ({ ...prev, cashCollection: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offline Earnings</label>
            <input
              type="number"
              step="0.01"
              value={formData.offlineEarnings}
              onChange={(e) => setFormData(prev => ({ ...prev, offlineEarnings: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Row 3: Offline Cash, No.Of.Trip's, Toll */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offline Cash</label>
            <input
              type="number"
              step="0.01"
              value={formData.offlineCash}
              onChange={(e) => setFormData(prev => ({ ...prev, offlineCash: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">No. of Trips</label>
            <input
              type="number"
              value={formData.trips}
              onChange={(e) => setFormData(prev => ({ ...prev, trips: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Toll</label>
            <input
              type="number"
              step="0.01"
              value={formData.toll}
              onChange={(e) => setFormData(prev => ({ ...prev, toll: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Row 4: CNG, Petrol, Other Expenses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CNG</label>
            <input
              type="number"
              step="0.01"
              value={formData.cng}
              onChange={(e) => setFormData(prev => ({ ...prev, cng: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Petrol</label>
            <input
              type="number"
              step="0.01"
              value={formData.petrol}
              onChange={(e) => setFormData(prev => ({ ...prev, petrol: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Other Expenses</label>
            <input
              type="number"
              step="0.01"
              value={formData.otherExpenses}
              onChange={(e) => setFormData(prev => ({ ...prev, otherExpenses: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Row 5: Login Hours, Opening Balance, Room Rent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Login Hours</label>
            <input
              type="number"
              step="0.1"
              value={formData.loginHours}
              onChange={(e) => setFormData(prev => ({ ...prev, loginHours: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
            <input
              type="number"
              step="0.01"
              value={formData.openingBalance}
              onChange={(e) => setFormData(prev => ({ ...prev, openingBalance: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Rent</label>
            <input
              type="number"
              step="0.01"
              value={calculations.roomRent}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              placeholder="Auto-calculated"
            />
          </div>
        </div>

        {/* Auto Calculations Row - Hidden for drivers */}
        {currentUser?.role === 'admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Auto Calculations</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <label className="text-blue-700">Pay%:</label>
                <p className="font-medium">{calculations.payPercent}%</p>
              </div>
              <div>
                <label className="text-blue-700">Salary:</label>
                <p className="font-medium">{formatCurrency(calculations.salary)}</p>
              </div>
              <div>
                <label className="text-blue-700">Payable:</label>
                <p className="font-medium">{formatCurrency(calculations.payable)}</p>
              </div>
              <div>
                <label className="text-blue-700">Commission:</label>
                <p className="font-medium">{formatCurrency(calculations.commission)}</p>
              </div>
              <div>
                <label className="text-blue-700">P&L:</label>
                <p className="font-medium">{formatCurrency(calculations.pl)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleSave}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Entry</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;