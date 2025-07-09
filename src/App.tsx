import React, { useState, useEffect } from 'react';
import { AuthUser } from './types';
import { getUserById } from './lib/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import UserManagement from './components/UserManagement';
import EmployeeManagement from './components/EmployeeManagement';
import AttendanceManagement from './components/AttendanceManagement';
import LeaveManagement from './components/LeaveManagement';
import SalaryManagement from './components/SalaryManagement';
import Settings from './components/Settings';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('ems_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Verify user still exists and is active
        getUserById(userData.id).then(currentUser => {
          if (currentUser && currentUser.isActive) {
            setUser(currentUser);
          } else {
            localStorage.removeItem('ems_user');
          }
          setIsLoading(false);
        });
      } catch (error) {
        localStorage.removeItem('ems_user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('ems_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ems_user');
    setActiveTab('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'employees':
        return <EmployeeManagement user={user} />;
      case 'users':
        return user.role === 'admin' ? <UserManagement /> : <Dashboard user={user} />;
      case 'attendance':
        return <AttendanceManagement user={user} />;
      case 'leave':
        return <LeaveManagement user={user} />;
      case 'salary':
        return <SalaryManagement user={user} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        user={user}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;