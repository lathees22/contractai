@echo off
TITLE Push ContractAI to GitHub
echo ========================================================
echo             Push ContractAI to GitHub
echo ========================================================
echo.
echo Step 1: Make sure you have created an empty repository on GitHub:
echo         https://github.com/new
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/contractai.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Aborted.
    pause
    exit /b
)

cd /d "%~dp0"
set "PATH=C:\Users\ASUS\AppData\Local\Programs\git\cmd;%PATH%"

echo.
echo [1/3] Setting remote origin to %REPO_URL% ...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo [2/3] Ensuring branch is main...
git branch -M main

echo.
echo [3/3] Pushing to GitHub...
git push -u origin main

echo.
echo ========================================================
echo                 Push Completed!
echo.
echo Next: To activate your live website link on GitHub Pages:
echo   1. Go to your repo on GitHub: %REPO_URL%
echo   2. Click 'Settings' -^> 'Pages'
echo   3. Under 'Source', select 'GitHub Actions'
echo   4. Your site will be live at:
echo      https://[YOUR_USERNAME].github.io/contractai/
echo ========================================================
pause
