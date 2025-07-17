const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Employee = require('./models/Employee');

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Remove deprecated options
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('ENOTFOUND')) {
      console.error('');
      console.error('🔧 DNS Resolution Error - Your MongoDB URI seems incorrect');
      console.error('💡 Expected format: mongodb+srv://username:password@cluster0.czfzgkd.mongodb.net/employee_management');
      console.error('💡 Check your MongoDB Atlas cluster URL');
      console.error('💡 Verify your internet connection');
    } else if (error.message.includes('authentication failed')) {
      console.error('');
      console.error('🔧 Authentication Error');
      console.error('💡 Check your MongoDB Atlas username and password');
      console.error('💡 Ensure user has proper database permissions');
    } else if (error.message.includes('IP')) {
      console.error('');
      console.error('🔧 Network Access Error');
      console.error('💡 Add your IP address to MongoDB Atlas Network Access');
      console.error('💡 Or use 0.0.0.0/0 for testing (not recommended for production)');
    }
    
    console.error('');
    console.error('📋 To fix this:');
    console.error('1. Check your .env file has the correct MONGODB_URI');
    console.error('2. Verify MongoDB Atlas cluster is running');
    console.error('3. Check Network Access settings in MongoDB Atlas');
    console.error('4. Verify Database Access user permissions');
    
    process.exit(1);
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('ℹ️  Default admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: process.env.DEFAULT_ADMIN_NAME || 'System Administrator',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@company.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      department: 'IT',
      phone: '+1234567890',
      employeeId: 'EMP0001',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Default admin user created successfully');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
    console.log('⚠️  Please change the default password after first login!');
  } catch (error) {
    console.error('❌ Error creating default admin user:', error.message);
  }
};

// Create sample employee data
const createSampleEmployees = async () => {
  try {
    // Check if employees already exist
    const existingEmployees = await Employee.countDocuments();
    if (existingEmployees > 0) {
      console.log('ℹ️  Sample employees already exist');
      return;
    }

    const sampleEmployees = [
      {
        name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1234567891',
        department: 'Engineering',
        position: 'Software Engineer',
        salary: 75000,
        hireDate: new Date('2023-01-15'),
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567892',
          relationship: 'Spouse'
        },
        bankDetails: {
          accountNumber: '1234567890',
          bankName: 'ABC Bank',
          ifscCode: 'ABC0001234',
          accountHolderName: 'John Doe'
        },
        documents: {
          aadharNumber: '123456789012',
          panNumber: 'ABCDE1234F'
        }
      },
      {
        name: 'Alice Smith',
        email: 'alice.smith@company.com',
        phone: '+1234567893',
        department: 'HR',
        position: 'HR Manager',
        salary: 65000,
        hireDate: new Date('2023-02-01'),
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Bob Smith',
          phone: '+1234567894',
          relationship: 'Spouse'
        },
        bankDetails: {
          accountNumber: '2345678901',
          bankName: 'XYZ Bank',
          ifscCode: 'XYZ0001234',
          accountHolderName: 'Alice Smith'
        },
        documents: {
          aadharNumber: '234567890123',
          panNumber: 'BCDEF2345G'
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1234567895',
        department: 'Sales',
        position: 'Sales Representative',
        salary: 55000,
        hireDate: new Date('2023-03-10'),
        address: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Sarah Johnson',
          phone: '+1234567896',
          relationship: 'Sister'
        },
        bankDetails: {
          accountNumber: '3456789012',
          bankName: 'DEF Bank',
          ifscCode: 'DEF0001234',
          accountHolderName: 'Mike Johnson'
        },
        documents: {
          aadharNumber: '345678901234',
          panNumber: 'CDEFG3456H'
        }
      }
    ];

    await Employee.insertMany(sampleEmployees);
    console.log('✅ Sample employees created successfully');
  } catch (error) {
    console.error('❌ Error creating sample employees:', error.message);
  }
};

// Create sample users for employees
const createSampleUsers = async () => {
  try {
    // Get all employees
    const employees = await Employee.find();
    
    for (const employee of employees) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: employee.email });
      if (existingUser) {
        continue;
      }

      // Create user for employee
      const user = new User({
        name: employee.name,
        email: employee.email,
        password: 'password123', // Default password
        role: employee.department.toLowerCase() === 'hr' ? 'hr' : 'employee',
        department: employee.department,
        phone: employee.phone,
        employeeId: employee.employeeId,
        isActive: true
      });

      await user.save();
      console.log(`✅ User created for employee: ${employee.name}`);
    }
  } catch (error) {
    console.error('❌ Error creating sample users:', error.message);
  }
};

// Main setup function
const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup...');
    console.log('');
    
    await connectDB();
    await createDefaultAdmin();
    await createSampleEmployees();
    await createSampleUsers();
    
    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Setup Summary:');
    console.log('- ✅ MongoDB connection established');
    console.log('- ✅ Default admin user created');
    console.log('- ✅ Sample employees created');
    console.log('- ✅ Sample users created');
    console.log('');
    console.log('🔐 Default Login Credentials:');
    console.log(`Admin: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@company.com'} / ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
    console.log('Employees: [employee-email] / password123');
    console.log('');
    console.log('⚠️  Important: Please change all default passwords after first login!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: cd .. && npm run dev');
    console.log('3. Open http://localhost:5173 in your browser');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run setup
setupDatabase();