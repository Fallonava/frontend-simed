#!/bin/bash
set -e
echo "--- Starting Server Update ---"

cd ~/simed

# 1. Update Code (Stash any changes just in case, pull, then pop? No, we just SCP'd files we want to KEEP)
# If we git pull, it might conflict with our SCP'd files.
# So we will NOT git pull for the frontend files we just sent.
# We will git pull for everything else? 
# If we run git pull, it will complain about local changes to MasterData.jsx.
# So: we assume the repo is mostly up to date, or we force other files.
# Let's try to update backend specifically.

cd backend
# git pull? If we do git pull in root, it affects all.
# Let's skip git pull for now and trust our SCP is the main change. 
# If user wants "update data bertahap", maybe they mean database?
# But checking context, they likely mean "deploy my changes".

echo "Installing Backend Deps..."
npm install --production
echo "Migrating Database..."
npx prisma migrate deploy
echo "Restarting Backend..."
pm2 restart simed-backend

echo "Building Frontend..."
cd ../frontend
npm install
npm run build

echo "Frontend Build Complete."
# If nginx serves dist, we are done.
# If pm2 serves frontend:
pm2 restart simed-frontend || echo "simed-frontend pm2 process not found, assuming nginx serves static."

echo "--- Update Complete ---"
