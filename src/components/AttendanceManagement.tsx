import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Users, CheckCircle, XCircle, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import { AuthUser, Attendance, Employee } from '../types';
import { connectDB } from '../lib/mongodb';

interface AttendanceManagementProps {
  user: AuthUser;
}

export default function AttendanceManagement({ user }: AttendanceManagementProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
    notes: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const { db } = await connectDB();
      const employeesCollection = db.collection('employees');
      
      const employeesList = await employeesCollection.find({ status: 'active' })
        .sort({ name: 1 })
        .toArray();

      setEmployees(employeesList.map(emp => ({
        ...emp,
        _id: emp._id.toString(),
        createdAt: emp.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: emp.updatedAt?.toISOString() || new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    }
  };

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const { db } = await connectDB();
      const attendanceCollection = db.collection('attendance');
      
      const attendanceList = await attendanceCollection.find({ date: selectedDate })
        .sort({ employeeName: 1 })
        .toArray();

      setAttendance(attendanceList.map(att => ({
        ...att,
        _id: att._id.toString(),
        createdAt: att.createdAt?.toISOString() || new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to load attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInTime = new Date(`${formData.date}T${checkIn}`);
    const checkOutTime = new Date(`${formData.date}T${checkOut}`);
    
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
  };

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.employeeId || !formData.date) {
        setError('Please select an employee and date');
        return;
      }

      // Validate time format if provided
      if (formData.checkIn && !/^\d{2}:\d{2}$/.test(formData.checkIn)) {
        setError('Please enter check-in time in HH:MM format');
        return;
      }

      if (formData.checkOut && !/^\d{2}:\d{2}$/.test(formData.checkOut)) {
        setError('Please enter check-out time in HH:MM format');
        return;
      }

      // Validate check-out is after check-in
      if (formData.checkIn && formData.checkOut) {
        const checkInTime = new Date(`${formData.date}T${formData.checkIn}`);
        const checkOutTime = new Date(`${formData.date}T${formData.checkOut}`);
        
        if (checkOutTime <= checkInTime) {
          setError('Check-out time must be after check-in time');
          return;
        }
      }

      const { db } = await connectDB();
      const attendanceCollection = db.collection('attendance');

      // Check if attendance already exists for this employee and date
      const existingAttendance = await attendanceCollection.findOne({
        employeeId: formData.employeeId,
        date: formData.date
      });

      if (existingAttendance) {
        setError('Attendance record already exists for this employee on this date');
        return;
      }

      // Find employee details
      const employee = employees.find(emp => emp.employeeId === formData.employeeId);
      if (!employee) {
        setError('Employee not found');
        return;
      }

      // Calculate working hours
      const workingHours = formData.checkIn && formData.checkOut 
        ? calculateWorkingHours(formData.checkIn, formData.checkOut)
        : 0;

      // Create attendance record
      const newAttendance = {
        employeeId: formData.employeeId,
        employeeName: employee.name,
        date: formData.date,
        checkIn: formData.checkIn || null,
        checkOut: formData.checkOut || null,
        status: formData.status,
        workingHours: workingHours,
        notes: formData.notes.trim(),
        createdAt: new Date()
      };

      await attendanceCollection.insertOne(newAttendance);
      
      setSuccess('Attendance record added successfully!');
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'present',
        notes: ''
      });
      setShowAddModal(false);
      fetchAttendance();

    } catch (error: any) {
      console.error('Error adding attendance:', error);
      setError(error.message || 'Failed to add attendance record');
    }
  };

  const handleUpdateAttendance = async (attendanceId: string, updates: Partial<Attendance>) => {
    try {
      setError('');
      const { db } = await connectDB();
      const { ObjectId } = await import('mongodb');

      // Calculate working hours if times are updated
      if (updates.checkIn && updates.checkOut) {
        const checkInTime = new Date(`${updates.date || selectedDate}T${updates.checkIn}`);
        const checkOutTime = new Date(`${updates.date || selectedDate}T${updates.checkOut}`);
        const diffMs = checkOutTime.getTime() - checkInTime.getTime();
        updates.workingHours = Math.max(0, diffMs / (1000 * 60 * 60));
      }

      await db.collection('attendance').updateOne(
        { _id: new ObjectId(attendanceId) },
        { $set: { ...updates, updatedAt: new Date() } }
      );

      setSuccess('Attendance updated successfully!');
      fetchAttendance();

    } catch (error) {
      console.error('Error updating attendance:', error);
      setError('Failed to update attendance');
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      setError('');
      const { db } = await connectDB();
      const { ObjectId } = await import('mongodb');

      await db.collection('attendance').deleteOne({ _id: new ObjectId(attendanceId) });
      
      setSuccess('Attendance record deleted successfully!');
      fetchAttendance();

    } catch (error) {
      console.error('Error deleting attendance:', error);
      setError('Failed to delete attendance record');
    }
  };

  // Filter attendance records
  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get attendance statistics
  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(a => a.status === 'present').length,
    absent: filteredAttendance.filter(a => a.status === 'absent').length,
    late: filteredAttendance.filter(a => a.status === 'late').length,
    halfDay: filteredAttendance.filter(a => a.status === 'half-day').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage employee attendance</p>
        </div>
        {(user.role === 'admin' || user.role === 'hr') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Mark Attendance
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Date Selector and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <div className="text-sm text-gray-600">Late</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.halfDay}</div>
              <div className="text-sm text-gray-600">Half Day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half-day">Half Day</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                {(user.role === 'admin' || user.role === 'hr') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                      <div className="text-sm text-gray-500">ID: {record.employeeId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkIn || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkOut || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.workingHours ? `${record.workingHours.toFixed(1)}h` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge-${
                      record.status === 'present' ? 'success' :
                      record.status === 'late' ? 'warning' :
                      record.status === 'half-day' ? 'info' : 'danger'
                    }`}>
                      {record.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {record.notes || '-'}
                  </td>
                  {(user.role === 'admin' || user.role === 'hr') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteAttendance(record._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Record"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendance.length === 0 && (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : `No attendance records for ${new Date(selectedDate).toLocaleDateString()}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h2>
              
              <form onSubmit={handleAddAttendance} className="space-y-4">
                <div>
                  <label className="form-label">Employee *</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="form-input"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Check In</label>
                    <input
                      type="time"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Check Out</label>
                    <input
                      type="time"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="form-input"
                    required
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half-day">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="form-input"
                    rows={3}
                    placeholder="Optional notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Mark Attendance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}