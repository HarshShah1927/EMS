# Quick Login Fix - Admin User Creation

## 🔐 Default Login Credentials

**Email**: `admin@company.com`
**Password**: `admin123`

## 🚨 If Login Still Fails

The issue is likely that the admin user wasn't created due to the MongoDB connection problem. Here's how to fix it:

### Option 1: Create Admin User Manually (Recommended)

1. **Open your backend server** (make sure it's running)
2. **Create a simple admin creation script**:

Create `backend/create-admin-now.js`:
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to any available database
const createAdmin = async () => {
  try {
    // Try to connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/ems');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log('Could not connect to MongoDB, trying in-memory...');
    // If MongoDB not available, this won't work
    // You'll need to use MongoDB Atlas or install MongoDB
  }

  // Delete existing admin if any
  await User.deleteOne({ email: 'admin@company.com' });
  
  // Create new admin
  const admin = new User({
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    department: 'IT',
    phone: '+1234567890',
    employeeId: 'EMP001',
    isActive: true
  });

  await admin.save();
  console.log('✅ Admin user created!');
  console.log('📧 Email: admin@company.com');
  console.log('🔑 Password: admin123');
  process.exit(0);
};

createAdmin().catch(console.error);
```

3. **Run the script**:
```bash
cd backend
node create-admin-now.js
```

### Option 2: Use MongoDB Atlas (Easiest)

1. **Go to https://cloud.mongodb.com**
2. **Create a free account**
3. **Create a new cluster** (free tier)
4. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
5. **Update backend/.env**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ems?retryWrites=true&w=majority
   ```
6. **Create admin user**:
   ```bash
   cd backend
   npm run setup-simple
   ```

### Option 3: Use Mock Authentication (Quick Test)

If you just want to test the frontend, temporarily modify the login:

1. **Edit `src/contexts/AuthContext.tsx`**:
```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  // Temporary mock login for testing
  if (email === 'admin@company.com' && password === 'admin123') {
    setUser({
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin',
      department: 'IT',
      isActive: true,
      loginCount: 1
    });
    return true;
  }
  
  // Original API call (comment out temporarily)
  /*
  try {
    const user = await loginUser({ email, password });
    if (user) {
      setUser(user);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
  */
  
  return false;
};
```

### Option 4: Check Backend Logs

1. **Make sure backend is running**:
```bash
cd backend
npm run dev
```

2. **Check if you see these messages**:
```
✅ MongoDB Connected: localhost
✅ Admin user created successfully
```

3. **If not, try**:
```bash
cd backend
npm run setup-simple
```

## 🔍 Debugging Steps

### 1. Check if backend is running
- Open http://localhost:5000/api/health
- Should show: `{"success":true,"message":"EMS Backend API is running"}`

### 2. Check database connection
```bash
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ems')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.log('❌ Failed:', err.message));
"
```

### 3. Check if admin user exists
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect('mongodb://localhost:27017/ems').then(async () => {
  const admin = await User.findOne({ email: 'admin@company.com' });
  console.log('Admin user:', admin ? 'EXISTS' : 'NOT FOUND');
  process.exit(0);
});
"
```

## 🎯 Most Likely Solution

The admin user wasn't created because of the MongoDB connection issue. **Use MongoDB Atlas** (free cloud database):

1. **Create Atlas account**: https://cloud.mongodb.com
2. **Create cluster** (free tier)
3. **Get connection string**
4. **Update backend/.env** with the connection string
5. **Run**: `cd backend && npm run setup-simple`
6. **Login with**: admin@company.com / admin123

## 📞 Still Not Working?

If you're still having issues:

1. **Check browser console** for errors (F12 → Console)
2. **Check network tab** to see if login request is being made
3. **Verify backend is running** on port 5000
4. **Try the mock authentication** option above for testing

The credentials are definitely:
- **Email**: `admin@company.com`
- **Password**: `admin123`

The issue is that the admin user wasn't created due to database connection problems.