# Employee Management System

A full-stack Employee Management System built with React (frontend) and Node.js/Express (backend).

## 🚨 MongoDB Connection Issue - RESOLVED!

The MongoDB connection error has been **completely fixed**! No external MongoDB installation required.

## 🚀 Quick Start (3 Commands)

```bash
# 1. Install dependencies
npm install && cd backend && npm install && cd ..

# 2. Create environment files
cp .env.example .env && cp backend/.env.example backend/.env

# 3. Start everything (database + backend + frontend)
./start-dev.sh
```

**Login Credentials:**
- Email: `admin@company.com`
- Password: `admin123`

## ✅ What's Fixed

- **✅ No MongoDB Installation Required**: Uses in-memory MongoDB
- **✅ Automatic Database Setup**: Creates admin user automatically  
- **✅ One-Command Start**: Single script starts everything
- **✅ Environment Configuration**: Proper .env file setup
- **✅ Real Authentication**: JWT-based auth with backend API
- **✅ Full Frontend-Backend Connection**: All API endpoints working

## 🔗 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📖 Documentation

- **[Quick Setup Guide](./QUICK_SETUP.md)** - Step-by-step setup instructions
- **[Frontend-Backend Connection Guide](./FRONTEND_BACKEND_CONNECTION_GUIDE.md)** - Technical details
- **[Setup Guide](./COMPLETE_SETUP_GUIDE.md)** - Comprehensive setup instructions

## 🏗️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM

**Backend:**
- Node.js + Express
- MongoDB (in-memory for development)
- JWT Authentication
- bcrypt for password hashing

## 🔧 Alternative Setup Methods

### Manual Step-by-Step
```bash
# Terminal 1 - Database
cd backend && npm run setup-dev-db

# Terminal 2 - Backend
cd backend && npm run dev

# Terminal 3 - Frontend  
npm run dev
```

### With External MongoDB
```bash
# If you have MongoDB installed
cd backend && npm run setup-admin && npm run dev
npm run dev  # In another terminal
```

## 🧪 Testing the Connection

```bash
# Health check
curl http://localhost:5000/api/health

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "admin123"}'
```

## 🔐 Features

- ✅ JWT-based authentication
- ✅ Protected routes with loading states
- ✅ Real-time API communication
- ✅ Secure password handling
- ✅ Error handling and validation
- ✅ Responsive UI design
- ✅ In-memory database (no setup required)

## 🚨 Troubleshooting

### Common Issues:
1. **"vite: not found"** → Run `npm install`
2. **Port conflicts** → Change ports in .env files
3. **Login fails** → Check all servers are running

### Success Indicators:
- ✅ Database starts with admin user creation message
- ✅ Backend shows "MongoDB Connected: localhost"
- ✅ Frontend accessible at http://localhost:5173
- ✅ Login with admin credentials works

## 🎉 Ready to Use!

The system is now fully connected and working:
- **Database**: In-memory MongoDB (no installation needed)
- **Backend**: Express API with JWT authentication
- **Frontend**: React app with real authentication
- **Admin User**: Created automatically

---

*Need help? Check the [Quick Setup Guide](./QUICK_SETUP.md) for detailed instructions.*