import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Salary from './pages/Salary';
import Invoices from './pages/Invoices';
import Inventory from './pages/Inventory';
import Dispatch from './pages/Dispatch';
import Reports from './pages/Reports';
import AdminProfile from './pages/AdminProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="salary" element={<Salary />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="dispatch" element={<Dispatch />} />
                <Route path="reports" element={<Reports />} />
                <Route path="admin" element={<AdminProfile />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;