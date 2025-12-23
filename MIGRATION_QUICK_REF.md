# 🚀 Quick Migration Reference Card

## ⚡ TL;DR - Fastest Way (Copy-Paste Ready)

```bash
# SSH to server
ssh -i hospital-api.pem ubuntu@16.79.196.134

# Download and run migration script
curl -o migrate.sh https://raw.githubusercontent.com/YOUR_REPO/main/migrate-production.sh
chmod +x migrate.sh
./migrate.sh
```

## 📋 Manual Migration (If Script Not Available)

```bash
# 1. SSH to server
ssh -i hospital-api.pem ubuntu@16.79.196.134

# 2. Backup database
sudo -u postgres pg_dump simrs_production > ~/backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Update code
cd /var/www/simrs && git pull

# 4. Apply migrations
cd backend && npx prisma migrate deploy && npx prisma generate

# 5. Restart app
pm2 restart all && pm2 logs --lines 50
```

## 🎯 What Happens (Safe Migration)

✅ **WILL DO:**
- Add new tables
- Add new columns
- Add new indexes
- Modify column types (if safe)
- Keep ALL existing data

❌ **WILL NOT DO:**
- Delete any tables
- Delete any columns
- Truncate any data
- Reset the database

## 🔄 Current Pending Changes

### MedicalRecord
```sql
ALTER TABLE "MedicalRecord" 
  ADD COLUMN "is_signed" BOOLEAN DEFAULT false,
  ADD COLUMN "signed_at" TIMESTAMP,
  ADD COLUMN "tte_metadata" JSONB;
```

### ServiceOrder
```sql
ALTER TABLE "ServiceOrder" 
  ADD COLUMN "result_image_url" TEXT,
  ADD COLUMN "dicom_study_id" TEXT;
```

## 🆘 Emergency Rollback

```bash
# Restore from backup
gunzip ~/backup_YYYYMMDD_HHMMSS.sql.gz
psql -U simrs_user simrs_production < ~/backup_YYYYMMDD_HHMMSS.sql
```

## 📊 Verification

```bash
# Check migration status
npx prisma migrate status

# Verify new columns exist
psql -U simrs_user simrs_production -c "\d \"MedicalRecord\""

# Check app health
curl http://localhost:3000/api/health

# Monitor logs
pm2 logs simrs-backend --lines 100
```

---

**Need Help?** See [`SAFE_MIGRATION_GUIDE.md`](./SAFE_MIGRATION_GUIDE.md) for detailed documentation.
