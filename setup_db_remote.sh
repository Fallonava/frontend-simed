#!/bin/bash
set -e

echo "Setting postgres password..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

echo "Creating database simed..."
# Check if database exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw simed; then
    echo "Database 'simed' already exists."
else
    sudo -u postgres psql -c "CREATE DATABASE simed;"
    echo "Database 'simed' created."
fi
