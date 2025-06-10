import React, { useState, useEffect } from 'react';
import { Save, Edit2, Trash2, Eye, X, User } from 'lucide-react';
import { getDrivers, saveDrivers, getUsers, saveUsers } from '../utils/storage';
import { Driver, User as UserType } from '../types';

const JoiningFormPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dob: '',
    mobile: '',
    mobile2: '',
    email: '',
    dlNumber: '',
    dlStatus: 'Pending',
    aadharNumber: '',
    aadharStatus: 'Pending',
    panNumber: '',
    passportNumber: '',
    passportStatus: 'Pending',
    permanentAddress: '',
    presentAddress: '',
    photoStatus: 'Pending',
    reference1Name: '',
    reference1Relationship: '',
    reference1Mobile: '',
    reference2Name: '',
    reference2Relationship: '',
    reference2Mobile: '',
    roomRent: false
  });

  useEffect(() => {
    setDrivers(getDrivers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDriver: Driver = {
      id: editingDriver ? editingDriver.id : Date.now().toString(),
      ...formData
    };

    const updatedDrivers = editingDriver
      ? drivers.map(d => d.id === editingDriver.id ? newDriver : d)
      : [...drivers, newDriver];

    // If this is a new driver, create a user account
    if (!editingDriver) {
      const users = getUsers();
      const newUser: UserType = {
        id: Date.now().toString(),
        username: formData.name.toLowerCase().replace(/\s+/g, ''),
        pin: '1234', // Default PIN
        role: 'driver',
        name: formData.name
      };
      users.push(newUser);
      saveUsers(users);
    }

    saveDrivers(updatedDrivers);
    setDrivers(updatedDrivers);
    
    // Reset form
    setFormData({
      name: '',
      fatherName: '',
      dob: '',
      mobile: '',
      mobile2: '',
      email: '',
      dlNumber: '',
      dlStatus: 'Pending',
      aadharNumber: '',
      aadharStatus: 'Pending',
      panNumber: '',
      passportNumber: '',
      passportStatus: 'Pending',
      permanentAddress: '',
      presentAddress: '',
      photoStatus: 'Pending',
      reference1Name: '',
      reference1Relationship: '',
      reference1Mobile: '',
      reference2Name: '',
      reference2Relationship: '',
      reference2Mobile: '',
      roomRent: false
    });
    
    setShowForm(false);
    setEditingDriver(null);
    alert(editingDriver ? 'Driver updated successfully!' : 'Driver added successfully!');
  };

  const handleEdit = (driver: Driver) => {
    setFormData(driver);
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleDelete = (driverId: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      const updatedDrivers = drivers.filter(d => d.id !== driverId);
      saveDrivers(updatedDrivers);
      setDrivers(updatedDrivers);
      
      // Also remove user account
      const users = getUsers();
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
        const updatedUsers = users.filter(u => u.name !== driver.name);
        saveUsers(updatedUsers);
      }
      
      alert('Driver deleted successfully!');
    }
  };

  const handleView = (driver: Driver) => {
    setViewingDriver(driver);
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">BN Cab's Joining Form</h2>
            <p className="text-sm text-gray-600 mt-1">Manage driver registrations</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingDriver(null);
              setFormData({
                name: '',
                fatherName: '',
                dob: '',
                mobile: '',
                mobile2: '',
                email: '',
                dlNumber: '',
                dlStatus: 'Pending',
                aadharNumber: '',
                aadharStatus: 'Pending',
                panNumber: '',
                passportNumber: '',
                passportStatus: 'Pending',
                permanentAddress: '',
                presentAddress: '',
                photoStatus: 'Pending',
                reference1Name: '',
                reference1Relationship: '',
                reference1Mobile: '',
                reference2Name: '',
                reference2Relationship: '',
                reference2Mobile: '',
                roomRent: false
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Driver
          </button>
        </div>

        {/* Driver List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Mobile</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">DL Number</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Room Rent</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{driver.name}</td>
                  <td className="px-4 py-3">{driver.mobile}</td>
                  <td className="px-4 py-3">{driver.email}</td>
                  <td className="px-4 py-3">{driver.dlNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      driver.roomRent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {driver.roomRent ? 'Yes (₹50)' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(driver)}
                        className="text-blue-600 hover:text-blue-700"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(driver)}
                        className="text-green-600 hover:text-green-700"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {drivers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No drivers registered yet. Click "Add New Driver" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDriver ? 'Edit Driver' : 'BN Cab\'s Joining Form'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Row 1: Name, Father Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Father Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                {/* Row 2: DOB */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">DOB</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                {/* Row 3: Mobile Numbers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mob.No 2</label>
                  <input
                    type="tel"
                    value={formData.mobile2}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile2: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Row 4: Gmail ID */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gmail ID</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                {/* Row 5: DL Number, Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DL Number</label>
                  <input
                    type="text"
                    value={formData.dlNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, dlNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DL Status</label>
                  <select
                    value={formData.dlStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, dlStatus: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Row 6: Aadhar Number, Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, aadharNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Status</label>
                  <select
                    value={formData.aadharStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, aadharStatus: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Row 7: PAN Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Row 8: Passport Number, Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passport Status</label>
                  <select
                    value={formData.passportStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, passportStatus: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Row 9: Addresses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                  <textarea
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Present Address</label>
                  <textarea
                    value={formData.presentAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentAddress: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    
                  />
                </div>

                {/* Row 10: Reference 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Name 1</label>
                  <input
                    type="text"
                    value={formData.reference1Name}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference1Name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Name 2</label>
                  <input
                    type="text"
                    value={formData.reference2Name}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference2Name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                {/* Row 11: Relationships */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <input
                    type="text"
                    value={formData.reference1Relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference1Relationship: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <input
                    type="text"
                    value={formData.reference2Relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference2Relationship: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                {/* Row 12: Mobile Numbers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.reference1Mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference1Mobile: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.reference2Mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference2Mobile: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    
                  />
                </div>

                {/* Room Rent */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.roomRent}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomRent: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Room Rent (₹50/day)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingDriver ? 'Update' : 'Save'} Driver</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Driver Details</h3>
              <button
                onClick={() => setViewingDriver(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Father Name</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.fatherName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">DOB</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.dob}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.mobile}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile 2</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.mobile2 || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">DL Number</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.dlNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">DL Status</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.dlStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Aadhar Number</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.aadharNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Aadhar Status</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.aadharStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">PAN Number</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.panNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Room Rent</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.roomRent ? 'Yes (₹50/day)' : 'No'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Permanent Address</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.permanentAddress}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Present Address</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.presentAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference 1</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.reference1Name} ({viewingDriver.reference1Relationship})</p>
                  <p className="text-sm text-gray-600">{viewingDriver.reference1Mobile}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference 2</label>
                  <p className="text-gray-900 mt-1">{viewingDriver.reference2Name} ({viewingDriver.reference2Relationship})</p>
                  <p className="text-sm text-gray-600">{viewingDriver.reference2Mobile}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoiningFormPage;