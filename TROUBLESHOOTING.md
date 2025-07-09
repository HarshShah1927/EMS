# EMS Login Troubleshooting Guide

## Common Login Issues and Solutions

### 1. **New User Cannot Login**

**Problem**: You created a new user but they can't log in to the system.

**Solutions**:

#### Check User Status
- Ensure the user account is **Active** in User Management
- Go to User Management → Find the user → Check status column
- If inactive, click the activate button (green checkmark icon)

#### Verify Credentials
- Confirm the email address is correct (case-insensitive)
- Ensure password meets minimum requirements (6+ characters)
- Try the exact credentials used during user creation

#### Database Connection
- Verify MongoDB Atlas connection is working
- Check `.env` file has correct database credentials
- Ensure network access is configured in MongoDB Atlas

### 2. **Password Issues**

**Problem**: User says password is incorrect but you're sure it's right.

**Solutions**:
- Passwords are case-sensitive
- Check for extra spaces in email or password
- Password must be at least 6 characters
- Try resetting the password through User Management

### 3. **Email Format Issues**

**Problem**: Login fails with "Invalid email or password" error.

**Solutions**:
- Email must be in valid format (user@domain.com)
- No spaces before or after email address
- Email lookup is case-insensitive but must be properly formatted

### 4. **Database Connection Issues**

**Problem**: Login page shows but authentication fails.

**Solutions**:

#### Check MongoDB Atlas Setup
```bash
# Test connection in terminal
node -e "
const { MongoClient } = require('mongodb');
const client = new MongoClient('YOUR_MONGODB_URI');
client.connect().then(() => {
  console.log('Connected successfully');
  client.close();
}).catch(err => console.error('Connection failed:', err));
"
```

#### Verify Environment Variables
```bash
# Check .env file exists and has correct values
cat .env
```

Should contain:
```
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee_management
```

### 5. **Default Admin Account Issues**

**Problem**: Default admin account doesn't work.

**Solutions**:
- Default credentials: `admin@company.com` / `admin123`
- System automatically creates admin account on first run
- If still not working, check database for users collection

### 6. **User Creation Fails**

**Problem**: Cannot create new users through User Management.

**Solutions**:

#### Check Required Fields
- Name (required)
- Email (required, must be unique)
- Password (required, 6+ characters)
- Role (required)

#### Duplicate Email Check
- Each email can only be used once
- Check if user already exists with same email
- Email comparison is case-insensitive

### 7. **Session/Authentication Issues**

**Problem**: User logs in but gets logged out immediately.

**Solutions**:
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check browser console for JavaScript errors

### 8. **Role-Based Access Issues**

**Problem**: User logs in but can't access certain features.

**Solutions**:
- Check user role in User Management
- Roles: admin, hr, manager, employee
- Admin has full access, others have limited access
- Update user role if needed

## Step-by-Step User Creation Process

### For System Administrators:

1. **Login as Admin**
   - Use: `admin@company.com` / `admin123`

2. **Navigate to User Management**
   - Click "User Management" in sidebar

3. **Add New User**
   - Click "Add User" button
   - Fill required fields:
     - Full Name
     - Email Address (unique)
     - Password (6+ characters)
     - Role
   - Optional fields:
     - Department
     - Phone Number
     - Employee ID

4. **Verify User Creation**
   - User should appear in users list
   - Status should be "Active"
   - User can now login with their credentials

### For New Users:

1. **Get Credentials**
   - Obtain email and password from administrator

2. **Access Login Page**
   - Open EMS system URL
   - Enter email and password exactly as provided

3. **First Login**
   - System will track login time and count
   - Change password if required by policy

## Testing User Login

### Manual Test Process:

1. **Create Test User**
   ```
   Name: Test User
   Email: test@company.com
   Password: test123
   Role: employee
   ```

2. **Verify in Database**
   - Check users collection in MongoDB
   - Confirm user exists with isActive: true

3. **Test Login**
   - Logout current session
   - Login with test credentials
   - Should succeed and show dashboard

### Automated Test:

```javascript
// Test login function
const testLogin = async () => {
  const result = await loginUser({
    email: 'test@company.com',
    password: 'test123'
  });
  
  if (result) {
    console.log('Login successful:', result);
  } else {
    console.log('Login failed');
  }
};
```

## Emergency Access

### If Admin Account is Lost:

1. **Direct Database Access**
   - Login to MongoDB Atlas
   - Navigate to users collection
   - Find admin user and verify credentials

2. **Reset Admin Password**
   - Use MongoDB Atlas interface
   - Update password field with new hash
   - Or delete admin user to trigger recreation

3. **Create New Admin**
   ```javascript
   // Run in MongoDB Atlas shell
   db.users.insertOne({
     name: "Emergency Admin",
     email: "emergency@company.com",
     password: "$2a$12$hash_here", // Use bcrypt hash
     role: "admin",
     isActive: true,
     createdAt: new Date()
   });
   ```

## Contact Support

If none of these solutions work:

1. **Check Browser Console**
   - Press F12 → Console tab
   - Look for error messages
   - Share error details

2. **Check Server Logs**
   - Look at terminal where `npm run dev` is running
   - Note any error messages

3. **Provide Information**
   - User email trying to login
   - Error messages seen
   - Steps already tried
   - Browser and version used

## Prevention Tips

1. **Regular Backups**
   - Export user data regularly
   - Keep backup of admin credentials

2. **User Training**
   - Provide clear login instructions
   - Document password requirements
   - Share troubleshooting steps

3. **Monitoring**
   - Check failed login attempts
   - Monitor user creation success
   - Verify database connectivity regularly

4. **Security**
   - Use strong passwords
   - Regular password updates
   - Monitor user access patterns