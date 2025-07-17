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
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bankDetails: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolderName: string;
  };
  documents: {
    aadharNumber: string;
    panNumber: string;
  };
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
  };
  manager?: string;
  terminationDate?: string;
  terminationReason?: string;
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
  status: 'present' | 'absent' | 'late' | 'half-day' | 'work-from-home';
  workingHours?: number;
  breakTime?: number;
  overtime?: number;
  notes?: string;
  location: 'office' | 'home' | 'client-site' | 'other';
  approvedBy?: string;
  isManualEntry: boolean;
  createdAt: string;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'emergency' | 'maternity' | 'paternity' | 'casual' | 'annual';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  attachments?: Array<{
    filename: string;
    originalName: string;
    path: string;
    uploadDate: string;
  }>;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  handoverNotes?: string;
  coveringEmployee?: string;
  coveringEmployeeName?: string;
}

export interface Salary {
  _id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: {
    hra: number;
    transport: number;
    medical: number;
    bonus: number;
    other: number;
    total: number;
  };
  deductions: {
    pf: number;
    esi: number;
    tax: number;
    advance: number;
    other: number;
    total: number;
  };
  overtime: {
    hours: number;
    rate: number;
    amount: number;
  };
  workingDays: number;
  presentDays: number;
  absentDays: number;
  totalSalary: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid' | 'cancelled';
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  paidDate?: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'cheque';
  paymentReference?: string;
  notes?: string;
  advanceDeductions: Array<{
    advanceId: string;
    amount: number;
    description: string;
  }>;
  payslipGenerated: boolean;
  payslipPath?: string;
  createdAt: string;
}

export interface AdvanceSalary {
  _id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  requestDate: string;
  approvedDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
  approvedByName?: string;
  rejectionReason?: string;
  paymentDate?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  deductionSchedule: 'single_month' | 'two_months' | 'three_months' | 'custom';
  monthlyDeduction: number;
  totalDeducted: number;
  remainingAmount: number;
  isFullyDeducted: boolean;
  deductionStartMonth?: string;
  deductionEndMonth?: string;
  notes?: string;
  attachments?: Array<{
    filename: string;
    originalName: string;
    path: string;
    uploadDate: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  employeeId?: string;
  isActive: boolean;
  lastLogin?: string;
  loginCount: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}