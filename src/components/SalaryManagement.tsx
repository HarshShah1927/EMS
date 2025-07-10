import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Check, X, Search, Filter, Calendar, TrendingUp, CreditCard } from 'lucide-react';
import { AuthUser } from '../types';
import { Employee, Salary, AdvanceSalary } from '../lib/database';

interface SalaryManagementProps {
  user: AuthUser;
}

interface SalaryRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  overtime: number;
  advanceSalary: number;
  totalSalary: number;
  netSalary: number;
  status: 'paid' | 'unpaid' | 'processing';
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

interface AdvanceSalaryRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  requestDate: string;
  approvedBy?: string;
  approvedDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  paidDate?: string;
  deductionMonth?: string;
  deductionYear?: number;
  notes?: string;
}

interface EmployeeRecord {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: string;
}

export default function SalaryManagement({ user }: SalaryManagementProps) {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [advanceSalaries, setAdvanceSalaries] = useState<AdvanceSalaryRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'salary' | 'advance'>('salary');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for salary
  const [formData, setFormData] = useState({
    employeeId: '',
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: '',
    deductions: '',
    overtime: '',
    advanceSalary: '',
    notes: ''
  });

  // Form state for advance salary
  const [advanceFormData, setAdvanceFormData] = useState({
    employeeId: '',
    amount: '',
    reason: '',
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
    fetchAdvanceSalaries();
  }, [selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      const employeesList = await Employee.find({ status: 'active' }).sort({ name: 1 });
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    }
  };

  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
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

      const salariesList = await Salary.find(query).sort({ employeeName: 1 });
      setSalaries(salariesList);
    } catch (error) {
      console.error('Error fetching salaries:', error);
      setError('Failed to load salary records');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdvanceSalaries = async () => {
    try {
      const query = user.role === 'employee' 
        ? { employeeId: user.id }
        : {};

      const advanceList = await AdvanceSalary.find(query).sort({ requestDate: -1 });
      setAdvanceSalaries(advanceList);
    } catch (error) {
      console.error('Error fetching advance salaries:', error);
      setError('Failed to load advance salary records');
    }
  };

  const calculateTotalSalary = (basic: number, allowances: number, deductions: number, overtime: number): number => {
    return Math.max(0, basic + allowances + overtime - deductions);
  };

  const calculateNetSalary = (totalSalary: number, advanceSalary: number): number => {
    return Math.max(0, totalSalary - advanceSalary);
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
      advanceSalary: '',
      notes: ''
    });
  };

  const resetAdvanceForm = () => {
    setAdvanceFormData({
      employeeId: '',
      amount: '',
      reason: '',
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
      const advanceSalary = parseFloat(formData.advanceSalary) || 0;

      if (isNaN(basicSalary) || basicSalary < 0) {
        setError('Please enter a valid basic salary');
        return;
      }

      if (allowances < 0 || deductions < 0 || overtime < 0 || advanceSalary < 0) {
        setError('All salary components must be non-negative');
        return;
      }

      // Check if salary already exists for this employee and month/year
      const existingSalary = await Salary.findOne({
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

      // Calculate total and net salary
      const totalSalary = calculateTotalSalary(basicSalary, allowances, deductions, overtime);
      const netSalary = calculateNetSalary(totalSalary, advanceSalary);

      // Create salary record
      const newSalary = new Salary({
        employeeId: formData.employeeId,
        employeeName: employee.name,
        month: formData.month,
        year: formData.year,
        basicSalary: basicSalary,
        allowances: allowances,
        deductions: deductions,
        overtime: overtime,
        advanceSalary: advanceSalary,
        totalSalary: totalSalary,
        netSalary: netSalary,
        status: 'unpaid',
        notes: formData.notes.trim()
      });

      await newSalary.save();
      
      setSuccess('Salary record added successfully!');
      resetForm();
      setShowAddModal(false);
      fetchSalaries();

    } catch (error: any) {
      console.error('Error adding salary:', error);
      setError(error.message || 'Failed to add salary record');
    }
  };

  const handleAddAdvanceSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!advanceFormData.employeeId || !advanceFormData.amount || !advanceFormData.reason) {
        setError('Please fill in all required fields');
        return;
      }

      const amount = parseFloat(advanceFormData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      // Find employee details
      const employee = employees.find(emp => emp.employeeId === advanceFormData.employeeId);
      if (!employee) {
        setError('Employee not found');
        return;
      }

      // Create advance salary record
      const newAdvanceSalary = new AdvanceSalary({
        employeeId: advanceFormData.employeeId,
        employeeName: employee.name,
        amount: amount,
        reason: advanceFormData.reason.trim(),
        status: user.role === 'employee' ? 'pending' : 'approved',
        approvedBy: user.role !== 'employee' ? user.name : undefined,
        approvedDate: user.role !== 'employee' ? new Date() : undefined,
        notes: advanceFormData.notes.trim()
      });

      await newAdvanceSalary.save();
      
      setSuccess('Advance salary request submitted successfully!');
      resetAdvanceForm();
      setShowAdvanceModal(false);
      fetchAdvanceSalaries();

    } catch (error: any) {
      console.error('Error adding advance salary:', error);
      setError(error.message || 'Failed to add advance salary request');
    }
  };

  const handleMarkAsPaid = async (salaryId: string) => {
    try {
      setError('');
      await Salary.findByIdAndUpdate(salaryId, {
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: 'Bank Transfer'
      });

      setSuccess('Salary marked as paid successfully!');
      fetchSalaries();

    } catch (error) {
      console.error('Error marking salary as paid:', error);
      setError('Failed to update salary status');
    }
  };

  const handleApproveAdvance = async (advanceId: string) => {
    try {
      setError('');
      await AdvanceSalary.findByIdAndUpdate(advanceId, {
        status: 'approved',
        approvedBy: user.name,
        approvedDate: new Date()
      });

      setSuccess('Advance salary approved successfully!');
      fetchAdvanceSalaries();

    } catch (error) {
      console.error('Error approving advance salary:', error);
      setError('Failed to approve advance salary');
    }
  };

  const handleRejectAdvance = async (advanceId: string) => {
    try {
      setError('');
      await AdvanceSalary.findByIdAndUpdate(advanceId, {
        status: 'rejected',
        approvedBy: user.name,
        approvedDate: new Date()
      });

      setSuccess('Advance salary rejected successfully!');
      fetchAdvanceSalaries();

    } catch (error) {
      console.error('Error rejecting advance salary:', error);
      setError('Failed to reject advance salary');
    }
  };

  // Filter salaries
  const filteredSalaries = salaries.filter(salary => {
    const matchesSearch = salary.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salary.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || salary.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Filter advance salaries
  const filteredAdvanceSalaries = advanceSalaries.filter(advance => {
    const matchesSearch = advance.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advance.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get salary statistics
  const stats = {
    total: filteredSalaries.length,
    paid: filteredSalaries.filter(s => s.status === 'paid').length,
    unpaid: filteredSalaries.filter(s => s.status === 'unpaid').length,
    totalAmount: filteredSalaries.reduce((sum, s) => sum + s.totalSalary, 0),
    paidAmount: filteredSalaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.totalSalary, 0),
    advanceTotal: filteredAdvanceSalaries.reduce((sum, a) => sum + a.amount, 0),
    advancePending: filteredAdvanceSalaries.filter(a => a.status === 'pending').length
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
            {user.role === 'employee' ? 'View your salary information and request advances' : 'Manage employee salaries and advance payments'}
          </p>
        </div>
        <div className="flex space-x-3">
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
          <button
            onClick={() => {
              resetAdvanceForm();
              setShowAdvanceModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {user.role === 'employee' ? 'Request Advance' : 'Add Advance'}
          </button>
        </div>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('salary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'salary'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Salary Records
          </button>
          <button
            onClick={() => setActiveTab('advance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'advance'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Advance Salary
            {stats.advancePending > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {stats.advancePending}
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'salary' && (
        <>
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
                <option value="processing">Processing</option>
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
                        <span className={`badge-${salary.status === 'paid' ? 'success' : salary.status === 'processing' ? 'warning' : 'danger'}`}>
                          {salary.status}
                        </span>
                        <span className="text-lg font-bold text-indigo-600">
                          ${salary.netSalary.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
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
                      <div>
                        <span className="font-medium text-gray-700">Advance Deducted:</span>
                        <div className="text-orange-600">${salary.advanceSalary.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Salary:</span>
                        <span className="text-lg font-bold text-gray-900">${salary.totalSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-medium text-gray-700">Net Salary (After Advance):</span>
                        <span className="text-xl font-bold text-indigo-600">${salary.netSalary.toLocaleString()}</span>
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
                  {(user.role === 'admin' || user.role === 'hr') && salary.status === 'unpaid' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleMarkAsPaid(salary._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as Paid"
                      >
                        <Check className="w-5 h-5" />
                      </button>
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
        </>
      )}

      {activeTab === 'advance' && (
        <>
          {/* Advance Salary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600">${stats.advanceTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Advances</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.advancePending}</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredAdvanceSalaries.filter(a => a.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredAdvanceSalaries.filter(a => a.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Advance Salary Records */}
          <div className="space-y-4">
            {filteredAdvanceSalaries.map((advance) => (
              <div key={advance._id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{advance.employeeName}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`badge-${
                          advance.status === 'approved' || advance.status === 'paid' ? 'success' :
                          advance.status === 'rejected' ? 'danger' : 'warning'
                        }`}>
                          {advance.status}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ${advance.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Reason:</span>
                        <div className="text-gray-900">{advance.reason}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Request Date:</span>
                        <div className="text-gray-900">{new Date(advance.requestDate).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {advance.approvedBy && (
                      <div className="mt-3 text-xs text-gray-500">
                        {advance.status === 'approved' ? 'Approved' : 'Rejected'} by: {advance.approvedBy}
                        {advance.approvedDate && ` on ${new Date(advance.approvedDate).toLocaleDateString()}`}
                      </div>
                    )}

                    {advance.notes && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <p className="text-gray-600 mt-1">{advance.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons for admin/hr */}
                  {(user.role === 'admin' || user.role === 'hr') && advance.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleApproveAdvance(advance._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Advance"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRejectAdvance(advance._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Advance"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredAdvanceSalaries.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No advance salary requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No advance salary requests have been submitted yet
              </p>
            </div>
          )}
        </>
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

                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <label className="form-label">Advance Salary</label>
                    <input
                      type="number"
                      value={formData.advanceSalary}
                      onChange={(e) => setFormData({...formData, advanceSalary: e.target.value})}
                      className="form-input"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Total Calculation Preview */}
                {formData.basicSalary && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Salary Calculation:</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Salary:</span>
                        <span className="font-medium">
                          ${calculateTotalSalary(
                            parseFloat(formData.basicSalary) || 0,
                            parseFloat(formData.allowances) || 0,
                            parseFloat(formData.deductions) || 0,
                            parseFloat(formData.overtime) || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-indigo-600 font-bold">
                        <span>Net Salary:</span>
                        <span>
                          ${calculateNetSalary(
                            calculateTotalSalary(
                              parseFloat(formData.basicSalary) || 0,
                              parseFloat(formData.allowances) || 0,
                              parseFloat(formData.deductions) || 0,
                              parseFloat(formData.overtime) || 0
                            ),
                            parseFloat(formData.advanceSalary) || 0
                          ).toLocaleString()}
                        </span>
                      </div>
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

      {/* Add Advance Salary Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {user.role === 'employee' ? 'Request Advance Salary' : 'Add Advance Salary'}
              </h2>
              
              <form onSubmit={handleAddAdvanceSalary} className="space-y-4">
                {user.role !== 'employee' && (
                  <div>
                    <label className="form-label">Employee *</label>
                    <select
                      value={advanceFormData.employeeId}
                      onChange={(e) => setAdvanceFormData({...advanceFormData, employeeId: e.target.value})}
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
                  <label className="form-label">Amount *</label>
                  <input
                    type="number"
                    value={advanceFormData.amount}
                    onChange={(e) => setAdvanceFormData({...advanceFormData, amount: e.target.value})}
                    className="form-input"
                    min="0"
                    step="0.01"
                    placeholder="Enter advance amount"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Reason *</label>
                  <textarea
                    value={advanceFormData.reason}
                    onChange={(e) => setAdvanceFormData({...advanceFormData, reason: e.target.value})}
                    className="form-input"
                    rows={3}
                    placeholder="Please provide a reason for the advance salary request..."
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    value={advanceFormData.notes}
                    onChange={(e) => setAdvanceFormData({...advanceFormData, notes: e.target.value})}
                    className="form-input"
                    rows={2}
                    placeholder="Optional additional notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanceModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    {user.role === 'employee' ? 'Submit Request' : 'Add Advance'}
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