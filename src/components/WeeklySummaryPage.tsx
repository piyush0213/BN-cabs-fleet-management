import React, { useState, useEffect } from 'react';
import { Calendar, Download, Car } from 'lucide-react';
import { getEntries, getVehicles } from '../utils/storage';
import { calculateWeeklyRent, formatCurrency } from '../utils/calculations';
import { exportWeeklySummaryToExcel } from '../utils/excel';
import { Entry, Vehicle, WeeklySummary } from '../types';

const WeeklySummaryPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    vehicle: ''
  });
  const [tdsValues, setTdsValues] = useState<{[key: string]: number}>({});

  useEffect(() => {
    setEntries(getEntries());
    setVehicles(getVehicles());
  }, []);

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // Calculate days to subtract to get to Monday
    // If it's Sunday (0), we need to go back 6 days to get to last Monday
    // For Monday (1), no change needed
    // For other days, we need to go back (day - 1) days to get to Monday
    const daysToSubtract = day === 0 ? 6 : day - 1;
    
    const monday = new Date(d);
    monday.setDate(d.getDate() - daysToSubtract);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };
  
  const getWeekEnd = (date: Date): Date => {
    const monday = getWeekStart(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  };

  const generateWeeklySummaries = () => {
    let filteredEntries = [...entries];

    if (filters.fromDate) {
      filteredEntries = filteredEntries.filter(entry => entry.date >= filters.fromDate);
    }

    if (filters.toDate) {
      filteredEntries = filteredEntries.filter(entry => entry.date <= filters.toDate);
    }

    if (filters.vehicle) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase())
      );
    }

    // Group entries by week and vehicle
    const weeklyGroups: {[key: string]: Entry[]} = {};

    filteredEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const weekStart = getWeekStart(entryDate);
      const weekEnd = getWeekEnd(entryDate);
      
      // Debug log to verify week calculations
      console.log(`Entry date: ${entry.date}`);
      console.log(`Week start: ${weekStart.toISOString().split('T')[0]}`);
      console.log(`Week end: ${weekEnd.toISOString().split('T')[0]}`);
      
      const weekKey = `${weekStart.toISOString().split('T')[0]}_${weekEnd.toISOString().split('T')[0]}_${entry.vehicle}`;

      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = [];
      }
      weeklyGroups[weekKey].push(entry);
    });

    // Calculate weekly summaries
    const summaries: WeeklySummary[] = Object.keys(weeklyGroups).map(weekKey => {
      const [weekStartStr, weekEndStr, vehicle] = weekKey.split('_');
      const weekEntries = weeklyGroups[weekKey];

      const totalEarnings = weekEntries.reduce((sum, entry) => sum + entry.earnings + entry.offlineEarnings, 0);
      const totalCash = weekEntries.reduce((sum, entry) => sum + entry.cashCollection, 0);
      const totalToll = weekEntries.reduce((sum, entry) => sum + entry.toll, 0);
      const totalTrips = weekEntries.reduce((sum, entry) => sum + entry.trips, 0);
      const days = weekEntries.length;
      const uberCommission = totalCash - totalEarnings;
      const rent = calculateWeeklyRent(totalTrips);
      const insurance = 30 * days;
      const tds = tdsValues[weekKey] || 0;
      const payable = rent * days + insurance + tds + uberCommission - totalToll;

      return {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        vehicle,
        earnings: Math.round(totalEarnings * 100) / 100,
        cash: Math.round(totalCash * 100) / 100,
        uberCommission: Math.round(uberCommission * 100) / 100,
        toll: Math.round(totalToll * 100) / 100,
        trips: totalTrips,
        rent: Math.round(rent * 100) / 100,
        days,
        insurance: Math.round(insurance * 100) / 100,
        tds: Math.round(tds * 100) / 100,
        payable: Math.round(payable * 100) / 100
      };
    });

    // Sort by week start date descending
    summaries.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());

    setWeeklySummaries(summaries);
  };

  const handleTdsChange = (weekKey: string, value: number) => {
    const tdsValue = Math.round(value * 100) / 100;
    setTdsValues(prev => ({ ...prev, [weekKey]: tdsValue }));
    
    // Update the corresponding summary
    setWeeklySummaries(prev => prev.map(summary => {
      const summaryKey = `${summary.weekStart}_${summary.weekEnd}_${summary.vehicle}`;
      if (summaryKey === weekKey) {
        const newTds = tdsValue;
        const newPayable = Math.round((summary.rent * summary.days + summary.insurance + newTds + summary.uberCommission - summary.toll) * 100) / 100;
        return { ...summary, tds: newTds, payable: newPayable };
      }
      return summary;
    }));
  };

  const handleExport = () => {
    if (weeklySummaries.length === 0) {
      alert('No data to export');
      return;
    }
    exportWeeklySummaryToExcel(weeklySummaries, 'bn_cabs_weekly_summary.xlsx');
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Summary</h2>
          <p className="text-sm text-gray-600 mt-1">Monday to Sunday summaries</p>
        </div>

        {/* Filters and Actions */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.vehicle}
                  onChange={(e) => setFilters(prev => ({ ...prev, vehicle: e.target.value }))}
                  placeholder="Search vehicle"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateWeeklySummaries}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Generate</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-700">From</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">To</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Vehicle</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Earnings</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Cash</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Uber Commission</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Toll</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Trips</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Rent</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Days</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Insurance</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">TDS</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weeklySummaries.map((summary, index) => {
                const weekKey = `${summary.weekStart}_${summary.weekEnd}_${summary.vehicle}`;
                return (
                  <tr key={weekKey} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-xs">{summary.weekStart}</td>
                    <td className="px-3 py-3 text-xs">{summary.weekEnd}</td>
                    <td className="px-3 py-3 text-xs font-medium">{summary.vehicle}</td>
                    <td className="px-3 py-3 text-xs">{formatCurrency(summary.earnings)}</td>
                    <td className="px-3 py-3 text-xs">{formatCurrency(summary.cash)}</td>
                    <td className="px-3 py-3 text-xs">{formatCurrency(summary.uberCommission)}</td>
                    <td className="px-3 py-3 text-xs">{formatCurrency(summary.toll)}</td>
                    <td className="px-3 py-3 text-xs">{summary.trips}</td>
                    <td className="px-3 py-3 text-xs">{formatCurrency(summary.rent)}</td>
                    <td className="px-3 py-3 text-xs">{summary.days}</td>
                    <td className="px-3 py-3 text-xs">{formatCurrency(summary.insurance)}</td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={summary.tds}
                        onChange={(e) => handleTdsChange(weekKey, parseFloat(e.target.value) || 0)}
                        className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-3 text-xs font-medium text-blue-600">{formatCurrency(summary.payable)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {weeklySummaries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Click "Generate" to create weekly summaries based on your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryPage;