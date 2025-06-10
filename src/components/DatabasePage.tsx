import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { getEntries, saveEntries, getDrivers, getVehicles, getCurrentUser } from '../utils/storage';
import { exportToExcel, importFromExcel } from '../utils/excel';
import { formatCurrency } from '../utils/calculations';
import { Entry, Driver, Vehicle } from '../types';

const DatabasePage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    driver: '',
    vehicle: ''
  });
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [entries, filters]);

  const loadData = () => {
    const allEntries = getEntries();
    const allDrivers = getDrivers();
    const allVehicles = getVehicles();

    // Filter entries for drivers to show only their own
    if (currentUser?.role === 'driver') {
      const driverEntries = allEntries.filter(entry => entry.driver === currentUser.name);
      setEntries(driverEntries);
    } else {
      setEntries(allEntries);
    }

    setDrivers(allDrivers);
    setVehicles(allVehicles);
  };

  const applyFilters = () => {
    let filtered = [...entries];

    if (filters.fromDate) {
      filtered = filtered.filter(entry => entry.date >= filters.fromDate);
    }

    if (filters.toDate) {
      filtered = filtered.filter(entry => entry.date <= filters.toDate);
    }

    if (filters.driver) {
      filtered = filtered.filter(entry => 
        entry.driver.toLowerCase().includes(filters.driver.toLowerCase())
      );
    }

    if (filters.vehicle) {
      filtered = filtered.filter(entry => 
        entry.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase())
      );
    }

    // Sort by date descending (latest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEntries(filtered);
  };

  const handleSubmitFilters = () => {
    applyFilters();
  };

  const handleClearFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      driver: '',
      vehicle: ''
    });
  };

  const handleExport = () => {
    if (filteredEntries.length === 0) {
      alert('No data to export');
      return;
    }
    exportToExcel(filteredEntries, 'bn_cabs_database.xlsx');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedEntries = await importFromExcel(file);
      const allEntries = getEntries();
      const updatedEntries = [...allEntries, ...importedEntries];
      saveEntries(updatedEntries);
      loadData();
      alert(`Successfully imported ${importedEntries.length} entries`);
    } catch (error) {
      alert('Error importing file. Please check the format and try again.');
      console.error('Import error:', error);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry({ ...entry });
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;

    const allEntries = getEntries();
    const updatedEntries = allEntries.map(entry => 
      entry.id === editingEntry.id ? editingEntry : entry
    );
    saveEntries(updatedEntries);
    setEditingEntry(null);
    loadData();
    alert('Entry updated successfully');
  };

  const handleDelete = (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const allEntries = getEntries();
      const updatedEntries = allEntries.filter(entry => entry.id !== entryId);
      saveEntries(updatedEntries);
      loadData();
      alert('Entry deleted successfully');
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Database</h2>
        </div>

        {/* Filters and Actions */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
              <input
                type="text"
                value={filters.driver}
                onChange={(e) => setFilters(prev => ({ ...prev, driver: e.target.value }))}
                placeholder="Search driver"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <input
                type="text"
                value={filters.vehicle}
                onChange={(e) => setFilters(prev => ({ ...prev, vehicle: e.target.value }))}
                placeholder="Search vehicle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSubmitFilters}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Submit</span>
            </button>

            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            {currentUser?.role === 'admin' && (
              <label className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Driver</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Earnings</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Cash Collection</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Offline Earnings</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Offline Cash</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Trips</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Toll</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Login Hrs</th>
                {currentUser?.role === 'admin' && (
                  <>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Salary</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">CNG</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Petrol</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Other Expenses</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Opening Balance</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Room Rent</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Payable</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">P&L</th>
                  </>
                )}
                <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{entry.driver}</td>
                  <td className="px-4 py-3">{entry.vehicle}</td>
                  <td className="px-4 py-3">{formatCurrency(entry.earnings)}</td>
                  <td className="px-4 py-3">{formatCurrency(entry.cashCollection)}</td>
                  <td className="px-4 py-3">{formatCurrency(entry.offlineEarnings)}</td>
                  <td className="px-4 py-3">{formatCurrency(entry.offlineCash)}</td>
                  <td className="px-4 py-3">{entry.trips}</td>
                  <td className="px-4 py-3">{formatCurrency(entry.toll)}</td>
                  <td className="px-4 py-3">{entry.loginHours}</td>
                  {currentUser?.role === 'admin' && (
                    <>
                      <td className="px-4 py-3">{formatCurrency(entry.salary)}</td>
                      <td className="px-4 py-3">{formatCurrency(entry.cng)}</td>
                      <td className="px-4 py-3">{formatCurrency(entry.petrol)}</td>
                      <td className="px-4 py-3">{formatCurrency(entry.otherExpenses)}</td>
                      <td className="px-4 py-3">{formatCurrency(entry.openingBalance)}</td>
                      <td className="px-4 py-3">{formatCurrency(entry.roomRent)}</td>
                      <td className="px-4 py-3">{formatCurrency(entry.payable)}</td>
                      <td className="px-4 py-3">{formatCurrency(entry.pl)}</td>
                    </>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No entries found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Entry</h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingEntry.date}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, date: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <input
                    type="text"
                    value={editingEntry.driver}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, driver: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <input
                    type="text"
                    value={editingEntry.vehicle}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, vehicle: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Earnings</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.earnings}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, earnings: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cash Collection</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.cashCollection}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, cashCollection: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offline Earnings</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.offlineEarnings}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, offlineEarnings: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offline Cash</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.offlineCash}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, offlineCash: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trips</label>
                  <input
                    type="number"
                    value={editingEntry.trips}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, trips: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Toll</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.toll}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, toll: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Login Hours</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.loginHours}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, loginHours: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNG</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.cng}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, cng: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Petrol</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.petrol}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, petrol: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Expenses</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.otherExpenses}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, otherExpenses: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.openingBalance}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, openingBalance: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Rent</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.roomRent}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, roomRent: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabasePage;