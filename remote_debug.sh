#!/bin/bash
echo "=== PM2 LOGS DIR LISTING ==="
ls -la /home/ubuntu/.pm2/logs/

echo "=== SIMED BACKEND ERROR LOG ==="
if [ -f /home/ubuntu/.pm2/logs/simed-backend-error.log ]; then
    tail -n 20 /home/ubuntu/.pm2/logs/simed-backend-error.log
else
    echo "Log file not found at /home/ubuntu/.pm2/logs/simed-backend-error.log"
    echo "Finding logs via find:"
    find /home/ubuntu/.pm2/logs -name "*error.log"
fi
