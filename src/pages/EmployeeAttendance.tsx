import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { attendanceService, AttendanceRecord } from '../services/attendanceService';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  LogOut, 
  AlertTriangle,
  FileText,
  History,
  Timer,
  TrendingUp
} from 'lucide-react';

const EmployeeAttendance: React.FC = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState<{
    hasCheckedIn: boolean;
    hasCheckedOut: boolean;
    attendance: AttendanceRecord | null;
  } | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load today's status and recent records in parallel
      const [statusData, recordsData] = await Promise.all([
        attendanceService.getTodayStatus(),
        attendanceService.getMyRecords(1, 7) // Last 7 records
      ]);

      setTodayStatus(statusData);
      setRecentRecords(recordsData.attendance);
    } catch (err) {
      console.error('Error loading attendance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async (location: string, notes?: string) => {
    try {
      setActionLoading(true);
      setError(null);

      await attendanceService.checkIn(location, notes);
      setSuccess('Check-in successful!');
      setShowCheckInModal(false);
      
      // Refresh data
      await loadData();
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (notes?: string, breakTime?: number) => {
    try {
      setActionLoading(true);
      setError(null);

      await attendanceService.checkOut(notes, breakTime);
      setSuccess('Check-out successful!');
      setShowCheckOutModal(false);
      
      // Refresh data
      await loadData();
    } catch (err) {
      console.error('Check-out error:', err);
      setError(err instanceof Error ? err.message : 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'half-day': return 'bg-blue-100 text-blue-800';
      case 'work-from-home': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Today's Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-in Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Check-in</span>
              </div>
              {todayStatus?.hasCheckedIn ? (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  Pending
                </span>
              )}
            </div>
            
            {todayStatus?.hasCheckedIn && todayStatus.attendance ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Time: {formatTime(todayStatus.attendance.checkIn!)}</p>
                <p className="text-sm text-gray-600">Location: {todayStatus.attendance.location}</p>
                {todayStatus.attendance.notes && (
                  <p className="text-sm text-gray-600">Notes: {todayStatus.attendance.notes}</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowCheckInModal(true)}
                disabled={actionLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>{actionLoading ? 'Processing...' : 'Check In'}</span>
              </button>
            )}
          </div>

          {/* Check-out Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LogOut className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Check-out</span>
              </div>
              {todayStatus?.hasCheckedOut ? (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  Pending
                </span>
              )}
            </div>
            
            {todayStatus?.hasCheckedOut && todayStatus.attendance?.checkOut ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Time: {formatTime(todayStatus.attendance.checkOut)}</p>
                <p className="text-sm text-gray-600">
                  Working Hours: {todayStatus.attendance.workingHours.toFixed(2)}h
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowCheckOutModal(true)}
                disabled={!todayStatus?.hasCheckedIn || actionLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>{actionLoading ? 'Processing...' : 'Check Out'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Today's Summary */}
        {todayStatus?.attendance && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Today's Summary</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(todayStatus.attendance.status)}`}>
                {todayStatus.attendance.status}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Working Hours</p>
                <p className="font-semibold">{todayStatus.attendance.workingHours.toFixed(2)}h</p>
              </div>
              <div>
                <p className="text-gray-600">Break Time</p>
                <p className="font-semibold">{todayStatus.attendance.breakTime || 0}m</p>
              </div>
              <div>
                <p className="text-gray-600">Overtime</p>
                <p className="font-semibold">{todayStatus.attendance.overtime?.toFixed(2) || 0}h</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Attendance Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Attendance</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRecords.length > 0 ? (
                recentRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkIn ? formatTime(record.checkIn) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkOut ? formatTime(record.checkOut) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.workingHours.toFixed(2)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Check In</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const location = formData.get('location') as string;
              const notes = formData.get('notes') as string;
              handleCheckIn(location, notes || undefined);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <select
                    name="location"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="office">Office</option>
                    <option value="home">Work from Home</option>
                    <option value="client-site">Client Site</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Any additional notes..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Checking In...' : 'Check In'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Check Out</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const notes = formData.get('notes') as string;
              const breakTime = parseInt(formData.get('breakTime') as string) || 0;
              handleCheckOut(notes || undefined, breakTime);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Timer className="h-4 w-4 inline mr-1" />
                    Break Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="breakTime"
                    min="0"
                    max="480"
                    defaultValue="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Any additional notes about your day..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Checking Out...' : 'Check Out'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckOutModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;