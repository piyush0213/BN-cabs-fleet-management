import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Car as CarIcon } from 'lucide-react';
import { getEntries, getDrivers, getVehicles } from '../utils/storage';
import { formatCurrency } from '../utils/calculations';
import { Entry, Driver, Vehicle } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SummaryPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles'>('drivers');
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setEntries(getEntries());
    setDrivers(getDrivers());
    setVehicles(getVehicles());
  }, []);

  const filteredEntries = entries.filter(entry => 
    entry.date >= dateRange.fromDate && entry.date <= dateRange.toDate
  );

  const getDriverSummary = () => {
    const driverStats: {[key: string]: {earnings: number, trips: number}} = {};
    
    filteredEntries.forEach(entry => {
      if (!driverStats[entry.driver]) {
        driverStats[entry.driver] = { earnings: 0, trips: 0 };
      }
      driverStats[entry.driver].earnings += entry.earnings + entry.offlineEarnings;
      driverStats[entry.driver].trips += entry.trips;
    });

    return Object.entries(driverStats).map(([driver, stats]) => ({
      name: driver,
      ...stats
    })).sort((a, b) => b.earnings - a.earnings);
  };

  const getVehicleSummary = () => {
    const vehicleStats: {[key: string]: {earnings: number, trips: number}} = {};
    
    filteredEntries.forEach(entry => {
      if (!vehicleStats[entry.vehicle]) {
        vehicleStats[entry.vehicle] = { earnings: 0, trips: 0 };
      }
      vehicleStats[entry.vehicle].earnings += entry.earnings + entry.offlineEarnings;
      vehicleStats[entry.vehicle].trips += entry.trips;
    });

    return Object.entries(vehicleStats).map(([vehicle, stats]) => ({
      name: vehicle,
      ...stats
    })).sort((a, b) => b.earnings - a.earnings);
  };

  const driverSummary = getDriverSummary();
  const vehicleSummary = getVehicleSummary();

  const driverEarningsChart = {
    labels: driverSummary.slice(0, 10).map(d => d.name),
    datasets: [
      {
        label: 'Earnings (₹)',
        data: driverSummary.slice(0, 10).map(d => d.earnings),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const driverTripsChart = {
    labels: driverSummary.slice(0, 10).map(d => d.name),
    datasets: [
      {
        label: 'Trips',
        data: driverSummary.slice(0, 10).map(d => d.trips),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const vehicleEarningsChart = {
    labels: vehicleSummary.slice(0, 10).map(v => v.name),
    datasets: [
      {
        label: 'Earnings (₹)',
        data: vehicleSummary.slice(0, 10).map(v => v.earnings),
        backgroundColor: 'rgba(245, 101, 101, 0.8)',
        borderColor: 'rgba(245, 101, 101, 1)',
        borderWidth: 1,
      },
    ],
  };

  const vehicleTripsChart = {
    labels: vehicleSummary.slice(0, 10).map(v => v.name),
    datasets: [
      {
        label: 'Trips',
        data: vehicleSummary.slice(0, 10).map(v => v.trips),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Summary Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Performance analytics and insights</p>
        </div>

        {/* Date Range Filter */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, fromDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, toDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('drivers')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'drivers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Driver Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CarIcon className="w-4 h-4" />
              <span>Vehicle Analysis</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'drivers' && (
            <div className="space-y-8">
              {/* Driver Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Drivers by Earnings</h3>
                  <div className="h-64">
                    <Bar data={driverEarningsChart} options={chartOptions} />
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Drivers by Trips</h3>
                  <div className="h-64">
                    <Bar data={driverTripsChart} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Driver Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Driver Performance Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Driver</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Total Earnings</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Total Trips</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Avg per Trip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {driverSummary.map((driver, index) => (
                        <tr key={driver.name} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{driver.name}</td>
                          <td className="px-4 py-3">{formatCurrency(driver.earnings)}</td>
                          <td className="px-4 py-3">{driver.trips}</td>
                          <td className="px-4 py-3">{formatCurrency(driver.trips > 0 ? driver.earnings / driver.trips : 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="space-y-8">
              {/* Vehicle Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Vehicles by Earnings</h3>
                  <div className="h-64">
                    <Bar data={vehicleEarningsChart} options={chartOptions} />
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Vehicles by Trips</h3>
                  <div className="h-64">
                    <Bar data={vehicleTripsChart} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Vehicle Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Vehicle Performance Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Vehicle</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Total Earnings</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Total Trips</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Avg per Trip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vehicleSummary.map((vehicle, index) => (
                        <tr key={vehicle.name} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{vehicle.name}</td>
                          <td className="px-4 py-3">{formatCurrency(vehicle.earnings)}</td>
                          <td className="px-4 py-3">{vehicle.trips}</td>
                          <td className="px-4 py-3">{formatCurrency(vehicle.trips > 0 ? vehicle.earnings / vehicle.trips : 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;