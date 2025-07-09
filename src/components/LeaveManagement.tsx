import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X, Clock, Search, Filter, FileText } from 'lucide-react';
import { AuthUser, LeaveRequest, Employee } from '../types';
import { connectDB } from '../lib/mongodb';

interface LeaveManagementProps {
  user: AuthUser;
}

export default function LeaveManagement({ user }: LeaveManagementProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: user.role === 'employee' ? user.id : '',
    leaveType: 'vacation' as 'sick' | 'vacation' | 'personal' | 'emergency' | 'maternity' | 'paternity',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveTypes = [
    { value: 'sick', label: 'Sick Leave' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' }
  ];

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, []);

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

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const { db } = await connectDB();
      const leaveCollection = db.collection('leave_requests');
      
      // Filter based on user role
      const query = user.role === 'employee' 
        ? { employeeId: user.id }
        : {};

      const leaveList = await leaveCollection.find(query)
        .sort({ appliedDate: -1 })
        .toArray();

      setLeaveRequests(leaveList.map(leave => ({
        ...leave,
        _id: leave._id.toString(),
        appliedDate: leave.appliedDate?.toISOString() || new Date().toISOString(),
        approvedDate: leave.approvedDate?.toISOString()
      })));
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    return Math.max(0, diffDays);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        setError('Start date cannot be in the past');
        return;
      }

      if (endDate < startDate) {
        setError('End date must be after start date');
        return;
      }

      const { db } = await connectDB();
      const leaveCollection = db.collection('leave_requests');

      // Find employee details
      let employee;
      if (user.role === 'employee') {
        // For employees, use their own data
        employee = { name: user.name, employeeId: user.id };
      } else {
        // For admin/hr, find the selected employee
        employee = employees.find(emp => emp.employeeId === formData.employeeId);
        if (!employee) {
          setError('Employee not found');
          return;
        }
      }

      // Check for overlapping leave requests
      const overlappingLeave = await leaveCollection.findOne({
        employeeId: formData.employeeId,
        status: { $in: ['pending', 'approved'] },
        $or: [
          {
            startDate: { $lte: formData.endDate },
            endDate: { $gte: formData.startDate }
          }
        ]
      });

      if (overlappingLeave) {
        setError('There is already a leave request for overlapping dates');
        return;
      }

      // Calculate days
      const days = calculateDays(formData.startDate, formData.endDate);

      // Create leave request
      const newLeaveRequest = {
        employeeId: formData.employeeId,
        employeeName: employee.name,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: days,
        reason: formData.reason.trim(),
        status: 'pending' as const,
        appliedDate: new Date()
      };

      await leaveCollection.insertOne(newLeaveRequest);
      
      setSuccess('Leave request submitted successfully!');
      setFormData({
        employeeId: user.role === 'employee' ? user.id : '',
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setShowAddModal(false);
      fetchLeaveRequests();

    } catch (error: any) {
      console.error('Error applying for leave:', error);
      setError(error.message || 'Failed to submit leave request');
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      setError('');
      const { db } = await connectDB();
      const { ObjectId } = await import('mongodb');

      await db.collection('leave_requests').updateOne(
        { _id: new ObjectId(leaveId) },
        { 
          $set: { 
            status: 'approved',
            approvedBy: user.name,
            approvedDate: new Date()
          }
        }
      );

      setSuccess('Leave request approved successfully!');
      fetchLeaveRequests();

    } catch (error) {
      console.error('Error approving leave:', error);
      setError('Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;

    try {
      setError('');
      const { db } = await connectDB();
      const { ObjectId } = await import('mongodb');

      await db.collection('leave_requests').updateOne(
        { _id: new ObjectId(leaveId) },
        { 
          $set: { 
            status: 'rejected',
            approvedBy: user.name,
            approvedDate: new Date(),
            rejectionReason: rejectionReason.trim()
          }
        }
      );

      setSuccess('Leave request rejected successfully!');
      fetchLeaveRequests();

    } catch (error) {
      console.error('Error rejecting leave:', error);
      setError('Failed to reject leave request');
    }
  };

  // Filter leave requests
  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.leaveType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get leave statistics
  const stats = {
    total: filteredLeaveRequests.length,
    pending: filteredLeaveRequests.filter(r => r.status === 'pending').length,
    approved: filteredLeaveRequests.filter(r => r.status === 'approved').length,
    rejected: filteredLeaveRequests.filter(r => r.status === 'rejected').length
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
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">
            {user.role === 'employee' ? 'Apply for leave and track your requests' : 'Manage employee leave requests'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          {user.role === 'employee' ? 'Apply for Leave' : 'Add Leave Request'}
        </button>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input"
          >
            <option value="all">All Types</option>
            {leaveTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="space-y-4">
        {filteredLeaveRequests.map((request) => (
          <div key={request._id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.employeeName}</h3>
                  <span className={`badge-${
                    request.status === 'approved' ? 'success' :
                    request.status === 'rejected' ? 'danger' : 'warning'
                  }`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Type:</span> {leaveTypes.find(t => t.value === request.leaveType)?.label}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {request.days} day{request.days !== 1 ? 's' : ''}
                  </div>
                  <div>
                    <span className="font-medium">From:</span> {new Date(request.startDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">To:</span> {new Date(request.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-3">
                  <span className="font-medium text-gray-700">Reason:</span>
                  <p className="text-gray-600 mt-1">{request.reason}</p>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Applied on: {new Date(request.appliedDate).toLocaleDateString()}
                  {request.approvedBy && (
                    <span className="ml-4">
                      {request.status === 'approved' ? 'Approved' : 'Rejected'} by: {request.approvedBy}
                      {request.approvedDate && ` on ${new Date(request.approvedDate).toLocaleDateString()}`}
                    </span>
                  )}
                </div>

                {request.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <span className="font-medium text-red-700">Rejection Reason:</span>
                    <p className="text-red-600 text-sm">{request.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Action buttons for admin/hr */}
              {(user.role === 'admin' || user.role === 'hr') && request.status === 'pending' && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleApproveLeave(request._id)}
                    className="text-green-600 hover:text-green-900"
                    title="Approve Leave"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRejectLeave(request._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Reject Leave"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredLeaveRequests.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No leave requests have been submitted yet'
            }
          </p>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {user.role === 'employee' ? 'Apply for Leave' : 'Add Leave Request'}
              </h2>
              
              <form onSubmit={handleApplyLeave} className="space-y-4">
                {user.role !== 'employee' && (
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
                )}

                <div>
                  <label className="form-label">Leave Type *</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({...formData, leaveType: e.target.value as any})}
                    className="form-input"
                    required
                  >
                    {leaveTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="form-input"
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {formData.startDate && formData.endDate && (
                  <div className="text-sm text-gray-600">
                    Duration: {calculateDays(formData.startDate, formData.endDate)} day(s)
                  </div>
                )}

                <div>
                  <label className="form-label">Reason *</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="form-input"
                    rows={4}
                    placeholder="Please provide a reason for your leave request..."
                    required
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
                    Submit Request
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