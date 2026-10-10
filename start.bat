@echo off
rem Double-click to launch Neuromap: installs dependencies on first run,
rem starts the dev server, and opens the app in the default browser.
setlocal
cd /d "%~dp0"
title Neuromap

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo.
  echo Opening https://nodejs.org - install the LTS version, then double-click this file again.
  start "" https://nodejs.org
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo First launch: installing dependencies. This takes a minute or two...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo Install failed - see the messages above.
    pause
    exit /b 1
  )
)

echo.
echo Starting Neuromap. Leave this window open while you use it; close it to quit.
echo.
call npm run dev -- --open
pause
