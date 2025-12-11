#!/bin/bash
SERVER_IP="13.210.197.247"
SSH_USER="ubuntu"

# Secure key handling
cp "./hospital-api.pem" /tmp/hospital-api-debug.pem
chmod 400 /tmp/hospital-api-debug.pem
PEM_KEY="/tmp/hospital-api-debug.pem"

# Cleanup
trap "rm -f /tmp/hospital-api-debug.pem" EXIT

SSH_CMD="ssh -o StrictHostKeyChecking=no -i $PEM_KEY $SSH_USER@$SERVER_IP"

echo "=== node version ==="
$SSH_CMD "node -v"

echo "=== PM2 Status ==="
$SSH_CMD "pm2 list"

echo "=== PM2 Logs (simed-backend) ==="
$SSH_CMD "pm2 logs simed-backend --lines 50 --nostream"

echo "=== Nginx Error Logs ==="
$SSH_CMD "sudo tail -n 20 /var/log/nginx/error.log"
