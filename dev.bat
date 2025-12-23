@echo off
echo Starting SIMED Development Environment...
start "SIMED Backend" cmd /k "cd backend && npm run dev"
start "SIMED Frontend" cmd /k "cd frontend && npm run dev"
echo Backend and Frontend launched in separate windows.
