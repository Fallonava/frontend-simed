# Production Setup Script for SIMED

Write-Host "Starting SIMED Production Setup..." -ForegroundColor Green

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install it first."
    exit 1
}

# Backend Setup
Write-Host "`n[1/3] Setting up Backend..." -ForegroundColor Yellow
Set-Location "backend"
if (Test-Path "package.json") {
    Write-Host "Installing backend dependencies..."
    npm install --production
    
    Write-Host "Generating Prisma Client..."
    npx prisma generate
    
    # Optional: Migrate DB if needed
    # Write-Host "Running Database Migrations..."
    # npx prisma migrate deploy
} else {
    Write-Error "Backend package.json not found!"
}
Set-Location ".."

# Frontend Setup
Write-Host "`n[2/3] Setting up Frontend..." -ForegroundColor Yellow
Set-Location "frontend"
if (Test-Path "package.json") {
    Write-Host "Installing frontend dependencies..."
    npm install
    
    Write-Host "Building frontend..."
    npm run build
} else {
    Write-Error "Frontend package.json not found!"
}
Set-Location ".."

Write-Host "`n[3/3] Setup Complete!" -ForegroundColor Green
Write-Host "To start the application:"
Write-Host "1. Backend: cd backend; node src/app.js (or use PM2)"
Write-Host "2. Frontend: cd frontend; npx serve -s dist"
