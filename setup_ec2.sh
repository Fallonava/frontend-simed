#!/bin/bash

# SIMED Production Setup Script for Ubuntu EC2

# Update and Upgrade
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# Install Backend Dependencies
echo "Setting up Backend..."
cd backend
if [ -f "package.json" ]; then
    npm install --production
    npx prisma generate
else
    echo "Backend package.json not found!"
fi
cd ..

# Install Frontend Dependencies and Build
echo "Setting up Frontend..."
cd frontend
if [ -f "package.json" ]; then
    npm install
    echo "Building frontend..."
    npm run build
else
    echo "Frontend package.json not found!"
fi
cd ..

# Configure Nginx
echo "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/simed
sudo ln -sf /etc/nginx/sites-available/simed /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start Backend with PM2
echo "Starting Backend..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | bash

echo "Setup Complete!"
