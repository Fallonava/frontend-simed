#!/bin/bash

# ============================================
# 🔄 SIMRS Safe Production Migration Script
# ============================================
# This script safely applies database migrations
# without losing existing data
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/simed-app"  # Updated to match actual server path
BACKEND_DIR="$APP_DIR/backend"
DB_NAME="simrs_production"
DB_USER="simrs_user"
BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SIMRS Safe Production Migration      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# Step 1: Pre-flight Checks
# ============================================
echo -e "${YELLOW}[1/8] Running pre-flight checks...${NC}"

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Error: Application directory not found: $APP_DIR${NC}"
    echo -e "${YELLOW}💡 Please update APP_DIR in this script to match your deployment path${NC}"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: Backend directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

# Check if node and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if prisma is available
cd "$BACKEND_DIR"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found in backend directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pre-flight checks passed${NC}"
echo ""

# ============================================
# Step 2: Create Backup Directory
# ============================================
echo -e "${YELLOW}[2/8] Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ Backup directory ready: $BACKUP_DIR${NC}"
echo ""

# ============================================
# Step 3: Backup Database
# ============================================
echo -e "${YELLOW}[3/8] Creating database backup...${NC}"
BACKUP_FILE="$BACKUP_DIR/simrs_backup_$TIMESTAMP.sql"

# Attempt backup with different methods
if command -v sudo &> /dev/null; then
    sudo -u postgres pg_dump $DB_NAME > "$BACKUP_FILE" 2>/dev/null || \
    pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE" 2>/dev/null || \
    echo -e "${YELLOW}⚠️  Could not create automatic backup. Please backup manually.${NC}"
else
    pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE" 2>/dev/null || \
    echo -e "${YELLOW}⚠️  Could not create automatic backup. Please backup manually.${NC}"
fi

if [ -f "$BACKUP_FILE" ]; then
    # Compress backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
    echo -e "${GREEN}✅ Database backup created: $BACKUP_FILE${NC}"
    echo -e "${BLUE}   Backup size: $(du -h $BACKUP_FILE | cut -f1)${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Backup was not created. Continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo -e "${RED}Migration aborted by user${NC}"
        exit 1
    fi
fi
echo ""

# ============================================
# Step 4: Pull Latest Code
# ============================================
echo -e "${YELLOW}[4/8] Pulling latest code from GitHub...${NC}"
cd "$APP_DIR"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}   Current branch: $CURRENT_BRANCH${NC}"

# Stash any local changes
git stash

# Pull latest
if git pull origin $CURRENT_BRANCH; then
    echo -e "${GREEN}✅ Code updated successfully${NC}"
else
    echo -e "${RED}❌ Error: Failed to pull latest code${NC}"
    exit 1
fi
echo ""

# ============================================
# Step 5: Install Dependencies
# ============================================
echo -e "${YELLOW}[5/8] Installing/updating dependencies...${NC}"
cd "$BACKEND_DIR"

if npm install --production; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Error: Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# ============================================
# Step 6: Apply Migrations (SAFE)
# ============================================
echo -e "${YELLOW}[6/8] Applying database migrations...${NC}"
echo -e "${BLUE}   Using: npx prisma migrate deploy${NC}"
echo -e "${BLUE}   This will NOT delete any existing data${NC}"

if npx prisma migrate deploy; then
    echo -e "${GREEN}✅ Migrations applied successfully${NC}"
else
    echo -e "${RED}❌ Error: Migration failed${NC}"
    echo -e "${YELLOW}💡 You can restore from backup: $BACKUP_FILE${NC}"
    exit 1
fi
echo ""

# ============================================
# Step 7: Regenerate Prisma Client
# ============================================
echo -e "${YELLOW}[7/8] Regenerating Prisma Client...${NC}"

if npx prisma generate; then
    echo -e "${GREEN}✅ Prisma Client regenerated${NC}"
else
    echo -e "${RED}❌ Error: Failed to generate Prisma Client${NC}"
    exit 1
fi
echo ""

# ============================================
# Step 8: Restart Application
# ============================================
echo -e "${YELLOW}[8/8] Restarting application...${NC}"

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}   Using PM2 to restart...${NC}"
    pm2 restart all
    echo ""
    echo -e "${BLUE}   Application Status:${NC}"
    pm2 list
    echo ""
    echo -e "${GREEN}✅ Application restarted${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found. Please restart your application manually.${NC}"
fi
echo ""

# ============================================
# Final Status
# ============================================
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Migration Completed Successfully   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Migration Summary:${NC}"
echo -e "  📦 Backup: $BACKUP_FILE"
echo -e "  🗂️  Branch: $CURRENT_BRANCH"
echo -e "  ⏰ Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo -e "${BLUE}Verification Commands:${NC}"
echo -e "  npx prisma migrate status"
echo -e "  pm2 logs --lines 100"
echo -e "  curl http://localhost:3000/api/health"
echo ""
echo -e "${YELLOW}💡 Keep this backup safe: $BACKUP_FILE${NC}"
