@echo off
title Tarkov Extension - INICIAR TUDO
color 0E
echo.
echo ========================================
echo   TARKOV EXTENSION - INICIAR TUDO
echo ========================================
echo.
echo Iniciando Backend e Frontend...
echo.

REM Matar processos Node.js antigos
taskkill /F /IM node.exe 2>nul

REM Aguardar 2 segundos
timeout /t 2 /nobreak >nul

REM Iniciar Backend em nova janela
start "" "%~dp0START-BACKEND.bat"

REM Aguardar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar Frontend em nova janela
start "" "%~dp0START-FRONTEND.bat"

echo.
echo ========================================
echo   Ambos servidores foram iniciados!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:8081/config.html
echo.
echo Esta janela pode ser fechada.
echo.

timeout /t 5 /nobreak >nul
exit
