#!/bin/bash

# Fallonava Production Deployment Script
# This script is called by GitHub Actions

echo "Deploying to Production..."

# Navigate to project directory
cd ~/simed || exit

# Pull latest changes
echo "Backing up environment variables..."
cp backend/.env backend/.env.backup 2>/dev/null || true
cp frontend/.env frontend/.env.backup 2>/dev/null || true
cp frontend/.env.production frontend/.env.production.backup 2>/dev/null || true

git pull origin dev

echo "Restoring environment variables..."
cp backend/.env.backup backend/.env 2>/dev/null || true
cp frontend/.env.backup frontend/.env 2>/dev/null || true
cp frontend/.env.production.backup frontend/.env.production 2>/dev/null || true

# Backend Setup
echo "Updating Backend..."
cd backend
npm install
npx prisma generate
npx prisma db push # Update schema without reset
pm2 restart fallonava-backend

# Frontend Setup
echo "Updating Frontend..."
cd ../frontend
npm install
# Ensure environment variables are set for build
export VITE_API_URL=https://dev.fallonava.my.id/api
export VITE_SOCKET_URL=https://dev.fallonava.my.id
npm run build

echo "Deployment Complete!"
