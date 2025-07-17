# Employee Management System

A full-stack Employee Management System built with React (frontend) and Node.js/Express (backend).

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start development servers
./start-dev.sh
```

**Default Login:**
- Email: `admin@company.com`
- Password: `admin123`

## 📖 Documentation

- **[Frontend-Backend Connection Guide](./FRONTEND_BACKEND_CONNECTION_GUIDE.md)** - Complete setup and connection details
- **[Setup Guide](./COMPLETE_SETUP_GUIDE.md)** - Detailed installation instructions
- **[Architecture Guide](./FRONTEND_ARCHITECTURE_FIX.md)** - Frontend architecture details

## 🔗 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🏗️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing

## 📁 Project Structure

```
├── src/                 # Frontend source code
├── backend/             # Backend source code
├── .env                 # Frontend environment variables
├── backend/.env         # Backend environment variables
└── start-dev.sh         # Development server script
```

## 🔐 Features

- JWT-based authentication
- Protected routes
- Real-time API communication
- Secure password handling
- Error handling and validation
- Responsive UI design

## 🛠️ Development

The frontend and backend are now fully connected with proper authentication flow, API communication, and error handling. See the [connection guide](./FRONTEND_BACKEND_CONNECTION_GUIDE.md) for detailed information.

---

*For detailed setup instructions and troubleshooting, please refer to the documentation files above.*