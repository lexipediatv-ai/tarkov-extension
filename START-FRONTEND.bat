@echo off
title Tarkov Extension - Frontend Server
color 0B
echo.
echo ========================================
echo   TARKOV EXTENSION - FRONTEND SERVER
echo ========================================
echo.
echo Iniciando servidor frontend na porta 8081...
echo Abrindo navegador em 5 segundos...
echo.

cd /d "%~dp0"

REM Iniciar http-server em background
start /B http-server -p 8081 -c-1 --cors

REM Aguardar 5 segundos e abrir navegador
timeout /t 5 /nobreak >nul
start chrome http://localhost:8081/config.html

echo.
echo ========================================
echo   Frontend rodando em http://localhost:8081
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

REM Manter janela aberta
cmd /k
