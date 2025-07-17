# Complete Employee Management System Setup Guide

This guide will help you set up the Employee Management System (EMS) from scratch, including MongoDB Atlas configuration, backend setup, and frontend deployment.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (version 16 or higher): [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git**: [Download here](https://git-scm.com/)
- A **MongoDB Atlas** account (free): [Sign up here](https://www.mongodb.com/cloud/atlas)

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

### 1.2 Create a New Cluster

1. After logging in, click "Create a New Cluster"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Click "Create Cluster" (this may take 5-10 minutes)

### 1.3 Configure Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username (e.g., `emsadmin`)
5. Generate a secure password or create your own
6. **Important**: Save these credentials securely!
7. Under "Database User Privileges", select "Read and write to any database"
8. Click "Add User"

### 1.4 Configure Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your specific IP addresses
5. Click "Confirm"

### 1.5 Get Connection String

1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://emsadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add `/employee_management` before the `?` to specify the database name:
   ```
   mongodb+srv://emsadmin:yourpassword@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority
   ```

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your details:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://emsadmin:yourpassword@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Default Admin Configuration
   DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
   DEFAULT_ADMIN_PASSWORD=SecurePassword123!
   DEFAULT_ADMIN_NAME=System Administrator
   ```

   **Important Notes:**
   - Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
   - Generate a strong `JWT_SECRET` (at least 32 characters)
   - Use a secure password for the default admin
   - Change the admin email to your preferred email

### 2.4 Initialize Database

Run the setup script to create the database structure and default data:

```bash
npm run setup
```

This will:
- Create database collections
- Set up indexes
- Create a default admin user
- Add sample employees
- Create sample user accounts

### 2.5 Start the Backend Server

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

You should see:
```
🚀 Server running on port 5000
🌍 Environment: development
📊 Health check: http://localhost:5000/api/health
```

## 🎨 Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

Open a new terminal window and navigate to the project root:

```bash
cd ..  # Go back to project root if you're in backend directory
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Environment Configuration

1. Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```

2. Add the following content:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### 3.4 Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🚀 Step 4: First Login and Setup

### 4.1 Access the Application

1. Open your web browser
2. Go to `http://localhost:5173`
3. You should see the login page

### 4.2 Login as Admin

Use the credentials you set in the backend `.env` file:
- **Email**: `admin@yourcompany.com` (or what you set in DEFAULT_ADMIN_EMAIL)
- **Password**: `SecurePassword123!` (or what you set in DEFAULT_ADMIN_PASSWORD)

### 4.3 Change Default Password

**Important**: Immediately change the default password:

1. After logging in, click on your profile (top right)
2. Go to "Settings" or "Profile"
3. Click "Change Password"
4. Enter your current password and a new secure password
5. Save the changes

### 4.4 Test the System

1. **Dashboard**: Check that the dashboard loads with sample data
2. **Employees**: View the sample employees that were created
3. **Advance Salary**: Test the new advance salary feature
4. **User Management**: Create additional users if needed

## 📊 Step 5: Using the Advance Salary Feature

### 5.1 Create an Advance Salary Request

1. Go to "Salary Management" → "Advance Salary"
2. Click "New Request"
3. Fill in the form:
   - Select an employee
   - Enter the advance amount
   - Provide a reason
   - Choose deduction schedule
   - Add notes if needed
4. Submit the request

### 5.2 Approve/Reject Requests (Manager/Admin)

1. Go to "Advance Salary" → "Pending Requests"
2. Click on a request to view details
3. Click "Approve" or "Reject"
4. For rejections, provide a reason

### 5.3 Mark as Paid

1. Go to "Approved Requests"
2. Click on an approved request
3. Click "Mark as Paid"
4. Select payment method and deduction start month
5. Confirm the payment

### 5.4 View Advance Salary in Regular Salary

When processing regular salary:
1. The system automatically calculates advance deductions
2. Advance amounts are shown in the deductions section
3. Net salary is calculated after advance deductions

## 🔒 Step 6: Security Best Practices

### 6.1 Change Default Credentials

- Change the default admin password immediately
- Update default employee passwords: `password123`
- Create strong, unique passwords for all users

### 6.2 Environment Variables

- Never commit `.env` files to version control
- Use different JWT secrets for different environments
- Regularly rotate JWT secrets

### 6.3 Database Security

- Restrict MongoDB Atlas IP access to specific IPs in production
- Use strong database passwords
- Enable MongoDB Atlas monitoring

### 6.4 Production Deployment

- Set `NODE_ENV=production`
- Use HTTPS in production
- Implement proper logging
- Set up database backups

## 📱 Step 7: Daily Usage Guide

### 7.1 Employee Management

- **Add Employee**: HR can add new employees with complete details
- **Update Employee**: Modify employee information as needed
- **Employee Status**: Activate/deactivate employees

### 7.2 Attendance Tracking

- **Check In/Out**: Employees can mark attendance
- **Manual Entry**: Managers can add manual attendance entries
- **Attendance Reports**: View attendance summaries

### 7.3 Leave Management

- **Apply Leave**: Employees can request leave
- **Approve/Reject**: Managers can process leave requests
- **Leave Balance**: Track available leave days

### 7.4 Salary Management

- **Generate Salary**: Create monthly salary records
- **Advance Salary**: Handle advance salary requests
- **Payslips**: Generate and download payslips
- **Salary Reports**: View salary summaries

### 7.5 User Management

- **Create Users**: Add new system users
- **Role Management**: Assign appropriate roles
- **Password Management**: Reset user passwords

## 🛠️ Step 8: Troubleshooting

### 8.1 Common Issues

**Database Connection Issues:**
- Check MongoDB Atlas connection string
- Verify network access settings
- Ensure database user has correct permissions

**Authentication Issues:**
- Check JWT secret configuration
- Verify user credentials
- Clear browser cache and localStorage

**API Connection Issues:**
- Ensure backend server is running
- Check CORS settings
- Verify API URL in frontend environment

### 8.2 Logs and Debugging

**Backend Logs:**
- Check console output for errors
- MongoDB connection status
- API request logs

**Frontend Debugging:**
- Open browser developer tools
- Check network tab for API calls
- Review console for JavaScript errors

### 8.3 Database Management

**View Database:**
- Use MongoDB Atlas web interface
- Connect with MongoDB Compass
- Use command line tools

**Backup:**
- MongoDB Atlas provides automated backups
- Export collections as needed
- Regular backup schedule recommended

## 📞 Support and Maintenance

### 8.1 Regular Maintenance

- **Weekly**: Check system logs and performance
- **Monthly**: Review user accounts and permissions
- **Quarterly**: Update dependencies and security patches

### 8.2 Monitoring

- Monitor database performance
- Track API response times
- Review error logs regularly

### 8.3 Updates

- Keep Node.js and npm updated
- Update dependencies regularly
- Test updates in development first

## 🎯 Advanced Features

### 8.1 Email Notifications

Configure email settings in backend `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 8.2 File Uploads

- Employee documents
- Leave request attachments
- Profile pictures

### 8.3 Reports and Analytics

- Attendance reports
- Salary summaries
- Department-wise analytics
- Employee performance metrics

## 🔄 Backup and Recovery

### 8.1 Database Backup

MongoDB Atlas provides:
- Continuous backups
- Point-in-time recovery
- Automated backup schedules

### 8.2 Application Backup

- Backup source code regularly
- Version control with Git
- Document configuration changes

## 🚀 Production Deployment

### 8.1 Backend Deployment

1. Choose a hosting provider (Heroku, DigitalOcean, AWS)
2. Set production environment variables
3. Deploy backend application
4. Configure domain and SSL

### 8.2 Frontend Deployment

1. Build the frontend: `npm run build`
2. Deploy to hosting service (Netlify, Vercel, AWS S3)
3. Configure environment variables
4. Set up custom domain

---

## 🎉 Congratulations!

You have successfully set up the Employee Management System! The system is now ready for daily use with all features including:

- ✅ User authentication and authorization
- ✅ Employee management
- ✅ Attendance tracking
- ✅ Leave management
- ✅ Salary management with advance salary feature
- ✅ Comprehensive reporting
- ✅ Secure database setup

For any issues or questions, refer to the troubleshooting section or check the system logs for detailed error information.

**Default Login Credentials:**
- Admin: `admin@yourcompany.com` / `SecurePassword123!`
- Employees: Use their email addresses / `password123`

**Remember to change all default passwords immediately after first login!**