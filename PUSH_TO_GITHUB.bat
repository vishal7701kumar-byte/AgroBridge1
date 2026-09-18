@echo off
setlocal enabledelayedexpansion
title Push AgroBridge to GitHub
cd /d "C:\Users\VISHAL\.gemini\antigravity\scratch\agrobridge"

echo =======================================================
echo Pushing AgroBridge to https://github.com/vishal7701kumar-byte/AgroBridge1.git
echo =======================================================
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo SUCCESS! Project successfully pushed to GitHub!
    echo Check: https://github.com/vishal7701kumar-byte/AgroBridge1
    echo =======================================================
    pause
    exit /b 0
)

echo.
echo =======================================================
echo [!] Browser sign-in was not completed or failed.
echo Would you like to push using your GitHub Personal Access Token (PAT)?
echo =======================================================
echo (To generate token: GitHub -> Settings -> Developer Settings -> Personal access tokens (classic) -> Generate new token -> check 'repo')
echo.
set /p GH_TOKEN="Paste your GitHub Personal Access Token (PAT) here (or press Enter to cancel): "

if "!GH_TOKEN!"=="" (
    echo Exiting...
    pause
    exit /b 1
)

echo.
echo [*] Pushing with Personal Access Token...
git push -u https://!GH_TOKEN!@github.com/vishal7701kumar-byte/AgroBridge1.git main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo SUCCESS! Project successfully pushed to GitHub using your Token!
    echo Check: https://github.com/vishal7701kumar-byte/AgroBridge1
    echo =======================================================
    git remote set-url origin https://github.com/vishal7701kumar-byte/AgroBridge1.git
) else (
    echo.
    echo [X] Push failed. Please check that your token has 'repo' permissions.
)

pause
