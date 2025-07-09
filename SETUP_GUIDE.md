# Complete EMS Setup Guide for Beginners

## Prerequisites

Before starting, make sure you have:
- A computer with Windows, Mac, or Linux
- Internet connection
- Basic computer skills (copy/paste, navigate folders)

## Step 1: Install Required Software

### 1.1 Install Node.js
1. Go to https://nodejs.org/
2. Download the LTS version (recommended for most users)
3. Run the installer and follow the setup wizard
4. Accept all default settings
5. To verify installation, open Command Prompt (Windows) or Terminal (Mac/Linux) and type:
   ```
   node --version
   npm --version
   ```
   You should see version numbers for both.

### 1.2 Install Git (Optional but recommended)
1. Go to https://git-scm.com/
2. Download Git for your operating system
3. Install with default settings

### 1.3 Install a Code Editor
1. Download Visual Studio Code from https://code.visualstudio.com/
2. Install with default settings
3. This will help you edit configuration files

## Step 2: Set Up MongoDB Atlas (Cloud Database)

### 2.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free"
3. Sign up with your email or Google account
4. Verify your email address

### 2.2 Create a New Cluster
1. After logging in, click "Build a Database"
2. Choose "M0 Sandbox" (FREE tier)
3. Select a cloud provider (AWS recommended)
4. Choose a region closest to your location
5. Give your cluster a name (e.g., "ems-cluster")
6. Click "Create Cluster"
7. Wait 3-5 minutes for cluster creation

### 2.3 Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username: `emsuser`
5. Click "Autogenerate Secure Password" and COPY the password
6. Under "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

### 2.4 Configure Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"
5. Wait for the status to become "Active"

### 2.5 Get Connection String
1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://emsuser:<password>@ems-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you copied earlier
7. Save this connection string - you'll need it soon!

## Step 3: Download and Set Up the EMS System

### 3.1 Create Project Folder
1. Create a new folder on your desktop called "EMS-System"
2. Open Command Prompt/Terminal
3. Navigate to your folder:
   ```
   cd Desktop/EMS-System
   ```

### 3.2 Set Up the Project Files
1. The system files are already provided in this conversation
2. You need to create each file with the exact content shown
3. The main files you need are:
   - package.json
   - .env
   - All files in the src/ folder
   - Configuration files (vite.config.ts, tsconfig.json, etc.)

### 3.3 Configure Environment Variables
1. Open the `.env` file
2. Replace the MongoDB URI with your connection string:
   ```
   VITE_MONGODB_URI=mongodb+srv://emsuser:YOUR_PASSWORD@ems-cluster.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority
   ```
3. Save the file

## Step 4: Install Dependencies and Run the System

### 4.1 Install Project Dependencies
1. Open Command Prompt/Terminal in your project folder
2. Run:
   ```
   npm install
   ```
3. Wait for all packages to download (this may take 2-5 minutes)

### 4.2 Start the Development Server
1. In the same terminal, run:
   ```
   npm run dev
   ```
2. You should see output like:
   ```
   Local:   http://localhost:3000/
   Network: http://192.168.x.x:3000/
   ```
3. Open your web browser and go to `http://localhost:3000`

## Step 5: First Login and Setup

### 5.1 Initial Login
1. The system will automatically create default users
2. Use these credentials to login:
   - **Administrator**: admin@company.com / admin123
   - **HR Manager**: hr@company.com / hr123

### 5.2 Change Default Passwords
1. Login as admin
2. Go to Settings → Security
3. Change the default password to something secure
4. Remember your new password!

### 5.3 Create Your First Employee
1. Go to "Employees" in the sidebar
2. Click "Add Employee"
3. Fill in the employee details
4. Save the employee

### 5.4 Create Additional Users
1. Go to "User Management" (admin only)
2. Click "Add User"
3. Create accounts for your team members
4. Assign appropriate roles

## Step 6: Daily Usage

### 6.1 Starting the System
Every time you want to use the EMS:
1. Open Command Prompt/Terminal
2. Navigate to your project folder
3. Run: `npm run dev`
4. Open browser to `http://localhost:3000`

### 6.2 Key Features
- **Dashboard**: Overview of all activities
- **Employee Management**: Add, edit, view employees
- **User Management**: Manage system users (admin only)
- **Attendance**: Track daily attendance
- **Leave Management**: Handle leave requests
- **Salary Management**: Manage monthly salaries
- **Settings**: Change passwords and preferences

## Troubleshooting Common Issues

### Issue 1: "npm command not found"
**Solution**: Node.js is not installed properly. Reinstall Node.js from nodejs.org

### Issue 2: "Cannot connect to database"
**Solutions**:
- Check your internet connection
- Verify MongoDB Atlas connection string in .env file
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- Check if MongoDB Atlas cluster is running

### Issue 3: "Port 3000 is already in use"
**Solution**: 
- Close other applications using port 3000
- Or change the port in vite.config.ts to a different number

### Issue 4: "Login not working"
**Solutions**:
- Use exact credentials: admin@company.com / admin123
- Check browser console for errors (F12 → Console)
- Verify database connection
- Try clearing browser cache

### Issue 5: "White screen or errors"
**Solutions**:
- Check terminal for error messages
- Ensure all files are created correctly
- Run `npm install` again
- Restart the development server

## Security Best Practices

1. **Change Default Passwords**: Always change admin/hr default passwords
2. **Use Strong Passwords**: Minimum 8 characters with mixed case, numbers, symbols
3. **Regular Backups**: Export important data regularly
4. **Network Security**: In production, restrict MongoDB Atlas IP access
5. **User Management**: Only give necessary permissions to users
6. **Keep Updated**: Regularly update the system and dependencies

## Getting Help

If you encounter issues:

1. **Check the Console**: Press F12 in browser → Console tab for error messages
2. **Check Terminal**: Look for error messages where you ran `npm run dev`
3. **Verify Setup**: Double-check all setup steps
4. **Database Issues**: Verify MongoDB Atlas configuration
5. **File Issues**: Ensure all files are created with correct content

## Production Deployment (Advanced)

For production use:
1. Use a proper hosting service (Vercel, Netlify, etc.)
2. Set up proper environment variables
3. Configure MongoDB Atlas for production
4. Set up SSL certificates
5. Implement proper backup strategies
6. Monitor system performance

## Maintenance

### Daily Tasks
- Monitor system performance
- Check for failed logins
- Review attendance records

### Weekly Tasks
- Backup database
- Review user access
- Check system logs

### Monthly Tasks
- Update passwords
- Review and archive old data
- Update system if needed

## Support

For technical support:
- Check the troubleshooting section first
- Review MongoDB Atlas documentation
- Check Node.js and npm documentation
- Contact your system administrator

---

**Congratulations!** You now have a fully functional Employee Management System. The system will automatically create the database structure when you first run it, and you can start managing employees, attendance, leaves, and salaries right away.

Remember to keep your MongoDB Atlas credentials secure and change the default passwords immediately after setup.