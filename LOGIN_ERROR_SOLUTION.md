# 🔐 Login Error: "Server error during login" - SOLUTION

## 🚨 **Error Details**
```
auth.ts:15 Login error: Error: Server error during login
    at ApiService.request (api.ts:36:15)
    at async ApiService.login (api.ts:58:22)
    at async loginUser (auth.ts:7:22)
    at async login (AuthContext.tsx:57:20)
    at async handleSubmit (Login.tsx:25:23)
```

## ✅ **IMMEDIATE SOLUTIONS**

### **Solution 1: Start Mock Server (Instant Fix)**
The backend server is not running. Start it now:

```bash
# Terminal 1 - Start mock backend
cd backend
node mock-server.js

# Terminal 2 - Start frontend
npm run dev

# Open http://localhost:5173
# Login: admin@company.com / admin123
```

### **Solution 2: Debug the Issue**
1. **Open the debug page**: `debug-login.html` in your browser
2. **Test backend health**: Click "Test Backend Health"
3. **Test login**: Click "Test Login"
4. **Check browser console** for detailed error messages

### **Solution 3: Verify Backend is Running**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If it fails, start the mock server
cd backend
npm run mock
```

## 🔧 **Step-by-Step Debugging**

### **Step 1: Check Backend Status**
```bash
# Test if backend is responding
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"Mock EMS Backend API is running",...}
```

### **Step 2: Test Login API Directly**
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Expected response:
# {"success":true,"message":"Login successful","data":{"user":{...},"token":"..."}}
```

### **Step 3: Check Frontend Console**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try to login
4. Look for detailed error messages

### **Step 4: Verify Environment Variables**
```bash
# Check frontend .env
cat .env
# Should show: VITE_API_URL=http://localhost:5000/api

# Check backend .env
cat backend/.env
# Should show MongoDB URI and JWT secret
```

## 🎯 **Most Common Causes & Fixes**

### **1. Backend Not Running**
**Symptoms**: "Network error: Unable to connect to server"
**Fix**: 
```bash
cd backend
npm run mock
```

### **2. Wrong API URL**
**Symptoms**: 404 errors, "Failed to connect"
**Fix**: Check `.env` file has `VITE_API_URL=http://localhost:5000/api`

### **3. CORS Issues**
**Symptoms**: "CORS policy" errors in browser console
**Fix**: Mock server already includes CORS headers

### **4. Port Conflicts**
**Symptoms**: "Port already in use" or connection refused
**Fix**: 
```bash
# Kill any existing servers
pkill -f "mock-server"
pkill -f "node.*server"

# Start fresh
cd backend
npm run mock
```

## 🚀 **Quick Test Commands**

### **Test Backend Health**
```bash
curl http://localhost:5000/api/health
```

### **Test Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### **Start Everything**
```bash
# Terminal 1
cd backend
npm run mock

# Terminal 2
npm run dev
```

## 🔍 **Enhanced Debugging**

I've added detailed logging to the API service. When you try to login now, you'll see:

```
🔍 API Request: {url: "http://localhost:5000/api/auth/login", method: "POST", hasToken: false}
📡 API Response: {status: 200, statusText: "OK", ok: true}
📄 Response Data: {success: true, message: "Login successful", data: {...}}
```

## 📋 **Troubleshooting Checklist**

- [ ] Backend server is running (`curl http://localhost:5000/api/health`)
- [ ] Frontend .env has correct API URL
- [ ] No CORS errors in browser console
- [ ] Login credentials are correct: `admin@company.com` / `admin123`
- [ ] Browser developer tools show detailed error messages
- [ ] No port conflicts (5000 for backend, 5173 for frontend)

## 🎉 **Expected Success**

When everything works, you should see:
1. **Backend logs**: "Login attempt: { email: 'admin@company.com', password: 'admin123' }"
2. **Frontend console**: "📄 Response Data: {success: true, ...}"
3. **Browser**: Redirects to dashboard after login

## 🔐 **Confirmed Working Credentials**

- **Email**: `admin@company.com`
- **Password**: `admin123`

## 💡 **Pro Tips**

1. **Always start backend first**, then frontend
2. **Check browser console** for detailed error messages
3. **Use the debug page** (`debug-login.html`) for testing
4. **Mock server is perfect** for frontend development
5. **For production**, use MongoDB Atlas instead of mock server

The login error is typically caused by the backend not running. Start the mock server and it should work immediately! 🚀