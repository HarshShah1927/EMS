# MongoDB Connection and Data Persistence Fix

This guide provides solutions for the MongoDB connection and data persistence issues in the EMS (Employee Management System).

## Issues Resolved

1. ✅ Unable to login with default credentials (admin@company.com / admin123 and employee@company.com / employee123)
2. ✅ Employee data not getting stored in MongoDB database
3. ✅ Data not persisting after page reload
4. ✅ MongoDB connection configuration issues

## Prerequisites

- Node.js and npm installed
- MongoDB installed locally OR Docker available
- Ubuntu/Linux environment

## Quick Fix Solution

### Option 1: Automated Setup

Run the automated setup script:

```bash
cd backend
chmod +x start-with-mongodb.sh
./start-with-mongodb.sh
```

### Option 2: Manual Setup

1. **Install and Start MongoDB:**

```bash
# Install MongoDB
sudo apt update
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify MongoDB is running
sudo systemctl status mongodb
```

2. **Alternative - Using Docker:**

```bash
# If MongoDB installation fails, use Docker
docker run -d --name mongodb-ems -p 27017:27017 mongo:latest
```

3. **Configure Environment:**

```bash
cd backend
cp .env.production .env
```

4. **Install Dependencies:**

```bash
npm install
```

5. **Initialize Database:**

```bash
node setup.js
```

6. **Start the Backend:**

```bash
npm start
```

## Environment Configuration

The `.env` file should contain:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ems_database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Default Admin Configuration
DEFAULT_ADMIN_EMAIL=admin@company.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=System Administrator

# Default Employee Configuration
DEFAULT_EMPLOYEE_EMAIL=employee@company.com
DEFAULT_EMPLOYEE_PASSWORD=employee123
DEFAULT_EMPLOYEE_NAME=Test Employee
```

## Default Login Credentials

After setup, you can login with:

**Admin User:**
- Email: `admin@company.com`
- Password: `admin123`
- Role: `admin`

**Employee User:**
- Email: `employee@company.com`
- Password: `employee123`
- Role: `employee`

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
```bash
sudo systemctl status mongodb
# or
ps aux | grep mongo
```

2. **Test database connection:**
```bash
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ems_database')
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ Connection failed:', err.message));
"
```

3. **Verify data in database:**
```bash
mongo ems_database --eval "db.users.find().pretty()"
```

### Data Persistence Issues

If data is not persisting:

1. Ensure MongoDB service is running
2. Check database connection string in `.env`
3. Verify write permissions for MongoDB data directory
4. Check for any database connection errors in server logs

### Login Issues

If login fails:

1. Verify users exist in database
2. Check password hashing is working correctly
3. Ensure JWT secret is properly configured
4. Check for any authentication middleware errors

## Files Created/Modified

- `backend/.env.production` - Production environment template
- `backend/start-with-mongodb.sh` - Automated setup script
- Updated `backend/.env.example` - Environment configuration template

## Testing the Fix

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend:
```bash
# In workspace root
npm run dev
```

3. Test login with the provided credentials
4. Add a new employee and verify it persists after page reload
5. Test admin functions like deleting data

## Additional Notes

- The `.env` file is ignored by git for security reasons
- Use `.env.production` as a template for production deployment
- Change the JWT_SECRET in production environment
- For cloud deployment, update MONGODB_URI to your cloud database connection string

---

**Status:** ✅ Fixed
**Date:** $(date)
**Issues Resolved:** MongoDB connection, data persistence, default user authentication