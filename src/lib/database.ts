import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hr', 'manager', 'employee'], default: 'employee' },
  department: { type: String, default: '' },
  phone: { type: String, default: '' },
  employeeId: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Employee Schema
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  department: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true, min: 0 },
  hireDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
  address: { type: String, default: '' },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  checkIn: { type: String }, // HH:MM format
  checkOut: { type: String }, // HH:MM format
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day', 'on-leave'], default: 'present' },
  workingHours: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Leave Request Schema
const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  leaveType: { type: String, enum: ['sick', 'vacation', 'personal', 'emergency', 'maternity', 'paternity'], required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD format
  endDate: { type: String, required: true }, // YYYY-MM-DD format
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedDate: { type: Date, default: Date.now },
  approvedBy: { type: String },
  approvedDate: { type: Date },
  rejectionReason: { type: String }
});

// Salary Schema with Advance Salary Feature
const salarySchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  month: { type: String, required: true }, // MM format
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true, min: 0 },
  allowances: { type: Number, default: 0, min: 0 },
  deductions: { type: Number, default: 0, min: 0 },
  overtime: { type: Number, default: 0, min: 0 },
  advanceSalary: { type: Number, default: 0, min: 0 }, // New field for advance salary
  totalSalary: { type: Number, required: true },
  netSalary: { type: Number, required: true }, // After advance salary deduction
  status: { type: String, enum: ['paid', 'unpaid', 'processing'], default: 'unpaid' },
  paidDate: { type: Date },
  paymentMethod: { type: String, default: 'Bank Transfer' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Advance Salary Schema
const advanceSalarySchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true },
  requestDate: { type: Date, default: Date.now },
  approvedBy: { type: String },
  approvedDate: { type: Date },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  paidDate: { type: Date },
  deductionMonth: { type: String }, // MM format
  deductionYear: { type: Number },
  notes: { type: String, default: '' }
});

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
attendanceSchema.index({ employeeId: 1, date: 1 });
leaveRequestSchema.index({ employeeId: 1 });
salarySchema.index({ employeeId: 1, month: 1, year: 1 });
advanceSalarySchema.index({ employeeId: 1 });

// Create models
export const User = mongoose.model('User', userSchema);
export const Employee = mongoose.model('Employee', employeeSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export const Salary = mongoose.model('Salary', salarySchema);
export const AdvanceSalary = mongoose.model('AdvanceSalary', advanceSalarySchema);

// Database connection function
export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = import.meta.env.VITE_MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      dbName: 'employee_management'
    });

    console.log('✅ Connected to MongoDB Atlas successfully');

    // Initialize default data
    await initializeDefaultData();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Initialize default data
const initializeDefaultData = async (): Promise<void> => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@company.com' });
    
    if (!adminExists) {
      const bcrypt = await import('bcryptjs');
      
      // Create default admin user
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin@company.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        department: 'IT',
        phone: '+1234567890',
        employeeId: 'EMP001',
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created');
    }

    // Check if HR user exists
    const hrExists = await User.findOne({ email: 'hr@company.com' });
    
    if (!hrExists) {
      const bcrypt = await import('bcryptjs');
      
      // Create default HR user
      const hrUser = new User({
        name: 'HR Manager',
        email: 'hr@company.com',
        password: await bcrypt.hash('hr123', 12),
        role: 'hr',
        department: 'Human Resources',
        phone: '+1234567891',
        employeeId: 'EMP002',
        isActive: true
      });
      
      await hrUser.save();
      console.log('✅ Default HR user created');
    }

    console.log('✅ Database initialization completed');
    
  } catch (error) {
    console.error('❌ Error initializing default data:', error);
  }
};

// Disconnect from database
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};