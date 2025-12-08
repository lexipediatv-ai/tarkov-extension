@echo off
title Tarkov Extension - Backend Server
color 0A
echo.
echo ========================================
echo   TARKOV EXTENSION - BACKEND SERVER
echo ========================================
echo.
echo Iniciando servidor backend na porta 8080...
echo.

cd /d "%~dp0backend"
set PORT=8080
node server.js

pause
