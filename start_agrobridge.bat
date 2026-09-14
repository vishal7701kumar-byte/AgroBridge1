@echo off
title AgroBridge Platform Launcher
color 0A
echo ============================================================
echo   AGROBRIDGE - ROLE-BASED DISINTERMEDIATION PLATFORM
echo ============================================================
echo.
echo Starting AgroBridge Node.js & Express Server on Port 5000...
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

cd /d "%~dp0server"
node server.js

pause
