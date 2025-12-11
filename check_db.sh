#!/bin/bash
sudo -u postgres psql -d simed -c 'SELECT count(*) FROM "User"'
sudo -u postgres psql -d simed -c 'SELECT count(*) FROM "Patient"'
