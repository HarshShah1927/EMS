import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { generatePayslipPDF, generateInvoicePDF, generateDispatchSlipPDF, generateReportPDF } from '../utils/pdfGenerator';
import { sendPayslipEmail, sendInvoiceEmail } from '../utils/emailService';
import { sendLowStockAlert } from '../utils/smsService';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
  phone?: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'late';
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  alertPhone?: string;
}

interface DispatchItem {
  id: string;
  orderNumber: string;
  client: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  status: 'ready' | 'packed' | 'in_transit' | 'delivered';
  assignedTo?: string;
  dispatchDate?: string;
  deliveryDate?: string;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  createdAt: string;
  avatar?: string;
  password?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'hr' | 'employee' | 'inventory_manager';
  createdAt: string;
  isActive: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  userId?: string;
}

interface DataContextType {
  employees: Employee[];
  attendance: AttendanceRecord[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  dispatch: DispatchItem[];
  admins: Admin[];
  users: User[];
  notifications: Notification[];
  activities: Activity[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  updateInventory: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  updateDispatch: (id: string, updates: Partial<DispatchItem>) => void;
  addAdmin: (admin: Omit<Admin, 'id' | 'createdAt'>) => void;
  updateAdmin: (id: string, updates: Partial<Admin>) => void;
  deleteAdmin: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  downloadInvoice: (invoice: Invoice) => void;
  downloadPayslip: (employee: Employee, month: string) => Promise<void>;
  downloadDispatchSlip: (dispatchItem: DispatchItem) => Promise<void>;
  downloadReport: (reportType: string, reportData: any) => Promise<void>;
  sendPayslipByEmail: (employee: Employee, month: string) => Promise<void>;
  sendInvoiceByEmail: (invoice: Invoice) => Promise<void>;
  checkLowStock: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  getEmployeeAttendanceHistory: (employeeId: string) => AttendanceRecord[];
  changeAdminPassword: (adminId: string, newPassword: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      position: 'Senior Developer',
      department: 'Engineering',
      salary: 85000,
      joinDate: '2022-01-15',
      status: 'active',
      phone: '+1234567890',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      position: 'HR Manager',
      department: 'Human Resources',
      salary: 75000,
      joinDate: '2021-03-22',
      status: 'active',
      phone: '+1234567891',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      position: 'Marketing Specialist',
      department: 'Marketing',
      salary: 60000,
      joinDate: '2023-06-10',
      status: 'active',
      phone: '+1234567892',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    }
  ]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    // Current month attendance
    {
      id: '1',
      employeeId: '1',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '17:30',
      hoursWorked: 8.5,
      status: 'present'
    },
    {
      id: '2',
      employeeId: '2',
      date: '2024-01-15',
      checkIn: '08:45',
      checkOut: '17:15',
      hoursWorked: 8.5,
      status: 'present'
    },
    {
      id: '3',
      employeeId: '3',
      date: '2024-01-15',
      checkIn: '09:15',
      checkOut: '17:45',
      hoursWorked: 8.5,
      status: 'late'
    },
    // Previous months attendance for history
    {
      id: '4',
      employeeId: '1',
      date: '2023-12-20',
      checkIn: '09:00',
      checkOut: '17:30',
      hoursWorked: 8.5,
      status: 'present'
    },
    {
      id: '5',
      employeeId: '1',
      date: '2023-12-21',
      checkIn: '09:10',
      checkOut: '17:40',
      hoursWorked: 8.5,
      status: 'late'
    },
    {
      id: '6',
      employeeId: '2',
      date: '2023-12-20',
      checkIn: '08:50',
      checkOut: '17:20',
      hoursWorked: 8.5,
      status: 'present'
    },
    {
      id: '7',
      employeeId: '3',
      date: '2023-11-15',
      checkIn: '09:00',
      checkOut: '17:30',
      hoursWorked: 8.5,
      status: 'present'
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      clientName: 'ABC Corporation',
      clientEmail: 'billing@abc-corp.com',
      amount: 25000,
      date: '2024-01-10',
      dueDate: '2024-02-10',
      status: 'paid',
      items: [
        { description: 'Web Development Services', quantity: 1, rate: 25000, total: 25000 }
      ]
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      clientName: 'XYZ Industries',
      clientEmail: 'accounts@xyz-industries.com',
      amount: 15000,
      date: '2024-01-12',
      dueDate: '2024-02-12',
      status: 'pending',
      items: [
        { description: 'Software Consultation', quantity: 1, rate: 15000, total: 15000 }
      ]
    }
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Laptop Dell XPS 13',
      category: 'Electronics',
      quantity: 15,
      unit: 'pieces',
      price: 1200,
      supplier: 'Dell Inc.',
      lastUpdated: '2024-01-10',
      status: 'in_stock',
      alertPhone: '+91 9405042893'
    },
    {
      id: '2',
      name: 'Office Chair Ergonomic',
      category: 'Furniture',
      quantity: 3,
      unit: 'pieces',
      price: 350,
      supplier: 'Office Depot',
      lastUpdated: '2024-01-08',
      status: 'low_stock',
      alertPhone: '+91 9405042893'
    },
    {
      id: '3',
      name: 'A4 Paper Reams',
      category: 'Stationery',
      quantity: 0,
      unit: 'reams',
      price: 8,
      supplier: 'Paper Plus',
      lastUpdated: '2024-01-12',
      status: 'out_of_stock',
      alertPhone: '+91 9405042893'
    }
  ]);

  const [dispatch, setDispatch] = useState<DispatchItem[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      client: 'Tech Solutions Ltd',
      items: [
        { name: 'Laptop Dell XPS 13', quantity: 5 },
        { name: 'Office Chair Ergonomic', quantity: 5 }
      ],
      status: 'ready',
      assignedTo: 'John Dispatcher'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      client: 'Global Corp',
      items: [
        { name: 'A4 Paper Reams', quantity: 10 }
      ],
      status: 'in_transit',
      assignedTo: 'Mike Delivery',
      dispatchDate: '2024-01-14'
    }
  ]);

  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'super_admin',
      permissions: ['all'],
      createdAt: '2024-01-01',
      password: 'admin123',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      createdAt: '2024-01-01',
      isActive: true
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Office Chair Ergonomic is running low (3 units remaining)',
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      title: 'Invoice Overdue',
      message: 'Invoice INV-2024-002 is past due date',
      type: 'error',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: '3',
      title: 'New Employee Added',
      message: 'Mike Davis has been added to the system',
      type: 'success',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false
    }
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', type: 'employee', message: 'New employee John Smith joined Engineering', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: '2', type: 'attendance', message: 'Daily attendance report generated', timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: '3', type: 'invoice', message: 'Invoice INV-2024-002 marked as paid', timestamp: new Date(Date.now() - 21600000).toISOString() },
    { id: '4', type: 'inventory', message: 'Low stock alert: Office Chair Ergonomic', timestamp: new Date(Date.now() - 28800000).toISOString() },
    { id: '5', type: 'dispatch', message: 'Order ORD-2024-001 ready for dispatch', timestamp: new Date(Date.now() - 86400000).toISOString() }
  ]);

  // Auto-update activities every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for new activities based on data changes
      const now = new Date().toISOString();
      
      // Check for low stock items
      const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');
      if (lowStockItems.length > 0) {
        lowStockItems.forEach(item => {
          const existingActivity = activities.find(a => 
            a.message.includes(item.name) && 
            a.type === 'inventory' &&
            new Date(a.timestamp).getTime() > Date.now() - 3600000 // Within last hour
          );
          
          if (!existingActivity) {
            addActivity({
              type: 'inventory',
              message: `Low stock alert: ${item.name} (${item.quantity} ${item.unit} remaining)`
            });
          }
        });
      }

      // Check for overdue invoices
      const overdueInvoices = invoices.filter(inv => 
        inv.status === 'pending' && new Date(inv.dueDate) < new Date()
      );
      
      if (overdueInvoices.length > 0) {
        overdueInvoices.forEach(invoice => {
          const existingActivity = activities.find(a => 
            a.message.includes(invoice.invoiceNumber) && 
            a.type === 'invoice' &&
            new Date(a.timestamp).getTime() > Date.now() - 3600000
          );
          
          if (!existingActivity) {
            addActivity({
              type: 'invoice',
              message: `Invoice ${invoice.invoiceNumber} is overdue`
            });
          }
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [inventory, invoices, activities]);

  // Employee operations
  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = { ...employee, id: Date.now().toString() };
    setEmployees(prev => [...prev, newEmployee]);
    addActivity({
      type: 'employee',
      message: `New employee ${employee.name} added to ${employee.department}`
    });
    addNotification({
      title: 'New Employee Added',
      message: `${employee.name} has been added to the system`,
      type: 'success',
      read: false
    });
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      addActivity({
        type: 'employee',
        message: `Employee ${employee.name} information updated`
      });
    }
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setAttendance(prev => prev.filter(att => att.employeeId !== id));
    if (employee) {
      addActivity({
        type: 'employee',
        message: `Employee ${employee.name} removed from system`
      });
    }
  };

  // Attendance operations
  const addAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() };
    setAttendance(prev => [...prev, newRecord]);
    const employee = employees.find(emp => emp.id === record.employeeId);
    if (employee) {
      addActivity({
        type: 'attendance',
        message: `${employee.name} checked in at ${record.checkIn}`
      });
    }
  };

  const updateAttendance = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendance(prev => prev.map(att => att.id === id ? { ...att, ...updates } : att));
    if (updates.checkOut) {
      const record = attendance.find(att => att.id === id);
      const employee = employees.find(emp => emp.id === record?.employeeId);
      if (employee) {
        addActivity({
          type: 'attendance',
          message: `${employee.name} checked out at ${updates.checkOut}`
        });
      }
    }
  };

  // Invoice operations
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: Date.now().toString() };
    setInvoices(prev => [...prev, newInvoice]);
    addActivity({
      type: 'invoice',
      message: `New invoice ${invoice.invoiceNumber} created for ${invoice.clientName}`
    });
    addNotification({
      title: 'New Invoice Created',
      message: `Invoice ${invoice.invoiceNumber} for $${invoice.amount.toLocaleString()} has been created`,
      type: 'info',
      read: false
    });
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice && updates.status) {
      addActivity({
        type: 'invoice',
        message: `Invoice ${invoice.invoiceNumber} status updated to ${updates.status}`
      });
      
      if (updates.status === 'paid') {
        addNotification({
          title: 'Payment Received',
          message: `Invoice ${invoice.invoiceNumber} has been marked as paid`,
          type: 'success',
          read: false
        });
      }
    }
  };

  const deleteInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    if (invoice) {
      addActivity({
        type: 'invoice',
        message: `Invoice ${invoice.invoiceNumber} deleted`
      });
    }
  };

  // Inventory operations
  const updateInventory = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        
        // Check for low stock and send alert
        if (updatedItem.quantity <= 5 && updatedItem.quantity > 0 && updatedItem.status !== 'low_stock') {
          updatedItem.status = 'low_stock';
          if (updatedItem.alertPhone) {
            sendLowStockAlert(updatedItem, updatedItem.alertPhone);
          }
          addNotification({
            title: 'Low Stock Alert',
            message: `${updatedItem.name} is running low (${updatedItem.quantity} ${updatedItem.unit} remaining)`,
            type: 'warning',
            read: false
          });
        } else if (updatedItem.quantity === 0) {
          updatedItem.status = 'out_of_stock';
          addNotification({
            title: 'Out of Stock',
            message: `${updatedItem.name} is out of stock`,
            type: 'error',
            read: false
          });
        } else if (updatedItem.quantity > 5) {
          updatedItem.status = 'in_stock';
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const deleteInventoryItem = (id: string) => {
    const item = inventory.find(item => item.id === id);
    setInventory(prev => prev.filter(item => item.id !== id));
    if (item) {
      addActivity({
        type: 'inventory',
        message: `Inventory item ${item.name} removed`
      });
    }
  };

  // Dispatch operations
  const updateDispatch = (id: string, updates: Partial<DispatchItem>) => {
    setDispatch(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const dispatchItem = dispatch.find(item => item.id === id);
    if (dispatchItem && updates.status) {
      addActivity({
        type: 'dispatch',
        message: `Order ${dispatchItem.orderNumber} status updated to ${updates.status}`
      });
    }
  };

  // Admin operations
  const addAdmin = (admin: Omit<Admin, 'id' | 'createdAt'>) => {
    const newAdmin = { 
      ...admin, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAdmins(prev => [...prev, newAdmin]);
    addActivity({
      type: 'admin',
      message: `New admin ${admin.name} added to system`
    });
  };

  const updateAdmin = (id: string, updates: Partial<Admin>) => {
    setAdmins(prev => prev.map(admin => admin.id === id ? { ...admin, ...updates } : admin));
  };

  const deleteAdmin = (id: string) => {
    const admin = admins.find(admin => admin.id === id);
    setAdmins(prev => prev.filter(admin => admin.id !== id));
    if (admin) {
      addActivity({
        type: 'admin',
        message: `Admin ${admin.name} removed from system`
      });
    }
  };

  // User operations
  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    addActivity({
      type: 'user',
      message: `New user account created for ${user.username}`
    });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
  };

  const deleteUser = (id: string) => {
    const user = users.find(user => user.id === id);
    setUsers(prev => prev.filter(user => user.id !== id));
    if (user) {
      addActivity({
        type: 'user',
        message: `User account ${user.username} deleted`
      });
    }
  };

  // Download operations
  const downloadInvoice = (invoice: Invoice) => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>${invoice.invoiceNumber}</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Client:</strong> ${invoice.clientName}</p>
          <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.rate.toLocaleString()}</td>
                <td>$${item.total.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total Amount: $${invoice.amount.toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPayslip = async (employee: Employee, month: string) => {
    const salaryData = {
      base: employee.salary,
      bonus: employee.salary * 0.1,
      tax: employee.salary * 0.15,
      net: employee.salary + (employee.salary * 0.1) - (employee.salary * 0.15)
    };

    const pdf = await generatePayslipPDF(employee, salaryData, month);
    pdf.save(`payslip-${employee.name}-${month}.pdf`);
  };

  const downloadDispatchSlip = async (dispatchItem: DispatchItem) => {
    const pdf = await generateDispatchSlipPDF(dispatchItem);
    pdf.save(`dispatch-slip-${dispatchItem.orderNumber}.pdf`);
  };

  const downloadReport = async (reportType: string, reportData: any) => {
    const pdf = await generateReportPDF(reportData, reportType);
    pdf.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Email operations
  const sendPayslipByEmail = async (employee: Employee, month: string) => {
    const salaryData = {
      base: employee.salary,
      bonus: employee.salary * 0.1,
      tax: employee.salary * 0.15,
      net: employee.salary + (employee.salary * 0.1) - (employee.salary * 0.15)
    };

    const pdf = await generatePayslipPDF(employee, salaryData, month);
    const pdfBlob = pdf.output('blob');
    
    await sendPayslipEmail(employee, pdfBlob, month);
  };

  const sendInvoiceByEmail = async (invoice: Invoice) => {
    const pdf = await generateInvoicePDF(invoice);
    const pdfBlob = pdf.output('blob');
    
    await sendInvoiceEmail(invoice, pdfBlob);
  };

  // Check low stock
  const checkLowStock = () => {
    inventory.forEach(item => {
      if ((item.status === 'low_stock' || item.status === 'out_of_stock')) {
        sendLowStockAlert(item, '+91 9405042893');
      }
    });
  };

  // Notification operations
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Activity operations
  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep only last 50 activities
  };

  // Get employee attendance history
  const getEmployeeAttendanceHistory = (employeeId: string) => {
    return attendance.filter(record => record.employeeId === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Change admin password
  const changeAdminPassword = (adminId: string, newPassword: string) => {
    setAdmins(prev => prev.map(admin => 
      admin.id === adminId ? { ...admin, password: newPassword } : admin
    ));
    setUsers(prev => prev.map(user => 
      user.email === admins.find(a => a.id === adminId)?.email 
        ? { ...user, password: newPassword } 
        : user
    ));
    addActivity({
      type: 'admin',
      message: 'Super admin password changed successfully'
    });
    addNotification({
      title: 'Password Changed',
      message: 'Your password has been updated successfully',
      type: 'success',
      read: false
    });
  };

  return (
    <DataContext.Provider value={{
      employees,
      attendance,
      invoices,
      inventory,
      dispatch,
      admins,
      users,
      notifications,
      activities,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addAttendance,
      updateAttendance,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      updateInventory,
      deleteInventoryItem,
      updateDispatch,
      addAdmin,
      updateAdmin,
      deleteAdmin,
      addUser,
      updateUser,
      deleteUser,
      downloadInvoice,
      downloadPayslip,
      downloadDispatchSlip,
      downloadReport,
      sendPayslipByEmail,
      sendInvoiceByEmail,
      checkLowStock,
      addNotification,
      markNotificationAsRead,
      clearAllNotifications,
      addActivity,
      getEmployeeAttendanceHistory,
      changeAdminPassword
    }}>
      {children}
    </DataContext.Provider>
  );
};