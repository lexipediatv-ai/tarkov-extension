@echo off
title Tarkov Extension - PARAR TUDO
color 0C
echo.
echo ========================================
echo   TARKOV EXTENSION - PARAR TUDO
echo ========================================
echo.
echo Parando todos os processos Node.js...
echo.

taskkill /F /IM node.exe 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Processos Node.js parados com sucesso!
) else (
    echo.
    echo Nenhum processo Node.js encontrado.
)

echo.
echo Pressione qualquer tecla para fechar...
pause >nul
