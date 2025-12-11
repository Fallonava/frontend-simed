#!/bin/bash
cd ~/simed/frontend
echo "=== DIR LIST ==="
ls -la
echo "=== INSTALLING DEPS ==="
npm install
echo "=== BUILDING ==="
export VITE_API_URL=https://dev.fallonava.my.id/api
export VITE_SOCKET_URL=https://dev.fallonava.my.id
npm run build
echo "=== BUILD RESULT ==="
ls -la dist
