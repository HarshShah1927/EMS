# Frontend-Backend Connection Guide

## 🔗 Connection Overview

The Employee Management System now has a fully connected frontend and backend with the following architecture:

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (backend/.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ems
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
```

### 3. Database Setup

```bash
# Create admin user (run from backend directory)
cd backend
node setup-admin.js
cd ..
```

### 4. Start Development Servers

```bash
# Option 1: Use the provided script (recommended)
./start-dev.sh

# Option 2: Manual start
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🔐 Authentication Flow

### 1. Login Process
- User enters credentials in `src/pages/Login.tsx`
- `AuthContext` calls `loginUser()` from `src/lib/auth.ts`
- Auth service makes API call to `/api/auth/login`
- Backend validates credentials and returns JWT token
- Token is stored in localStorage and set in API service
- User is redirected to dashboard

### 2. Protected Routes
- `ProtectedRoute` component checks authentication status
- Shows loading spinner while checking token validity
- Redirects to login if not authenticated

### 3. API Requests
- All API calls go through `src/lib/api.ts`
- JWT token automatically included in Authorization header
- Handles token expiration and errors

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Advance Salary
- `GET /api/advance-salary` - Get advance salary requests
- `POST /api/advance-salary` - Create new request
- `PUT /api/advance-salary/:id` - Update request
- `PUT /api/advance-salary/:id/approve` - Approve request
- `PUT /api/advance-salary/:id/reject` - Reject request
- `DELETE /api/advance-salary/:id` - Delete request

### Health Check
- `GET /api/health` - Server health status

## 🏗️ Architecture Details

### Frontend Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── DataContext.tsx # Application data
├── lib/               # Utility libraries
│   ├── api.ts         # API service class
│   └── auth.ts        # Authentication utilities
├── pages/             # Route components
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

### Backend Structure
```
backend/
├── config/            # Configuration files
│   └── database.js    # MongoDB connection
├── middleware/        # Express middleware
│   └── auth.js        # JWT authentication
├── models/           # Mongoose schemas
├── routes/           # API route handlers
├── utils/            # Utility functions
└── server.js         # Express server setup
```

## 🔧 Key Features

### 1. Real-time Authentication
- JWT-based authentication
- Automatic token refresh
- Secure password hashing with bcrypt

### 2. Error Handling
- Comprehensive error messages
- Validation errors from backend
- Network error handling

### 3. Security Features
- CORS configuration
- Rate limiting
- Helmet security headers
- Input validation

### 4. Development Tools
- Hot reload for both frontend and backend
- Environment-based configuration
- Comprehensive logging

## 🧪 Testing the Connection

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "admin123"}'
```

### 3. Frontend Test
1. Open http://localhost:5173
2. Login with:
   - Email: admin@company.com
   - Password: admin123
3. Should redirect to dashboard

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in backend/.env
   - Verify database permissions

2. **CORS Error**
   - Check frontend URL in backend CORS configuration
   - Ensure ports match (frontend: 5173, backend: 5000)

3. **JWT Token Error**
   - Check JWT_SECRET in backend/.env
   - Clear localStorage if token is corrupted

4. **API Connection Error**
   - Verify VITE_API_URL in frontend .env
   - Check backend server is running on correct port

### Debug Mode
```bash
# Backend with debug logs
cd backend
DEBUG=* npm run dev

# Frontend with verbose logging
npm run dev -- --debug
```

## 🔄 Next Steps

1. **Add More Endpoints**: Implement remaining CRUD operations
2. **Real-time Features**: Add WebSocket support
3. **File Upload**: Implement file upload for documents
4. **Testing**: Add unit and integration tests
5. **Deployment**: Configure for production deployment

## 📝 Default Credentials

- **Email**: admin@company.com
- **Password**: admin123

> ⚠️ **Important**: Change these credentials in production!

## 🎯 Success Indicators

✅ Backend server starts without errors
✅ Frontend connects to backend API
✅ Login works with default credentials
✅ Protected routes redirect properly
✅ API calls include JWT token
✅ Error handling works correctly

The frontend and backend are now fully connected and ready for development!