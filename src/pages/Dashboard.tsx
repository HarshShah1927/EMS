import React from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Clock, DollarSign, FileText, Package, Truck, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { employees, attendance, invoices, inventory, dispatch, activities } = useData();

  const stats = [
    {
      name: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      name: 'Today\'s Attendance',
      value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
      icon: Clock,
      color: 'bg-green-500',
      change: '95% present'
    },
    {
      name: 'Monthly Revenue',
      value: `$${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15% from last month'
    },
    {
      name: 'Pending Invoices',
      value: invoices.filter(inv => inv.status === 'pending').length,
      icon: FileText,
      color: 'bg-purple-500',
      change: '2 overdue'
    },
    {
      name: 'Low Stock Items',
      value: inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length,
      icon: Package,
      color: 'bg-red-500',
      change: '3 need reorder'
    },
    {
      name: 'Ready to Dispatch',
      value: dispatch.filter(item => item.status === 'ready').length,
      icon: Truck,
      color: 'bg-indigo-500',
      change: '1 urgent'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Low Stock Alert</p>
                <p className="text-xs text-red-600">3 items need immediate reorder</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Overdue Invoices</p>
                <p className="text-xs text-yellow-600">2 invoices are past due date</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Truck className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Dispatch Ready</p>
                <p className="text-xs text-blue-600">1 order ready for immediate dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Revenue Chart</p>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Employee Performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;