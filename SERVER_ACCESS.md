# 🔐 Production Server Access Guide

## Server Information

**Host**: `16.79.196.134`  
**User**: `ubuntu`  
**SSH Key**: `hospital-api.pem` (located in project root)  
**Environment**: Ubuntu Linux (Production)

---

## 🚀 Quick Access (Windows)

### Method 1: PowerShell (Recommended)

```powershell
# Navigate to project directory
cd F:\PROJECT\frontend-simed-1

# Connect to server
ssh -i .\hospital-api.pem ubuntu@16.79.196.134
```

### Method 2: Full Path

```powershell
ssh -i F:\PROJECT\frontend-simed-1\hospital-api.pem ubuntu@16.79.196.134
```

---

## 🛠️ First-Time Setup (Windows Only)

SSH keys require strict permissions on Windows. If you encounter **"bad permissions"** error, follow these steps:

### Step 1: Fix SSH Key Permissions

```powershell
# Navigate to project
cd F:\PROJECT\frontend-simed-1

# Reset all permissions
icacls "hospital-api.pem" /reset

# Remove inheritance and grant read-only to current user
icacls "hospital-api.pem" /inheritance:r /grant "${env:USERNAME}:(R)"
```

### Step 2: Verify Permissions

```powershell
# Check current permissions
icacls hospital-api.pem
```

**Expected Output**: Only your Windows username should have Read (R) access.

### Step 3: Test Connection

```powershell
# Test with simple command
ssh -i .\hospital-api.pem ubuntu@16.79.196.134 "whoami"
```

**Expected Output**: `ubuntu`

---

## 📝 Common Commands

### Check Server Status

```bash
# After SSH connection
ssh -i .\hospital-api.pem ubuntu@16.79.196.134

# System info
uname -a
df -h
free -m
top -bn1 | head -20

# Check running services
systemctl status nginx
systemctl status postgresql
pm2 list
```

### Execute Remote Command Without Login

```powershell
# Single command execution
ssh -i .\hospital-api.pem ubuntu@16.79.196.134 "ls -la /home/ubuntu"

# Multiple commands
ssh -i .\hospital-api.pem ubuntu@16.79.196.134 "cd /var/www/simrs && git pull && pm2 restart all"
```

### File Transfer (SCP)

```powershell
# Upload file TO server
scp -i .\hospital-api.pem localfile.txt ubuntu@16.79.196.134:/home/ubuntu/

# Download file FROM server
scp -i .\hospital-api.pem ubuntu@16.79.196.134:/home/ubuntu/remotefile.txt ./

# Upload entire directory
scp -i .\hospital-api.pem -r ./frontend ubuntu@16.79.196.134:/var/www/simrs/
```

---

## 🔧 Troubleshooting

### Error: "Permission denied (publickey)"

**Causes**:
1. SSH key file has incorrect permissions
2. Wrong file path
3. Key not authorized on server

**Solution**:
```powershell
# 1. Verify file exists
Test-Path .\hospital-api.pem

# 2. Fix permissions (see First-Time Setup above)
icacls "hospital-api.pem" /reset
icacls "hospital-api.pem" /inheritance:r /grant "${env:USERNAME}:(R)"

# 3. Check if key is recognized
ssh -vvv -i .\hospital-api.pem ubuntu@16.79.196.134
```

### Error: "bad permissions"

This happens when Windows file permissions are too open (multiple users can read the key).

**Solution**:
```powershell
icacls "hospital-api.pem" /inheritance:r /grant:r "${env:USERNAME}:R"
```

### Error: "Connection timed out"

**Causes**:
1. Server is down
2. Firewall blocking port 22
3. Network issue

**Solution**:
```powershell
# Test connectivity
ping 16.79.196.134

# Check if SSH port is open
Test-NetConnection -ComputerName 16.79.196.134 -Port 22
```

### Error: "Host key verification failed"

This happens on first connection or if server IP changed.

**Solution**:
```powershell
# Remove old host key
ssh-keygen -R 16.79.196.134

# Reconnect and accept new fingerprint
ssh -i .\hospital-api.pem ubuntu@16.79.196.134
```

---

## 🔒 Security Best Practices

1. **Never share** the `hospital-api.pem` file
2. **Never commit** `.pem` files to git (already in `.gitignore`)
3. **Always use** SSH keys, never password authentication
4. Keep SSH key permissions **strict** (read-only for owner)
5. Use **sudo** only when necessary on the server
6. Always **backup** the SSH key to secure location

---

## 📂 Directory Structure on Server

```
/home/ubuntu/                    # User home directory
/var/www/simed-app/             # Application root (simed-app)
├── frontend/                   # React frontend build
├── backend/                    # Node.js backend
├── bridge-service/             # National integration bridge
└── .env                        # Environment variables (production)

/etc/nginx/sites-available/     # Nginx configuration
/var/log/nginx/                 # Nginx logs
/var/log/pm2/                   # PM2 process logs
```

---

## 🚨 Emergency Access Recovery

If you lose the `hospital-api.pem` file:

1. **Via Hosting Provider Console**:
   - Login to your cloud provider (AWS, DigitalOcean, etc.)
   - Access server via web console/VNC
   - Generate new SSH key pair
   - Add new public key to `~/.ssh/authorized_keys`

2. **Create New SSH Key** (if you have alternative access):
   ```bash
   # On local Windows machine
   ssh-keygen -t rsa -b 4096 -f hospital-api-new.pem
   
   # Copy public key to server (via alternative method)
   # Then on server:
   cat hospital-api-new.pem.pub >> ~/.ssh/authorized_keys
   ```

---

## 📞 Support

For access issues, contact:
- **System Administrator**: [Your Name/Team]
- **Cloud Provider Support**: [Provider Console Link]
- **Emergency Contact**: [Phone/Email]

---

**Last Updated**: 2025-12-23  
**Maintained By**: Development Team
