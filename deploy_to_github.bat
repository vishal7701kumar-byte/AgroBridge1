@echo off
setlocal enabledelayedexpansion
title AgroBridge - Deploy to GitHub

echo ====================================================================
echo        AGROBRIDGE - AUTOMATED GITHUB REPOSITORY DEPLOYMENT
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git is not detected in your PATH.
    echo.
    echo Attempting to install Git via Windows Package Manager...
    echo (If a Windows security/UAC prompt appears, please click YES)
    echo.
    winget install --id Git.Git -e --source winget
    if %errorlevel% neq 0 (
        echo.
        echo [X] Automatic installation failed or was declined.
        echo Please download and install Git manually from: https://git-scm.com/download/win
        echo After installing Git, re-run this script.
        pause
        exit /b 1
    )
    echo [✓] Git installed successfully! Please restart this script to continue.
    pause
    exit /b 0
)

echo [✓] Git is detected on your system.
echo.

:: 2. Check Git User Config
git config --global user.name >nul 2>nul
if %errorlevel% neq 0 (
    set /p GIT_NAME="Enter your Name for Git commits: "
    git config --global user.name "!GIT_NAME!"
)

git config --global user.email >nul 2>nul
if %errorlevel% neq 0 (
    set /p GIT_EMAIL="Enter your GitHub Email address: "
    git config --global user.email "!GIT_EMAIL!"
)

:: 3. Initialize Git repository
if not exist ".git" (
    echo [*] Initializing new Git repository...
    git init
) else (
    echo [*] Existing Git repository detected.
)

:: 4. Stage and commit files
echo [*] Staging project files (excluding node_modules via .gitignore)...
git add .

git status --short

echo.
set /p COMMIT_MSG="Enter commit message [Default: Initial commit - AgroBridge Platform]: "
if "!COMMIT_MSG!"=="" set COMMIT_MSG=Initial commit - AgroBridge Platform

git commit -m "!COMMIT_MSG!"

:: 5. Set main branch
git branch -M main

:: 6. Remote Repository Setup
echo.
echo ====================================================================
echo STEP: CONNECT TO GITHUB
echo ====================================================================
echo 1. Open your browser and go to: https://github.com/new
echo 2. Create a new repository named 'agrobridge' (Public or Private)
echo    (DO NOT check 'Initialize with README', .gitignore, or license)
echo 3. Copy the repository URL (e.g., https://github.com/YOUR_USERNAME/agrobridge.git)
echo ====================================================================
echo.

set /p REPO_URL="Paste your GitHub Repository URL: "

if "!REPO_URL!"=="" (
    echo [!] No URL provided. You can push manually later with:
    echo     git remote add origin ^<your-repo-url^>
    echo     git push -u origin main
    pause
    exit /b 0
)

:: Check if remote origin exists
git remote get-url origin >nul 2>nul
if %errorlevel% equ 0 (
    git remote set-url origin !REPO_URL!
) else (
    git remote add origin !REPO_URL!
)

:: 7. Push to GitHub
echo.
echo [*] Pushing code to GitHub main branch...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ====================================================================
    echo [✓] SUCCESS! Your AgroBridge project is now deployed on GitHub!
    echo ====================================================================
) else (
    echo.
    echo [!] Push failed or authentication was required.
    echo If GitHub asked for a password, note that GitHub requires a
    echo Personal Access Token (PAT) or GitHub Desktop / GitHub CLI.
    echo You can also use GitHub Desktop (https://desktop.github.com)
    echo to push this folder with 1 click.
)

pause
