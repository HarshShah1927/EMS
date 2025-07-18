@echo off
echo.
echo ========================================
echo   Employee Management System Setup
echo ========================================
echo.

echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo Creating environment files...
if not exist .env (
    copy .env.example .env
    echo Created .env file
) else (
    echo .env file already exists
)

if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend\.env file
) else (
    echo backend\.env file already exists
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Choose your database option:
echo.
echo 1. MongoDB Atlas (recommended - free cloud database)
echo 2. Local MongoDB (requires installation)
echo 3. Docker MongoDB (requires Docker Desktop)
echo 4. Mock server (frontend only - no database)
echo.
echo For MongoDB Atlas:
echo   1. Go to https://cloud.mongodb.com
echo   2. Create free account and cluster
echo   3. Get connection string
echo   4. Update MONGODB_URI in backend\.env
echo   5. Run: cd backend ^&^& npm run setup-simple
echo.
echo For other options, see WINDOWS_SETUP.md
echo.
pause