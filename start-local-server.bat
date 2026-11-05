@echo off
cd /d "%~dp0"
echo Starting HSQ Curriculum Options at http://localhost:8080
echo Close this window to stop the local server.
start "" http://localhost:8080
py -m http.server 8080
if errorlevel 1 python -m http.server 8080
