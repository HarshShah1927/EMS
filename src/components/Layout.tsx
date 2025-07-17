import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  Home,
  Users,
  Clock,
  DollarSign,
  FileText,
  Package,
  Truck,
  BarChart3,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Shield,
  BellRing,
  Check,
  Trash2
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead, clearAllNotifications } = useData();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Salary', href: '/salary', icon: DollarSign },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Dispatch', href: '/dispatch', icon: Truck },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Admin Profile', href: '/admin', icon: Shield },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EMS</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900">Employee MS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-5 w-5`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="ml-4 lg:ml-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="text-gray-500 hover:text-gray-700 relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {unreadCount > 0 ? <BellRing className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{unreadCount}</span>
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{unreadCount} unread</span>
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Clear all notifications"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                  <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 10 && (
                      <div className="p-3 text-center border-t border-gray-200">
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user?.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'}
                    alt=""
                  />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notification overlay */}
      {notificationOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setNotificationOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;