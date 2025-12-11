#!/bin/bash

# SIMED Production Deployment Script
# This script is called by GitHub Actions

echo "Deploying to Production..."

# Navigate to project directory
cd ~/simed || exit

# Pull latest changes
git pull origin dev

# Backend Setup
echo "Updating Backend..."
cd backend
npm install
npx prisma generate
npx prisma db push # Update schema without reset
pm2 restart simed-backend

# Frontend Setup
echo "Updating Frontend..."
cd ../frontend
npm install
# Ensure environment variables are set for build
export VITE_API_URL=https://dev.fallonava.my.id/api
export VITE_SOCKET_URL=https://dev.fallonava.my.id
npm run build

echo "Deployment Complete!"
