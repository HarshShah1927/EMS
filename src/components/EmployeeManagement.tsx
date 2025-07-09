import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import { AuthUser, Employee } from '../types';
import { connectDB } from '../lib/mongodb';

interface EmployeeManagementProps {
  user: AuthUser;
}

export default function EmployeeManagement({ user }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    hireDate: '',
    status: 'active' as 'active' | 'inactive' | 'terminated',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const departments = [
    'Human Resources',
    'Information Technology',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'Customer Service',
    'Research & Development'
  ];

  const positions = [
    'Manager',
    'Senior Developer',
    'Developer',
    'Analyst',
    'Coordinator',
    'Specialist',
    'Assistant',
    'Executive',
    'Director',
    'Intern'
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { db } = await connectDB();
      const employeesCollection = db.collection('employees');
      
      const employeesList = await employeesCollection.find({})
        .sort({ createdAt: -1 })
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
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      salary: '',
      hireDate: '',
      status: 'active',
      address: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    });
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.name.trim() || !formData.email.trim() || !formData.employeeId.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate salary
      const salary = parseFloat(formData.salary);
      if (isNaN(salary) || salary < 0) {
        setError('Please enter a valid salary amount');
        return;
      }

      const { db } = await connectDB();
      const employeesCollection = db.collection('employees');

      // Check for duplicate employee ID or email
      const existingEmployee = await employeesCollection.findOne({
        $or: [
          { employeeId: formData.employeeId },
          { email: formData.email.toLowerCase() }
        ]
      });

      if (existingEmployee) {
        setError('Employee ID or email already exists');
        return;
      }

      // Create employee
      const newEmployee = {
        employeeId: formData.employeeId,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        position: formData.position,
        salary: salary,
        hireDate: formData.hireDate,
        status: formData.status,
        address: formData.address.trim(),
        emergencyContact: {
          name: formData.emergencyContact.name.trim(),
          phone: formData.emergencyContact.phone.trim(),
          relationship: formData.emergencyContact.relationship.trim()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await employeesCollection.insertOne(newEmployee);
      
      setSuccess('Employee added successfully!');
      resetForm();
      setShowAddModal(false);
      fetchEmployees();

    } catch (error: any) {
      console.error('Error adding employee:', error);
      setError(error.message || 'Failed to add employee');
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate salary
      const salary = parseFloat(formData.salary);
      if (isNaN(salary) || salary < 0) {
        setError('Please enter a valid salary amount');
        return;
      }

      const { db } = await connectDB();
      const employeesCollection = db.collection('employees');
      const { ObjectId } = await import('mongodb');

      // Check for duplicate email (excluding current employee)
      const existingEmployee = await employeesCollection.findOne({
        email: formData.email.toLowerCase(),
        _id: { $ne: new ObjectId(selectedEmployee._id) }
      });

      if (existingEmployee) {
        setError('Email already exists for another employee');
        return;
      }

      // Update employee
      const updatedEmployee = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        position: formData.position,
        salary: salary,
        hireDate: formData.hireDate,
        status: formData.status,
        address: formData.address.trim(),
        emergencyContact: {
          name: formData.emergencyContact.name.trim(),
          phone: formData.emergencyContact.phone.trim(),
          relationship: formData.emergencyContact.relationship.trim()
        },
        updatedAt: new Date()
      };

      await employeesCollection.updateOne(
        { _id: new ObjectId(selectedEmployee._id) },
        { $set: updatedEmployee }
      );
      
      setSuccess('Employee updated successfully!');
      setShowEditModal(false);
      setSelectedEmployee(null);
      fetchEmployees();

    } catch (error: any) {
      console.error('Error updating employee:', error);
      setError(error.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      const { db } = await connectDB();
      const { ObjectId } = await import('mongodb');

      await db.collection('employees').deleteOne({ _id: new ObjectId(employeeId) });
      
      setSuccess('Employee deleted successfully!');
      fetchEmployees();

    } catch (error) {
      console.error('Error deleting employee:', error);
      setError('Failed to delete employee');
    }
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      salary: employee.salary.toString(),
      hireDate: employee.hireDate,
      status: employee.status,
      address: employee.address,
      emergencyContact: {
        name: employee.emergencyContact?.name || '',
        phone: employee.emergencyContact?.phone || '',
        relationship: employee.emergencyContact?.relationship || ''
      }
    });
    setShowEditModal(true);
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage employee information and records</p>
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
            Add Employee
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
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="form-input"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div key={employee._id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.position}</p>
                <p className="text-xs text-gray-500">ID: {employee.employeeId}</p>
              </div>
              <span className={`badge-${
                employee.status === 'active' ? 'success' :
                employee.status === 'inactive' ? 'warning' : 'danger'
              }`}>
                {employee.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {employee.email}
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {employee.phone || 'Not provided'}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {employee.department}
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                ${employee.salary.toLocaleString()}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Hired: {new Date(employee.hireDate).toLocaleDateString()}
              </div>
            </div>

            {(user.role === 'admin' || user.role === 'hr') && (
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => openEditModal(employee)}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Edit Employee"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee._id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Employee"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterDepartment !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding a new employee'
            }
          </p>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Employee</h2>
              
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Employee ID *</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      className="form-input"
                      placeholder="e.g., EMP001"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="form-input"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Position</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="form-input"
                      required
                    >
                      <option value="">Select Position</option>
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Salary</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      className="form-input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Hire Date</label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="form-input"
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {...formData.emergencyContact, name: e.target.value}
                        })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                        })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Relationship</label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                        })}
                        className="form-input"
                        placeholder="e.g., Spouse, Parent"
                      />
                    </div>
                  </div>
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
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Employee</h2>
              
              <form onSubmit={handleEditEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      className="form-input bg-gray-50"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="form-input"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Position</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="form-input"
                      required
                    >
                      <option value="">Select Position</option>
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Salary</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      className="form-input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Hire Date</label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="form-input"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="form-input"
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {...formData.emergencyContact, name: e.target.value}
                        })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                        })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Relationship</label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                        })}
                        className="form-input"
                        placeholder="e.g., Spouse, Parent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedEmployee(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Employee
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