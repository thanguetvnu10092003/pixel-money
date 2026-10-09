@echo off
chcp 65001 >nul
title Pixel Money - Personal Expense Manager
cls

echo ========================================================
echo       [+] LAUNCHING PIXEL MONEY [+]
echo ========================================================
echo.

set PYTHON_CMD=

:: 1. Check Python in PATH
python --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=python
    goto FOUND_PYTHON
)

:: 2. Check Miniconda on Drive D
if exist "D:\Miniconda\python.exe" (
    set PYTHON_CMD=D:\Miniconda\python.exe
    goto FOUND_PYTHON
)

:: 3. Check standard Miniconda / Anaconda paths
if exist "%USERPROFILE%\miniconda3\python.exe" (
    set PYTHON_CMD=%USERPROFILE%\miniconda3\python.exe
    goto FOUND_PYTHON
)
if exist "%USERPROFILE%\Anaconda3\python.exe" (
    set PYTHON_CMD=%USERPROFILE%\Anaconda3\python.exe
    goto FOUND_PYTHON
)
if exist "C:\ProgramData\miniconda3\python.exe" (
    set PYTHON_CMD=C:\ProgramData\miniconda3\python.exe
    goto FOUND_PYTHON
)

echo [!] Python or Miniconda was not found on your system!
echo [!] Please install Python/Miniconda or add Python to PATH.
pause
exit /b 1

:FOUND_PYTHON
echo [*] Detected Python at: %PYTHON_CMD%
echo [*] Checking dependencies (Flask, openpyxl)...
"%PYTHON_CMD%" -m pip install -r requirements.txt >nul 2>&1

echo [*] Initializing database...
"%PYTHON_CMD%" database.py >nul 2>&1

echo.
echo ========================================================
echo   SERVER RUNNING AT: http://127.0.0.1:5000
echo   Opening browser in 2 seconds...
echo   (Press Ctrl+C to stop server)
echo ========================================================
echo.

start "" http://127.0.0.1:5000

"%PYTHON_CMD%" app.py

pause
