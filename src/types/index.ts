export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  department: string;
  phone: string;
  employeeId: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  loginCount: number;
}

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workingHours?: number;
  notes?: string;
  createdAt: string;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'emergency' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export interface Salary {
  _id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  overtime: number;
  totalSalary: number;
  status: 'paid' | 'unpaid' | 'processing';
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}