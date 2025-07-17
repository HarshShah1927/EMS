import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, Shield, Users, Settings, Crown, UserPlus, Key, Lock } from 'lucide-react';

const AdminProfile: React.FC = () => {
  const { admins, addAdmin, updateAdmin, deleteAdmin, users, addUser, updateUser, deleteUser, changeAdminPassword } = useData();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('admins');

  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    role: 'admin' as 'super_admin' | 'admin',
    permissions: [] as string[]
  });

  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'hr' | 'employee' | 'inventory_manager',
    isActive: true
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const availablePermissions = [
    'employee_management',
    'attendance_management',
    'salary_management',
    'invoice_management',
    'inventory_management',
    'dispatch_management',
    'reports_access',
    'admin_management'
  ];

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdmin) {
      updateAdmin(editingAdmin.id, adminFormData);
    } else {
      addAdmin(adminFormData);
    }
    resetAdminForm();
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, userFormData);
    } else {
      addUser(userFormData);
    }
    resetUserForm();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find super admin
    const superAdmin = admins.find(admin => admin.role === 'super_admin');
    
    if (!superAdmin) {
      alert('Super admin not found');
      return;
    }

    if (passwordFormData.currentPassword !== superAdmin.password) {
      alert('Current password is incorrect');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    changeAdminPassword(superAdmin.id, passwordFormData.newPassword);
    resetPasswordForm();
    alert('Password changed successfully!');
  };

  const resetAdminForm = () => {
    setAdminFormData({
      name: '',
      email: '',
      role: 'admin',
      permissions: []
    });
    setEditingAdmin(null);
    setShowAdminModal(false);
  };

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      email: '',
      password: '',
      role: 'employee',
      isActive: true
    });
    setEditingUser(null);
    setShowUserModal(false);
  };

  const resetPasswordForm = () => {
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(false);
  };

  const handleEditAdmin = (admin: any) => {
    setEditingAdmin(admin);
    setAdminFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    });
    setShowAdminModal(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setShowUserModal(true);
  };

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      deleteAdmin(id);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
    }
  };

  const togglePermission = (permission: string) => {
    setAdminFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
          >
            <Key className="h-4 w-4" />
            Change Password
          </button>
          <button
            onClick={() => setShowAdminModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Add Admin
          </button>
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admins ({admins.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users ({users.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'admins' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdmins.map((admin) => (
                <div key={admin.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={admin.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'}
                        alt={admin.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          {admin.name}
                          {admin.role === 'super_admin' && <Crown className="h-4 w-4 text-yellow-500" />}
                        </h3>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {admin.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="capitalize">{admin.role.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Settings className="h-4 w-4 mr-2" />
                      {admin.permissions.includes('all') ? 'All Permissions' : `${admin.permissions.length} Permissions`}
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {admin.permissions.length > 0 && !admin.permissions.includes('all') && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.slice(0, 3).map(permission => (
                          <span key={permission} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                        {admin.permissions.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{admin.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
            </h2>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={adminFormData.role}
                  onChange={(e) => setAdminFormData({...adminFormData, role: e.target.value as 'super_admin' | 'admin'})}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              {adminFormData.role !== 'super_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={adminFormData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {permission.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAdmin ? 'Update' : 'Add'} Admin
                </button>
                <button
                  type="button"
                  onClick={resetAdminForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Create New Account'}
            </h2>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({...userFormData, role: e.target.value as any})}
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userFormData.isActive}
                    onChange={(e) => setUserFormData({...userFormData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active Account</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingUser ? 'Update' : 'Create'} Account
                </button>
                <button
                  type="button"
                  onClick={resetUserForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-red-600 mr-2" />
              <h2 className="text-xl font-bold">Change Super Admin Password</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={passwordFormData.currentPassword}
                  onChange={(e) => setPasswordFormData({...passwordFormData, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={passwordFormData.newPassword}
                  onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={resetPasswordForm}
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

export default AdminProfile;