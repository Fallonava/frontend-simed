#!/bin/bash
echo "=== USERS ==="
sudo -u postgres psql -d simed -c 'SELECT username, role FROM "User";'

echo "=== LOGIN TEST ==="
curl -v -X POST -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin123"}' http://127.0.0.1:3000/api/auth/login
