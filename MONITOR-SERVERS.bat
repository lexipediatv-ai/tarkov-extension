@echo off
title Tarkov Extension - Monitor de Servidores
color 0E

:LOOP
cls
echo.
echo ========================================
echo   TARKOV EXTENSION - MONITOR
echo ========================================
echo.
echo Verificando servidores a cada 30s...
echo Pressione Ctrl+C para parar
echo.

REM Verificar Backend
powershell -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:8080/api/player/id/10590762' -TimeoutSec 3; Write-Host ' Backend: ONLINE (Level: ' -NoNewline -ForegroundColor Green; Write-Host $r.stats.level -NoNewline -ForegroundColor Cyan; Write-Host ', Prestige: ' -NoNewline -ForegroundColor Green; Write-Host $r.stats.prestige -ForegroundColor Magenta; } catch { Write-Host ' Backend: OFFLINE' -ForegroundColor Red; Write-Host ' Reiniciando backend...' -ForegroundColor Yellow; Start-Process -FilePath 'c:\Users\Administrator\Desktop\twitch-extension\START-BACKEND.bat' }"

echo.

REM Verificar Frontend
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8081/config.html' -TimeoutSec 3; Write-Host ' Frontend: ONLINE' -ForegroundColor Green } catch { Write-Host ' Frontend: OFFLINE' -ForegroundColor Red; Write-Host ' Reiniciando frontend...' -ForegroundColor Yellow; Start-Process -FilePath 'c:\Users\Administrator\Desktop\twitch-extension\START-FRONTEND.bat' }"

echo.
echo ========================================
echo   Proxima verificacao em 30 segundos
echo ========================================

timeout /t 30 /nobreak >nul
goto LOOP
