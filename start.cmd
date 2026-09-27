@echo off
rem Double-click this file, or run it from a terminal, to start the site.
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (
  echo Node.js is required. Install it from https://nodejs.org and run this again.
  pause
  exit /b 1
)
node scripts\start.mjs %*
if errorlevel 1 pause
