import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Check, X, Search, Filter, Calendar, TrendingUp } from 'lucide-react';
import { AuthUser, Salary, Employee } from '../types';
import { connectDB } from '../lib/mongodb';

interface SalaryManagementProps {
  user: AuthUser;
}

export default function SalaryManagement({ user }: SalaryManagementProps) {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: '',
    deductions: '',
    overtime: '',
    notes: ''
  });

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
  }, [selectedMonth, selectedYear]);

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

  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
      const { db } = await connectDB();
      const salariesCollection = db.collection('salaries');
      
      // Filter based on user role and selected month/year
      const query = user.role === 'employee' 
        ? { 
            employeeId: user.id,
            month: selectedMonth.toString().padStart(2, '0'),
            year: selectedYear
          }
        : {
            month: selectedMonth.toString().padStart(2, '0'),
            year: selectedYear
          };

      const salariesList = await salariesCollection.find(query)
        .sort({ employeeName: 1 })
        .toArray();

      setSalaries(salariesList.map(salary => ({
        ...salary,
        _id: salary._id.toString(),
        createdAt: salary.createdAt?.toISOString() || new Date().toISOString(),
        paidDate: salary.paidDate?.toISOString()
      })));
    } catch (error) {
      console.error('Error fetching salaries:', error);
      setError('Failed to load salary records');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalSalary = (basic: number, allowances: number, deductions: number, overtime: number): number => {
    return Math.max(0, basic + allowances + overtime - deductions);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      year: new Date().getFullYear(),
      basicSalary: '',
      allowances: '',
      deductions: '',
      overtime: '',
      notes: ''
    });
  };

  const handleAddSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.employeeId || !formData.basicSalary) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate numeric values
      const basicSalary = parseFloat(formData.basicSalary);
      const allowances = parseFloat(formData.allowances) || 0;
      const deductions = parseFloat(formData.deductions) || 0;
      const overtime = parseFloat(formData.overtime) || 0;

      if (isNaN(basicSalary) || basicSalary < 0) {
        setError('Please enter a valid basic salary');
        return;
      }

      if (allowances < 0 || deductions < 0 || overtime < 0) {
        setError('Allowances, deductions, and overtime cannot be negative');
        return;
      }

      const { db } = await connectDB();
      const salariesCollection = db.collection('salaries');

      // Check if salary already exists for this employee and month/year
      const existingSalary = await salariesCollection.findOne({
        employeeId: formData.employeeId,
        month: formData.month,
        year: formData.year
      });

      if (existingSalary) {
        setError('Salary record already exists for this employee and month');
        return;
      }

      // Find employee details
      const employee = employees.find(emp => emp.employeeId === formData.employeeId);
      if (!employee) {
        setError('Employee not found');
        return;
      }

      // Calculate total salary
      const totalSalary = calculateTotalSalary(basicSalary, allowances, deductions, overtime);

      // Create salary record
      const newSalary = {
        employeeId: formData.employeeId,
        employeeName: employee.name,
        month: formData.month,
        year: formData.year,
        basicSalary: basicSalary,
        allowances: allowances,
        deductions: deductions,
        overtime: overtime,
        totalSalary: totalSalary,
        status: 'unpaid' as const,
        notes: formData.notes.trim(),
        createdAt: new Date()
      };

      await salariesCollection.insertOne(newSalary);
      
      setSuccess('Salary record added successfully!');
      resetForm();
      setShowAddModal(false);
      fetchSalaries();

    } catch (error: any) {
      console.error('Error adding salary:', error);
      setError(error.message || 'Failed to add salary record');
    }
  };

  const handleEditSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalary) return;

    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.basicSalary) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate numeric values
      const basicSalary = parseFloat(formData.basicSalary);
      const allowances = parseFloat(formData.allowances) || 0;
      const deductions = parseFloat(formData.deductions) || 0;
      const overtime = parseFloat(formData.overtime) || 0;

      if (isNaN(basicSalary) || basicSalary < 0) {
        setError('Please enter a valid basic salary');
        return;
      }

      if (allowances < 0 || deductions < 0 || overtime < 0) {
        setError('Allowances, deductions, and overtime cannot be negative');
        return;
      }

      const { db } = await connectDB();
      const salariesCollection = db.collection('salaries');
      const { ObjectId } = await import('mongodb');

      // Calculate total salary
      const totalSalary = calculateTotalSalary(basicSalary, allowances, deductions, overtime);

      // Update salary record
      const updatedSalary = {
        basicSalary: basicSalary,
        allowances: allowances,
        deductions: deductions,
        overtime: overtime,
        totalSalary: totalSalary,
        notes: formData.notes.trim(),
        updatedAt: new Date()
      };

      await salariesCollection.updateOne(
        { _id: new ObjectId(selectedSalary._id) },
        { $set: updatedSalary }
      );
      
      setSuccess('Salary record updated successfully!');
      setShowEditModal(false);
      setSelectedSalary(null);
      fetchSalaries();

    } catch (error: any) {
      console.error('Error updating salary:', error);
      setError(error.message || 'Failed to update salary record');
    }
  };

  const handleMarkAsPaid = async (salaryId: string) => {
    try {
      setError('');
      const { db } = await connectDB();
      const { ObjectId } = await import('mongodb');

      await db.collection('salaries').updateOne(
        { _id: new ObjectId(salaryId) },
        { 
          $set: { 
            status: 'paid',
            paidDate: new Date(),
            paymentMethod: 'Bank Transfer' // Default payment method
          }
        }
      );

      setSuccess('Salary marked as paid successfully!');
      fetchSalaries();

    } catch (error) {
      console.error('Error marking salary as paid:', error);
      setError('Failed to update salary status');
    }
  };

  const handleMarkAsUnpaid = async (salaryId: string) => {
    try {
      setError('');
      const { db } = await connectDB();
      const { ObjectId } = await import('mongodb');

      await db.collection('salaries').updateOne(
        { _id: new ObjectId(salaryId) },
        { 
          $unset: { 
            paidDate: "",
            paymentMethod: ""
          },
          $set: {
            status: 'unpaid'
          }
        }
      );

      setSuccess('Salary marked as unpaid successfully!');
      fetchSalaries();

    } catch (error) {
      console.error('Error marking salary as unpaid:', error);
      setError('Failed to update salary status');
    }
  };

  const openEditModal = (salary: Salary) => {
    setSelectedSalary(salary);
    setFormData({
      employeeId: salary.employeeId,
      month: salary.month,
      year: salary.year,
      basicSalary: salary.basicSalary.toString(),
      allowances: salary.allowances.toString(),
      deductions: salary.deductions.toString(),
      overtime: salary.overtime.toString(),
      notes: salary.notes || ''
    });
    setShowEditModal(true);
  };

  // Filter salaries
  const filteredSalaries = salaries.filter(salary => {
    const matchesSearch = salary.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salary.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || salary.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get salary statistics
  const stats = {
    total: filteredSalaries.length,
    paid: filteredSalaries.filter(s => s.status === 'paid').length,
    unpaid: filteredSalaries.filter(s => s.status === 'unpaid').length,
    totalAmount: filteredSalaries.reduce((sum, s) => sum + s.totalSalary, 0),
    paidAmount: filteredSalaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.totalSalary, 0)
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
          <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
          <p className="text-gray-600">
            {user.role === 'employee' ? 'View your salary information' : 'Manage employee salaries and payments'}
          </p>
        </div>
        {(user.role === 'admin' || user.role === 'hr') && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Salary Record
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

      {/* Month/Year Selector and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Period</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="form-input"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-input"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <div className="text-sm text-gray-600">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.unpaid}</div>
              <div className="text-sm text-gray-600">Unpaid</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">${stats.paidAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Paid Amount</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">${stats.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
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
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Salary Records */}
      <div className="space-y-4">
        {filteredSalaries.map((salary) => (
          <div key={salary._id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{salary.employeeName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`badge-${salary.status === 'paid' ? 'success' : 'danger'}`}>
                      {salary.status}
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${salary.totalSalary.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Basic Salary:</span>
                    <div className="text-gray-900">${salary.basicSalary.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Allowances:</span>
                    <div className="text-green-600">${salary.allowances.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Deductions:</span>
                    <div className="text-red-600">${salary.deductions.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Overtime:</span>
                    <div className="text-blue-600">${salary.overtime.toLocaleString()}</div>
                  </div>
                </div>

                {salary.notes && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <p className="text-gray-600 mt-1">{salary.notes}</p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Period: {months.find(m => m.value === parseInt(salary.month))?.label} {salary.year}
                  {salary.paidDate && (
                    <span className="ml-4">
                      Paid on: {new Date(salary.paidDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons for admin/hr */}
              {(user.role === 'admin' || user.role === 'hr') && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openEditModal(salary)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit Salary"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {salary.status === 'unpaid' ? (
                    <button
                      onClick={() => handleMarkAsPaid(salary._id)}
                      className="text-green-600 hover:text-green-900"
                      title="Mark as Paid"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsUnpaid(salary._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Mark as Unpaid"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSalaries.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No salary records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : `No salary records for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
            }
          </p>
        </div>
      )}

      {/* Add Salary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Salary Record</h2>
              
              <form onSubmit={handleAddSalary} className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Month *</label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: e.target.value})}
                      className="form-input"
                      required
                    >
                      {months.map(month => (
                        <option key={month.value} value={month.value.toString().padStart(2, '0')}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Year *</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      className="form-input"
                      required
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Basic Salary *</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Allowances</label>
                    <input
                      type="number"
                      value={formData.allowances}
                      onChange={(e) => setFormData({...formData, allowances: e.target.value})}
                      className="form-input"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="form-label">Deductions</label>
                    <input
                      type="number"
                      value={formData.deductions}
                      onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                      className="form-input"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Overtime</label>
                  <input
                    type="number"
                    value={formData.overtime}
                    onChange={(e) => setFormData({...formData, overtime: e.target.value})}
                    className="form-input"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                {/* Total Calculation Preview */}
                {formData.basicSalary && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Total Salary:</div>
                    <div className="text-lg font-bold text-indigo-600">
                      ${calculateTotalSalary(
                        parseFloat(formData.basicSalary) || 0,
                        parseFloat(formData.allowances) || 0,
                        parseFloat(formData.deductions) || 0,
                        parseFloat(formData.overtime) || 0
                      ).toLocaleString()}
                    </div>
                  </div>
                )}

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
                    Add Salary Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {showEditModal && selectedSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Salary Record</h2>
              
              <form onSubmit={handleEditSalary} className="space-y-4">
                <div>
                  <label className="form-label">Employee</label>
                  <input
                    type="text"
                    value={selectedSalary.employeeName}
                    className="form-input bg-gray-50"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Month</label>
                    <input
                      type="text"
                      value={months.find(m => m.value === parseInt(selectedSalary.month))?.label}
                      className="form-input bg-gray-50"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label">Year</label>
                    <input
                      type="text"
                      value={selectedSalary.year}
                      className="form-input bg-gray-50"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Basic Salary *</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Allowances</label>
                    <input
                      type="number"
                      value={formData.allowances}
                      onChange={(e) => setFormData({...formData, allowances: e.target.value})}
                      className="form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="form-label">Deductions</label>
                    <input
                      type="number"
                      value={formData.deductions}
                      onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                      className="form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Overtime</label>
                  <input
                    type="number"
                    value={formData.overtime}
                    onChange={(e) => setFormData({...formData, overtime: e.target.value})}
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Total Calculation Preview */}
                {formData.basicSalary && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Total Salary:</div>
                    <div className="text-lg font-bold text-indigo-600">
                      ${calculateTotalSalary(
                        parseFloat(formData.basicSalary) || 0,
                        parseFloat(formData.allowances) || 0,
                        parseFloat(formData.deductions) || 0,
                        parseFloat(formData.overtime) || 0
                      ).toLocaleString()}
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="form-input"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSalary(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Salary Record
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