import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { DollarSign, Download, Eye, Calculator, TrendingUp, Users, Mail } from 'lucide-react';
import apiService from '../lib/api';

const Salary: React.FC = () => {
  const { employees, downloadPayslip, sendPayslipByEmail, updateEmployee } = useData();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Advance Salary State
  const [advanceRequests, setAdvanceRequests] = useState<any[]>([]);
  const [advanceLoading, setAdvanceLoading] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({ amount: '', reason: '', deductionSchedule: 'single_month', notes: '' });
  const [selectedAdvance, setSelectedAdvance] = useState<any>(null);
  const [advanceAction, setAdvanceAction] = useState<'approve' | 'reject' | 'pay' | null>(null);
  const user = { role: 'admin' }; // TODO: get from context/auth

  const calculateSalary = (employee: any) => {
    const baseSalary = employee.salary;
    const bonus = baseSalary * 0.1; // 10% bonus
    const tax = baseSalary * 0.15; // 15% tax
    const netSalary = baseSalary + bonus - tax;
    
    return {
      base: baseSalary,
      bonus,
      tax,
      net: netSalary
    };
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + calculateSalary(emp).net, 0);

  const generatePayslip = (employee: any) => {
    setSelectedEmployee(employee);
    setShowPayslipModal(true);
  };

  const handleDownloadPayslip = async (employee: any) => {
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    await downloadPayslip(employee, monthName);
  };

  const handleEmailPayslip = async (employee: any) => {
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    await sendPayslipByEmail(employee, monthName);
  };

  // Fetch advance salary requests
  useEffect(() => {
    setAdvanceLoading(true);
    apiService.getAdvanceSalaries().then(res => {
      if (res.success && res.data) setAdvanceRequests(res.data);
      setAdvanceLoading(false);
    });
  }, []);

  // Request advance salary
  const handleAdvanceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdvanceLoading(true);
    await apiService.createAdvanceSalary({
      employeeId: '1', // TODO: get from auth context
      amount: Number(advanceForm.amount),
      reason: advanceForm.reason,
      deductionSchedule: advanceForm.deductionSchedule,
      notes: advanceForm.notes
    });
    const res = await apiService.getAdvanceSalaries();
    if (res.success && res.data) setAdvanceRequests(res.data);
    setAdvanceLoading(false);
    setShowAdvanceModal(false);
    setAdvanceForm({ amount: '', reason: '', deductionSchedule: 'single_month', notes: '' });
  };

  // Approve/Reject/Pay/Delete actions
  const handleAdvanceAction = async (action: 'approve' | 'reject' | 'pay' | 'delete', advance: any, extra?: any) => {
    setAdvanceLoading(true);
    if (action === 'approve') await apiService.approveAdvanceSalary(advance._id);
    if (action === 'reject') await apiService.rejectAdvanceSalary(advance._id, extra?.rejectionReason || '');
    if (action === 'pay') await apiService.markAdvanceSalaryAsPaid(advance._id, extra);
    if (action === 'delete') await apiService.deleteAdvanceSalary(advance._id);
    const res = await apiService.getAdvanceSalaries();
    if (res.success && res.data) setAdvanceRequests(res.data);
    setAdvanceLoading(false);
    setSelectedAdvance(null);
    setAdvanceAction(null);
  };

  const [showEditSalaryModal, setShowEditSalaryModal] = useState(false);
  const [editSalaryEmployee, setEditSalaryEmployee] = useState<any>(null);
  const [editSalaryValue, setEditSalaryValue] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Download className="h-4 w-4" />
            Export Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900">${totalPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Salary</p>
              <p className="text-2xl font-bold text-gray-900">${Math.round(totalPayroll / employees.length).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Employee Salaries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                const salary = calculateSalary(employee);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={employee.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'}
                          alt=""
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${salary.base.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      +${salary.bonus.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -${salary.tax.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${salary.net.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generatePayslip(employee)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="View Payslip"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPayslip(employee)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEmailPayslip(employee)}
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                          title="Send Email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setEditSalaryEmployee(employee);
                              setEditSalaryValue(employee.salary.toString());
                              setShowEditSalaryModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 flex items-center gap-1"
                            title="Edit Salary"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {showPayslipModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Payslip</h2>
              <button
                onClick={() => setShowPayslipModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-semibold">Employee Management System</h3>
                <p className="text-sm text-gray-600">Payslip for {new Date(selectedMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Employee Name</p>
                  <p className="text-lg font-semibold">{selectedEmployee.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Employee ID</p>
                  <p className="text-lg font-semibold">{selectedEmployee.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Position</p>
                  <p className="text-lg font-semibold">{selectedEmployee.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-lg font-semibold">{selectedEmployee.department}</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-4">Salary Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base Salary</span>
                    <span className="font-medium">${calculateSalary(selectedEmployee).base.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Bonus (10%)</span>
                    <span className="font-medium">+${calculateSalary(selectedEmployee).bonus.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Tax (15%)</span>
                    <span className="font-medium">-${calculateSalary(selectedEmployee).tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Salary</span>
                      <span>${calculateSalary(selectedEmployee).net.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-center text-sm text-gray-500">
                <p>This is a computer-generated payslip. No signature required.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDownloadPayslip(selectedEmployee)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={() => handleEmailPayslip(selectedEmployee)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance Salary Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Advance Salary Requests</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAdvanceModal(true)}
          >
            Request Advance Salary
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {advanceRequests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{req.employeeName || req.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${req.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.deductionSchedule.replace('_', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'approved' ? 'bg-blue-100 text-blue-800' : req.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    {user.role === 'admin' && req.status === 'pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-900" onClick={() => { setSelectedAdvance(req); setAdvanceAction('approve'); }}>Approve</button>
                        <button className="text-red-600 hover:text-red-900" onClick={() => { setSelectedAdvance(req); setAdvanceAction('reject'); }}>Reject</button>
                      </>
                    )}
                    {user.role === 'admin' && req.status === 'approved' && (
                      <button className="text-blue-600 hover:text-blue-900" onClick={() => { setSelectedAdvance(req); setAdvanceAction('pay'); }}>Mark as Paid</button>
                    )}
                    {user.role === 'admin' && (
                      <button className="text-gray-400 hover:text-gray-700" onClick={() => handleAdvanceAction('delete', req)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Advance Salary Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Request Advance Salary</h2>
            <form className="space-y-4" onSubmit={handleAdvanceRequest}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input type="number" required min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2" value={advanceForm.amount} onChange={e => setAdvanceForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={advanceForm.reason} onChange={e => setAdvanceForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deduction Schedule</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={advanceForm.deductionSchedule} onChange={e => setAdvanceForm(f => ({ ...f, deductionSchedule: e.target.value }))}>
                  <option value="single_month">Single Month</option>
                  <option value="two_months">Two Months</option>
                  <option value="three_months">Three Months</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" value={advanceForm.notes} onChange={e => setAdvanceForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">Submit</button>
                <button type="button" className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors" onClick={() => setShowAdvanceModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Advance Salary Action Modal */}
      {selectedAdvance && advanceAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{advanceAction === 'approve' ? 'Approve' : advanceAction === 'reject' ? 'Reject' : 'Mark as Paid'} Advance Salary</h2>
            {advanceAction === 'reject' ? (
              <form onSubmit={e => { e.preventDefault(); handleAdvanceAction('reject', selectedAdvance, { rejectionReason: (e.target as any).rejectionReason.value }); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                  <input name="rejectionReason" required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">Reject</button>
                  <button type="button" className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors" onClick={() => { setSelectedAdvance(null); setAdvanceAction(null); }}>Cancel</button>
                </div>
              </form>
            ) : advanceAction === 'pay' ? (
              <form onSubmit={e => { e.preventDefault(); handleAdvanceAction('pay', selectedAdvance, { paymentMethod: (e.target as any).paymentMethod.value, deductionStartMonth: (e.target as any).deductionStartMonth.value, notes: (e.target as any).notes.value }); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select name="paymentMethod" required className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deduction Start Month</label>
                  <input name="deductionStartMonth" type="month" required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                  <textarea name="notes" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">Mark as Paid</button>
                  <button type="button" className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors" onClick={() => { setSelectedAdvance(null); setAdvanceAction(null); }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors" onClick={() => handleAdvanceAction('approve', selectedAdvance)}>Approve</button>
                <button className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors" onClick={() => { setSelectedAdvance(null); setAdvanceAction(null); }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
      {showEditSalaryModal && editSalaryEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Salary for {editSalaryEmployee.name}</h2>
            <form onSubmit={async e => {
              e.preventDefault();
              await updateEmployee(editSalaryEmployee._id || editSalaryEmployee.id, { salary: Number(editSalaryValue) });
              setShowEditSalaryModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input type="number" required min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2" value={editSalaryValue} onChange={e => setEditSalaryValue(e.target.value)} />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                <button type="button" className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors" onClick={() => setShowEditSalaryModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;