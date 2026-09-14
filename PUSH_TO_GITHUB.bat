@echo off
title Push AgroBridge to GitHub
cd /d "C:\Users\VISHAL\.gemini\antigravity\scratch\agrobridge"

echo =======================================================
echo Pushing AgroBridge to https://github.com/vishalbist299-hub/AgroBridge1.git
echo =======================================================
echo.

"C:\Users\VISHAL\AppData\Local\Programs\Git\cmd\git.exe" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo SUCCESS! Project successfully pushed to GitHub!
    echo Check: https://github.com/vishalbist299-hub/AgroBridge1
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo If GitHub asks for password, please use your GitHub Personal Access Token (PAT)
    echo instead of your regular account password.
    echo =======================================================
)

pause
