# 🚀 Complete Employee Management System Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Project Setup](#project-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [First Login](#first-login)
7. [Features Overview](#features-overview)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

### Step 1: Install Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (recommended for most users)
3. Run the installer and follow the setup wizard
4. Accept all default settings
5. **Verify installation:**
   - Open Command Prompt (Windows) or Terminal (Mac/Linux)
   - Type: `node --version` and press Enter
   - Type: `npm --version` and press Enter
   - You should see version numbers for both

### Step 2: Install Git (Optional but recommended)
1. Go to [https://git-scm.com/](https://git-scm.com/)
2. Download Git for your operating system
3. Install with default settings

### Step 3: Install a Code Editor
1. Download Visual Studio Code from [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Install with default settings

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **"Try Free"**
3. Sign up with your email or Google account
4. Verify your email address

### Step 2: Create a New Cluster
1. After logging in, click **"Build a Database"**
2. Choose **"M0 Sandbox"** (FREE tier)
3. Select a cloud provider (AWS recommended)
4. Choose a region closest to your location
5. Give your cluster a name (e.g., "ems-cluster")
6. Click **"Create Cluster"**
7. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User
1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username: `emsuser`
5. Click **"Autogenerate Secure Password"** and **COPY the password**
6. Under "Database User Privileges", select **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access
1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**
5. Wait for the status to become "Active"

### Step 5: Get Connection String
1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"4.1 or later"**
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://emsuser:<password>@ems-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you copied earlier
7. **Save this connection string** - you'll need it soon!

---

## 💻 Project Setup

### Step 1: Create Project Folder
1. Create a new folder on your desktop called **"EMS-System"**
2. Open Command Prompt/Terminal
3. Navigate to your folder:
   ```bash
   cd Desktop/EMS-System
   ```

### Step 2: Set Up Project Files
You need to create the following files with the exact content provided:

#### Create package.json
```json
{
  "name": "employee-management-system",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@types/bcryptjs": "^2.4.6",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

#### Create .env file
```env
# MongoDB Atlas Configuration
VITE_MONGODB_URI=mongodb+srv://emsuser:YOUR_PASSWORD@ems-cluster.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority

# Application Configuration
VITE_APP_NAME=Employee Management System
VITE_APP_VERSION=1.0.0
```

**IMPORTANT:** Replace `YOUR_PASSWORD` and `ems-cluster.xxxxx` with your actual MongoDB Atlas credentials!

### Step 3: Install Dependencies
1. In your project folder, run:
   ```bash
   npm install
   ```
2. Wait for all packages to download (this may take 2-5 minutes)

---

## ⚙️ Environment Configuration

### Update .env File
1. Open the `.env` file you created
2. Replace the MongoDB URI with your actual connection string from MongoDB Atlas
3. Make sure the password and cluster name are correct
4. Save the file

**Example:**
```env
VITE_MONGODB_URI=mongodb+srv://emsuser:MySecurePassword123@ems-cluster.abc123.mongodb.net/employee_management?retryWrites=true&w=majority
```

---

## 🚀 Running the Application

### Step 1: Start the Development Server
1. In your project folder terminal, run:
   ```bash
   npm run dev
   ```
2. You should see output like:
   ```
   Local:   http://localhost:5173/
   Network: http://192.168.x.x:5173/
   ```
3. Open your web browser and go to `http://localhost:5173/`

### Step 2: Verify Database Connection
- The application should show "Connecting to database..." briefly
- If successful, you'll see the login page
- If there's an error, check your MongoDB Atlas configuration

---

## 🔐 First Login

### Default Login Credentials
The system automatically creates these accounts:

1. **Administrator**
   - Email: `admin@company.com`
   - Password: `admin123`

2. **HR Manager**
   - Email: `hr@company.com`
   - Password: `hr123`

### Step 1: Login as Administrator
1. Use the admin credentials above
2. You should see the dashboard with system statistics

### Step 2: Change Default Passwords
1. Go to **Settings** in the sidebar
2. Click on **Security** tab
3. Change the default password to something secure
4. **Remember your new password!**

### Step 3: Create Your First Employee
1. Go to **"Employees"** in the sidebar
2. Click **"Add Employee"**
3. Fill in the employee details
4. Save the employee

---

## 🎯 Features Overview

### 1. **User Management** (Admin Only)
- Create new users with different roles
- Activate/deactivate user accounts
- Role-based access control (admin, hr, manager, employee)

### 2. **Employee Management**
- Add, edit, and manage employee records
- Track employee information and status
- Department and position management

### 3. **Attendance Management**
- Daily attendance tracking
- Check-in/check-out times
- Monthly attendance reports
- Working hours calculation

### 4. **Leave Management**
- Apply for different types of leave
- Approval workflow for managers/HR
- Leave balance tracking
- Leave history and reports

### 5. **Salary Management with Advance Salary**
- Monthly salary records
- Basic salary + allowances - deductions + overtime
- **Advance salary requests and approvals**
- **Automatic advance deduction from monthly salary**
- Payment status tracking (paid/unpaid)
- Salary history and reports

### 6. **Dashboard & Reports**
- Real-time statistics
- Employee overview
- Attendance summaries
- Salary summaries
- Leave summaries

### 7. **Settings**
- Password management
- Profile updates
- System preferences

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "npm command not found"
**Solution:** Node.js is not installed properly. Reinstall Node.js from nodejs.org

#### 2. "Cannot connect to database"
**Solutions:**
- Check your internet connection
- Verify MongoDB Atlas connection string in .env file
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- Check if MongoDB Atlas cluster is running

#### 3. "Port 5173 is already in use"
**Solution:** 
- Close other applications using port 5173
- Or kill the process: `npx kill-port 5173`

#### 4. "Login not working"
**Solutions:**
- Use exact credentials: `admin@company.com` / `admin123`
- Check browser console for errors (F12 → Console)
- Verify database connection
- Try clearing browser cache

#### 5. "White screen or errors"
**Solutions:**
- Check terminal for error messages
- Ensure all files are created correctly
- Run `npm install` again
- Restart the development server

#### 6. "Password change not working"
**Solutions:**
- Ensure you're using the correct current password
- Password must be at least 6 characters
- Check for any error messages
- Try logging out and back in

### Getting Help

If you encounter issues:

1. **Check the Console:** Press F12 in browser → Console tab for error messages
2. **Check Terminal:** Look for error messages where you ran `npm run dev`
3. **Verify Setup:** Double-check all setup steps
4. **Database Issues:** Verify MongoDB Atlas configuration

---

## 🌐 Production Deployment

### For Production Use:
1. Use a proper hosting service (Vercel, Netlify, etc.)
2. Set up proper environment variables
3. Configure MongoDB Atlas for production
4. Set up SSL certificates
5. Implement proper backup strategies
6. Monitor system performance

### Security Best Practices:
1. **Change Default Passwords:** Always change admin/hr default passwords
2. **Use Strong Passwords:** Minimum 8 characters with mixed case, numbers, symbols
3. **Regular Backups:** Export important data regularly
4. **Network Security:** In production, restrict MongoDB Atlas IP access
5. **User Management:** Only give necessary permissions to users

---

## 📊 Daily Usage Guide

### For Administrators:
1. **User Management:** Create and manage user accounts
2. **Employee Management:** Add and update employee records
3. **Salary Management:** Process monthly salaries and approve advances
4. **Reports:** Monitor system usage and generate reports

### For HR Managers:
1. **Leave Management:** Approve/reject leave requests
2. **Attendance Monitoring:** Track employee attendance
3. **Salary Processing:** Manage salary records and payments
4. **Employee Records:** Update employee information

### For Employees:
1. **Attendance:** View your attendance records
2. **Leave Requests:** Apply for leave
3. **Salary Information:** View salary details and request advances
4. **Profile Management:** Update personal information

---

## ✅ Success Checklist

After completing setup, you should have:

- ✅ **Fully functional EMS system** with all features
- ✅ **Cloud database** with MongoDB Atlas (free tier)
- ✅ **User authentication** with role-based access
- ✅ **Complete salary management** with advance salary feature
- ✅ **Attendance tracking** with monthly reports
- ✅ **Leave management** with approval workflow
- ✅ **Dashboard** with real-time statistics
- ✅ **Secure password management**

---

## 🎉 Congratulations!

You now have a fully functional Employee Management System running on your laptop! The system includes:

- **Advanced Salary Management** with advance salary features
- **Complete Attendance Tracking** with monthly views
- **Leave Management** with approval workflow
- **User Management** with role-based access
- **Secure Authentication** with password management
- **Real-time Dashboard** with statistics
- **Production-ready** code with proper error handling

**Start with the default admin login** (`admin@company.com` / `admin123`) and begin managing your employees, attendance, salaries, and leave requests right away!

The system is designed for daily industrial use and includes all the features you need to manage your workforce effectively. 🚀