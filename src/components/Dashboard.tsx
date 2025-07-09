import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types';
import { connectDB } from '../lib/mongodb';

interface DashboardProps {
  user: AuthUser;
}

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  todayAttendance: number;
  pendingLeaves: number;
  unpaidSalaries: number;
  totalSalaryAmount: number;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
    unpaidSalaries: 0,
    totalSalaryAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const { db } = await connectDB();
      
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Get employee stats
      const totalEmployees = await db.collection('employees').countDocuments();
      const activeEmployees = await db.collection('employees').countDocuments({ status: 'active' });

      // Get today's attendance
      const todayAttendance = await db.collection('attendance').countDocuments({ 
        date: today,
        status: { $in: ['present', 'late'] }
      });

      // Get pending leaves
      const pendingLeaves = await db.collection('leave_requests').countDocuments({ 
        status: 'pending' 
      });

      // Get unpaid salaries for current month
      const unpaidSalaries = await db.collection('salaries').countDocuments({
        month: currentMonth.toString().padStart(2, '0'),
        year: currentYear,
        status: 'unpaid'
      });

      // Get total salary amount for current month
      const salaryAggregation = await db.collection('salaries').aggregate([
        {
          $match: {
            month: currentMonth.toString().padStart(2, '0'),
            year: currentYear
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalSalary' }
          }
        }
      ]).toArray();

      const totalSalaryAmount = salaryAggregation.length > 0 ? salaryAggregation[0].totalAmount : 0;

      // Get recent activities
      const activities = await db.collection('attendance')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      setStats({
        totalEmployees,
        activeEmployees,
        todayAttendance,
        pendingLeaves,
        unpaidSalaries,
        totalSalaryAmount
      });

      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: Clock,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: Calendar,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Unpaid Salaries',
      value: stats.unpaidSalaries,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Monthly Salary Total',
      value: `$${stats.totalSalaryAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{activity.employeeName}</p>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                  </div>
                  <span className={`badge-${
                    activity.status === 'present' ? 'success' :
                    activity.status === 'late' ? 'warning' : 'danger'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <div className="font-medium text-indigo-900">Mark Attendance</div>
              <div className="text-sm text-indigo-600">Record today's attendance</div>
            </button>
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="font-medium text-green-900">Apply for Leave</div>
              <div className="text-sm text-green-600">Submit a leave request</div>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="font-medium text-purple-900">View Salary</div>
              <div className="text-sm text-purple-600">Check salary details</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}