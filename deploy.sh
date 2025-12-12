#!/bin/bash

# --- KONFIGURASI ---
PROJECT_DIR="/var/www/simed-app"
DOMAIN_API="https://app.fallonava.my.id/api"
DOMAIN_SOCKET="https://app.fallonava.my.id"

echo "========================================"
echo "    STARTING DEPLOYMENT: PRODUCTION     "
echo "========================================"

# 1. Masuk ke Folder Project
cd $PROJECT_DIR || { echo "❌ Directory not found! Please clone first."; exit 1; }

# 2. Update Code dari GitHub
echo "[1/5] Pulling latest code..."
# Reset hard untuk memastikan server 100% sama dengan GitHub (menghindari konflik)
git fetch origin
git reset --hard origin/dev
git clean -fd

# 3. Setup Backend
echo "[2/5] Building Backend..."
cd $PROJECT_DIR/backend
# Pastikan env backend aman (opsional jika sudah ada .env di server)
npm install
npx prisma generate
# Restart Backend
pm2 restart simed-backend || pm2 start src/app.js --name simed-backend

# 4. Setup Frontend
echo "[3/5] Building Frontend..."
cd $PROJECT_DIR/frontend
npm install

# Build dengan Environment Variable yang BENAR
export VITE_API_URL=$DOMAIN_API
export VITE_SOCKET_URL=$DOMAIN_SOCKET
npm run build

# 5. Finalisasi
echo "[4/5] Reloading Nginx..."
sudo systemctl reload nginx

echo "========================================"
echo "    ✅ DEPLOYMENT SUCCESSFUL!           "
echo "========================================"