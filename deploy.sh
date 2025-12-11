#!/bin/bash

# SIMED Deployment Script (Clean Wipe & Install - Specific Auth)
SERVER_IP="13.210.197.247"
SSH_USER="ubuntu"
PEM_KEY="./hospital-api.pem"
REPO_URL="https://github.com/Fallonava/frontend-simed.git"
SSH_CMD="ssh -i $PEM_KEY $SSH_USER@$SERVER_IP"

echo "========================================"
echo "    STARTING MISSION: CLEAN DEPLOY (Specific SSH)"
echo "    Target: $SERVER_IP"
echo "========================================"

# Step 1: Push changes
echo "[1/4] Pushing local changes to GitHub..."
# git push
if [ $? -ne 0 ]; then
    echo "ERROR: Git push failed. Please authenticate and run again."
    exit 1
fi

# Step 2: Wipe Server
echo -e "\n[2/4] Wiping and preparing server..."
$SSH_CMD "pm2 stop all; sudo rm -rf ~/simed"

# Step 3: Clone, Setup DB, and Seed
echo -e "\n[3/4] Installing fresh application (Backend & Frontend)..."
# We use 'prisma db push' because we don't have migration files commit
$SSH_CMD "git clone $REPO_URL ~/simed && \
cd ~/simed/backend && \
npm install && \
echo 'DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/simed?schema=public\"' > .env && \
npx prisma generate && \
npx prisma db push && \
npx prisma db seed && \
cd ~/simed/frontend && \
npm install && \
npm run build"

# Step 4: Start Backend
echo -e "\n[4/4] Starting Backend..."
$SSH_CMD "cd ~/simed/backend && pm2 start src/app.js --name simed-backend && pm2 save"

echo -e "\n========================================"
echo "    MISSION COMPLETE: SERVER RESTORED Locally"
echo "========================================"
