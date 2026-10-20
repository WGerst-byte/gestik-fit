@echo off
title GestikFit - Gestik-Training PWA wird gestartet
chcp 65001 >nul
echo ========================================================
echo   GestikFit - Gestik-Training PWA (Hand & Arme)
echo ========================================================
echo.
echo Starte lokalen Webserver fuer Webcam- und PWA-Unterstuetzung...
echo.

cd /d "%~dp0"

:: 1. Pruefen ob Python vorhanden ist
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Python gefunden. Starte lokalen Webserver auf Port 8000...
    start "GestikFit WebServer" /min python -m http.server 8000
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000"
    echo.
    echo GestikFit wurde in Ihrem Browser geoeffnet: http://localhost:8000
    echo (Sie koennen dieses Fenster schliessen oder minimieren)
    exit
)

:: 2. Pruefen ob Node.js vorhanden ist
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js gefunden. Starte lokalen Webserver auf Port 8000...
    start "GestikFit WebServer" /min npx --yes serve -l 8000 .
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000"
    echo.
    echo GestikFit wurde in Ihrem Browser geoeffnet: http://localhost:8000
    exit
)

:: 3. Fallback: Direktes Oeffnen im Browser
echo Oeffne GestikFit direkt im Standard-Browser...
start "" "%~dp0index.html"
exit
