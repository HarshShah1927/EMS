const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  if (email === 'admin@company.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@company.com',
          role: 'admin',
          department: 'IT',
          isActive: true,
          loginCount: 1
        },
        token: 'mock-jwt-token-12345'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// Mock profile endpoint
app.get('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin',
      department: 'IT',
      isActive: true,
      loginCount: 1
    }
  });
});

// Mock logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock EMS Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mock'
  });
});

// Mock advance salary endpoints
app.get('/api/advance-salary', (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 Mock EMS Backend Server running on port', PORT);
  console.log('🌍 Environment: development (mock mode)');
  console.log('📊 Health check: http://localhost:' + PORT + '/api/health');
  console.log('');
  console.log('🔐 Login credentials:');
  console.log('   Email: admin@company.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('💡 This is a mock server for testing the frontend');
  console.log('💡 For full functionality, set up MongoDB Atlas');
});