#!/bin/bash

# SIMED Deployment Script (Clean Wipe & Install - Specific Auth)
SERVER_IP="13.210.197.247"
SSH_USER="ubuntu"

# Secure key handling for Windows/WSL/Git Bash compatibility
cp "./hospital-api.pem" /tmp/hospital-api.pem
chmod 400 /tmp/hospital-api.pem
PEM_KEY="/tmp/hospital-api.pem"

# Cleanup temp key on exit
trap "rm -f /tmp/hospital-api.pem" EXIT

SSH_CMD="ssh -o StrictHostKeyChecking=no -i $PEM_KEY $SSH_USER@$SERVER_IP"

echo "========================================"
echo "    STARTING MISSION: FULL REDEPLOY     "
echo "========================================"

$SSH_CMD "
    set -e
    
    echo '[1/6] Cleaning and Updating Codebase...'
    # If repo exists, pull; if not, clone
    if [ -d ~/simed ]; then
        cd ~/simed
        git fetch origin
        git reset --hard origin/dev
        git checkout dev
        git pull origin dev
    else
        git clone -b dev https://github.com/Fallonava/frontend-simed.git ~/simed
        cd ~/simed
    fi

    echo '[2/6] Setup Backend...'
    cd ~/simed/backend
    # Ensure .env exists with correct DB URL (Force 127.0.0.1)
    if ! grep -q '127.0.0.1' .env; then
         sed -i 's/localhost/127.0.0.1/g' .env
    fi
    npm install
    chmod -R +x node_modules/.bin
    npx prisma generate

    echo '[3/6] Setup Frontend...'
    cd ~/simed/frontend
    rm -rf dist
    npm install
    chmod -R +x node_modules/.bin
    
    # Set Env for Build
    export VITE_API_URL=https://dev.fallonava.my.id/api
    export VITE_SOCKET_URL=https://dev.fallonava.my.id
    npm run build

    echo '[4/6] Fix Permissions...'
    sudo chmod -R 755 /home/ubuntu/simed/frontend/dist

    echo '[5/6] Restart Services...'
    pm2 restart simed-backend || pm2 start src/app.js --name simed-backend
    sudo systemctl restart nginx

    echo '[6/6] Deployment Complete!'
"

echo "========================================"
echo "    MISSION COMPLETE: SERVER UPDATED    "
echo "========================================"
