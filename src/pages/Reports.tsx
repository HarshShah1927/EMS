import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart3, TrendingUp, Download, Calendar, Users, DollarSign, Package, FileText, PieChart, Activity, Target } from 'lucide-react';

const Reports: React.FC = () => {
  const { employees, attendance, invoices, inventory, downloadReport, getEmployeeAttendanceHistory } = useData();
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('monthly');

  const generateOverviewStats = () => {
    const totalEmployees = employees.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;
    
    // Calculate attendance rate properly
    const totalAttendanceRecords = attendance.length;
    const presentRecords = attendance.filter(record => record.status === 'present' || record.status === 'late').length;
    const attendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 0;
    
    return {
      totalEmployees,
      totalRevenue,
      paidInvoices,
      inventoryValue,
      lowStockItems,
      attendanceRate
    };
  };

  const generateEmployeeReport = () => {
    const departmentStats = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const salaryStats = {
      total: employees.reduce((sum, emp) => sum + emp.salary, 0),
      average: Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length),
      highest: Math.max(...employees.map(emp => emp.salary)),
      lowest: Math.min(...employees.map(emp => emp.salary))
    };

    // Generate attendance history for each employee
    const employeeAttendanceStats = employees.map(employee => {
      const attendanceHistory = getEmployeeAttendanceHistory(employee.id);
      const totalDays = attendanceHistory.length;
      const presentDays = attendanceHistory.filter(record => record.status === 'present' || record.status === 'late').length;
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      
      return {
        ...employee,
        totalAttendanceDays: totalDays,
        presentDays,
        attendanceRate,
        lastAttendance: attendanceHistory[0]?.date || 'No records'
      };
    });

    return { departmentStats, salaryStats, employeeAttendanceStats };
  };

  const generateFinancialReport = () => {
    const monthlyRevenue = invoices.reduce((acc, inv) => {
      const month = new Date(inv.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = {
      paid: invoices.filter(inv => inv.status === 'paid').length,
      pending: invoices.filter(inv => inv.status === 'pending').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length
    };

    return { monthlyRevenue, statusBreakdown };
  };

  const stats = generateOverviewStats();
  const employeeReport = generateEmployeeReport();
  const financialReport = generateFinancialReport();

  const handleDownloadReport = async () => {
    let endpoint = '';
    if (reportType === 'employee') endpoint = '/api/report/salary';
    else if (reportType === 'financial') endpoint = '/api/report/dispatch';
    else endpoint = '/api/report/inventory';
    const res = await fetch(endpoint, { credentials: 'include' });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const renderPowerBIStyleDashboard = () => (
    <div className="space-y-6">
      {/* Header with KPIs */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Executive Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-sm opacity-75">+15% vs last month</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active Employees</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-sm opacity-75">+2 new hires</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Attendance Rate</p>
                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
              </div>
              <Activity className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-sm opacity-75">
              {stats.attendanceRate >= 90 ? 'Above target' : 'Below target'}
            </div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Inventory Value</p>
                <p className="text-2xl font-bold">${stats.inventoryValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-sm opacity-75">{stats.lowStockItems} items low</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="h-64 bg-gradient-to-t from-blue-50 to-white rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
            <div className="text-center">
              <div className="grid grid-cols-6 gap-2 mb-4">
                {Object.entries(financialReport.monthlyRevenue).map(([month, amount], index) => (
                  <div key={month} className="text-center">
                    <div 
                      className="bg-blue-500 rounded-t mx-auto mb-1"
                      style={{ 
                        height: `${(amount / Math.max(...Object.values(financialReport.monthlyRevenue))) * 80}px`,
                        width: '20px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-600">{month}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">Monthly Revenue Distribution</p>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
            <PieChart className="h-5 w-5 text-green-600" />
          </div>
          <div className="h-64 bg-gradient-to-br from-green-50 to-white rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
            <div className="text-center">
              <div className="space-y-3">
                {Object.entries(employeeReport.departmentStats).map(([dept, count], index) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'];
                  return (
                    <div key={dept} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded ${colors[index % colors.length]} mr-3`}></div>
                        <span className="text-sm text-gray-700">{dept}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Invoice Status</h3>
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-green-800">Paid</span>
              </div>
              <span className="text-lg font-bold text-green-600">{financialReport.statusBreakdown.paid}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-yellow-800">Pending</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{financialReport.statusBreakdown.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-red-800">Overdue</span>
              </div>
              <span className="text-lg font-bold text-red-600">{financialReport.statusBreakdown.overdue}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            <Target className="h-5 w-5 text-orange-600" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Attendance Rate</span>
                <span className="font-medium">{stats.attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${stats.attendanceRate >= 90 ? 'bg-green-500' : stats.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${stats.attendanceRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Invoice Collection</span>
                <span className="font-medium">{Math.round((stats.paidInvoices / invoices.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(stats.paidInvoices / invoices.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Inventory Health</span>
                <span className="font-medium">{Math.round(((inventory.length - stats.lowStockItems) / inventory.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${((inventory.length - stats.lowStockItems) / inventory.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employees by Salary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Employees by Salary</h3>
          <div className="space-y-3">
            {employees
              .sort((a, b) => b.salary - a.salary)
              .slice(0, 5)
              .map((employee, index) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.department}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">${employee.salary.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {invoices
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">{invoice.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${invoice.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmployeeReport = () => (
    <div className="space-y-6">
      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Distribution</h3>
          <div className="space-y-3">
            {Object.entries(employeeReport.departmentStats).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{dept}</span>
                <span className="text-sm font-medium text-gray-900">{count} employees</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Payroll</span>
              <span className="text-sm font-medium text-gray-900">${employeeReport.salaryStats.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Salary</span>
              <span className="text-sm font-medium text-gray-900">${employeeReport.salaryStats.average.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Highest Salary</span>
              <span className="text-sm font-medium text-gray-900">${employeeReport.salaryStats.highest.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lowest Salary</span>
              <span className="text-sm font-medium text-gray-900">${employeeReport.salaryStats.lowest.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Attendance History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeReport.employeeAttendanceStats.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.totalAttendanceDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.presentDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{employee.attendanceRate}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            employee.attendanceRate >= 90 ? 'bg-green-500' : 
                            employee.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${employee.attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.lastAttendance !== 'No records' 
                      ? new Date(employee.lastAttendance).toLocaleDateString()
                      : employee.lastAttendance
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${employee.salary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Paid Invoices</div>
          <div className="text-2xl font-bold text-green-600">{financialReport.statusBreakdown.paid}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Pending Invoices</div>
          <div className="text-2xl font-bold text-yellow-600">{financialReport.statusBreakdown.pending}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Overdue Invoices</div>
          <div className="text-2xl font-bold text-red-600">{financialReport.statusBreakdown.overdue}</div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(financialReport.monthlyRevenue).map(([month, amount]) => (
            <div key={month} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{month}</span>
              <span className="text-sm font-medium text-gray-900">${amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <button 
          onClick={handleDownloadReport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="overview">Power BI Dashboard</option>
              <option value="employee">Employee Report</option>
              <option value="financial">Financial Report</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'overview' && renderPowerBIStyleDashboard()}
      {reportType === 'employee' && renderEmployeeReport()}
      {reportType === 'financial' && renderFinancialReport()}
      {reportType === 'inventory' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Report</h3>
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Inventory report coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;