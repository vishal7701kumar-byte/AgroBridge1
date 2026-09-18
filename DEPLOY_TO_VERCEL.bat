@echo off
title Deploy AgroBridge to Vercel
cd /d "C:\Users\VISHAL\.gemini\antigravity\scratch\agrobridge"

echo =======================================================
echo          DEPLOY AGROBRIDGE TO VERCEL
echo =======================================================
echo.
echo 1. Checking frontend production build...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
)
cd ..

echo.
echo 2. Deploying to Vercel (Production)...
echo (Vercel will ask you to login if it is your first time)
call npx vercel --prod

echo.
echo =======================================================
echo Vercel Deployment Process Finished!
echo =======================================================
pause
