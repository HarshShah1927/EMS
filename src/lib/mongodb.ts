// MongoDB Atlas connection configuration
export const MONGODB_CONFIG = {
  connectionString: import.meta.env.VITE_MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/employee_management',
  database: 'employee_management',
  collections: {
    employees: 'employees',
    attendance: 'attendance',
    invoices: 'invoices',
    inventory: 'inventory',
    dispatch: 'dispatch',
    admins: 'admins',
    users: 'users'
  }
}

// API endpoints for MongoDB operations
export const API_ENDPOINTS = {
  employees: '/api/employees',
  attendance: '/api/attendance',
  invoices: '/api/invoices',
  inventory: '/api/inventory',
  dispatch: '/api/dispatch',
  admins: '/api/admins',
  users: '/api/users',
  reports: '/api/reports'
}