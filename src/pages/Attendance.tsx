import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Clock, Calendar, User, CheckCircle, XCircle, AlertTriangle, LogOut } from 'lucide-react';

const Attendance: React.FC = () => {
  const { employees, attendance, addAttendance, updateAttendance } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const todayAttendance = attendance.filter(record => record.date === selectedDate);
  
  const getAttendanceStats = () => {
    const present = todayAttendance.filter(record => record.status === 'present').length;
    const late = todayAttendance.filter(record => record.status === 'late').length;
    const absent = employees.length - todayAttendance.length;
    
    return { present, late, absent, total: employees.length };
  };

  const stats = getAttendanceStats();

  const handleCheckIn = (employeeId: string, checkInTime: string) => {
    const checkInHour = parseInt(checkInTime.split(':')[0]);
    const checkInMinute = parseInt(checkInTime.split(':')[1]);
    const totalMinutes = checkInHour * 60 + checkInMinute;
    const standardTime = 9 * 60; // 9:00 AM
    
    const status = totalMinutes > standardTime + 15 ? 'late' : 'present';
    
    addAttendance({
      employeeId,
      date: selectedDate,
      checkIn: checkInTime,
      hoursWorked: 0,
      status
    });
    
    setShowCheckInModal(false);
    setSelectedEmployee('');
  };

  const handleCheckOut = (attendanceId: string, checkOutTime: string) => {
    const attendanceRecord = attendance.find(record => record.id === attendanceId);
    if (attendanceRecord) {
      const checkInTime = attendanceRecord.checkIn;
      const checkInHour = parseInt(checkInTime.split(':')[0]);
      const checkInMinute = parseInt(checkInTime.split(':')[1]);
      const checkOutHour = parseInt(checkOutTime.split(':')[0]);
      const checkOutMinute = parseInt(checkOutTime.split(':')[1]);
      
      const checkInTotalMinutes = checkInHour * 60 + checkInMinute;
      const checkOutTotalMinutes = checkOutHour * 60 + checkOutMinute;
      const hoursWorked = (checkOutTotalMinutes - checkInTotalMinutes) / 60;
      
      updateAttendance(attendanceId, {
        checkOut: checkOutTime,
        hoursWorked: Math.round(hoursWorked * 100) / 100
      });
    }
    
    setShowCheckOutModal(false);
    setSelectedEmployee('');
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return todayAttendance.find(record => record.employeeId === employeeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Clock className="h-4 w-4" />
            Check In
          </button>
          <button
            onClick={() => setShowCheckOutModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Check Out
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Employee Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                const attendanceRecord = getEmployeeAttendance(employee.id);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={employee.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'}
                          alt=""
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendanceRecord?.checkIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendanceRecord?.checkOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendanceRecord?.hoursWorked || 0}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendanceRecord ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          attendanceRecord.status === 'present' 
                            ? 'bg-green-100 text-green-800'
                            : attendanceRecord.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attendanceRecord.status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {attendanceRecord && !attendanceRecord.checkOut && (
                        <button
                          onClick={() => {
                            setSelectedEmployee(attendanceRecord.id);
                            setShowCheckOutModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <LogOut className="h-4 w-4" />
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Check In Employee</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const employeeId = formData.get('employee') as string;
              const checkInTime = formData.get('checkInTime') as string;
              handleCheckIn(employeeId, checkInTime);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    name="employee"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.filter(emp => !getEmployeeAttendance(emp.id)).map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
                  <input
                    type="time"
                    name="checkInTime"
                    required
                    defaultValue={new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check In
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

      {/* Check Out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Check Out Employee</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const attendanceId = formData.get('attendance') as string;
              const checkOutTime = formData.get('checkOutTime') as string;
              handleCheckOut(attendanceId, checkOutTime);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    name="attendance"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {todayAttendance.filter(att => !att.checkOut).map(attendanceRecord => {
                      const employee = employees.find(emp => emp.id === attendanceRecord.employeeId);
                      return (
                        <option key={attendanceRecord.id} value={attendanceRecord.id}>
                          {employee?.name} (Checked in at {attendanceRecord.checkIn})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
                  <input
                    type="time"
                    name="checkOutTime"
                    required
                    defaultValue={new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Check Out
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

export default Attendance;