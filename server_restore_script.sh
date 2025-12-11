#!/bin/bash
export PGPASSWORD=postgres
echo "Terminating connections..."
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'simed' AND pid <> pg_backend_pid();"
echo "Dropping DB..."
dropdb -U postgres simed
echo "Creating DB..."
createdb -U postgres simed
echo "Restoring Dump..."
psql -U postgres -d simed -f ~/local_dump.sql
echo "Restarting Backend..."
pm2 restart simed-backend
echo "Done."
