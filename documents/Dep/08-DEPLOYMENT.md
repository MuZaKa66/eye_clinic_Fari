# Deployment Guide - Ubuntu LAN Installation

## Objective
Step-by-step guide for deploying the Eye Clinic Management System on Ubuntu 22.04 LTS in a LAN environment.

---

## Prerequisites

### Hardware Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 16GB available (as specified)
- **Storage**: 50GB+ free space (for database, uploads, backups)
- **Network**: Ethernet connection for stable LAN access

### Software Requirements
- **OS**: Ubuntu 22.04 LTS (recommended) or 20.04 LTS
- **Node.js**: v18+ (will be installed)
- **SQLite**: Included with Node.js
- **Git**: For version control (optional but recommended)

---

## Installation Steps

### Step 1: System Preparation

#### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

#### Install Required Packages
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git (optional, for updates)
sudo apt install git -y
```

---

### Step 2: Application Deployment

#### Option A: From Bolt.new ZIP File

```bash
# Create application directory
sudo mkdir -p /opt/eye-clinic-app
cd /opt/eye-clinic-app

# Copy your downloaded ZIP file to server
# (use SCP, USB drive, or network share)

# Extract ZIP
sudo unzip eye-clinic-app.zip

# Set ownership
sudo chown -R $USER:$USER /opt/eye-clinic-app

# Install dependencies
cd /opt/eye-clinic-app
npm install
```

#### Option B: From Git Repository

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/your-repo/eye-clinic-app.git
cd eye-clinic-app

# Set ownership
sudo chown -R $USER:$USER /opt/eye-clinic-app

# Install dependencies
npm install
```

---

### Step 3: Configuration

#### Create Environment File

```bash
# Create .env file
nano .env
```

**Add the following configuration**:
```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_PATH=./database/clinic.db

# JWT Secret (change this to a random string!)
JWT_SECRET=your-super-secret-key-change-this-in-production

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Clinic Information
CLINIC_NAME=Eye Care Clinic
CLINIC_PHONE=+92-51-1234567
CLINIC_EMAIL=info@eyeclinic.com

# Backup Settings
BACKUP_DIR=./backups
BACKUP_ENABLED=true
BACKUP_TIME=02:00  # Daily backup at 2 AM
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

---

#### Create Required Directories

```bash
# Create directories for database, uploads, backups
mkdir -p database
mkdir -p uploads/prescriptions
mkdir -p uploads/reports
mkdir -p backups

# Set appropriate permissions
chmod 755 database uploads backups
```

---

### Step 4: Database Initialization

```bash
# Initialize database (creates tables and default data)
npm run db:init

# Verify database created
ls -lh database/clinic.db
```

**Default Admin User Created**:
- Username: `admin`
- Password: `Admin@123`
- **⚠️ IMPORTANT**: Change this password immediately after first login!

---

### Step 5: Build Frontend (if using React + Vite)

```bash
# Build production frontend
npm run build

# This creates optimized files in dist/ or build/ directory
```

---

### Step 6: Start Application with PM2

#### Start Application

```bash
# Start with PM2
pm2 start npm --name "eye-clinic" -- start

# OR if you have a specific start script
pm2 start server.js --name "eye-clinic"

# Check status
pm2 status

# View logs
pm2 logs eye-clinic
```

#### Configure PM2 for Auto-start on Reboot

```bash
# Generate startup script
pm2 startup

# This will output a command, run it (example):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-username --hp /home/your-username

# Save current PM2 process list
pm2 save

# Test by rebooting
sudo reboot
```

After reboot, verify:
```bash
pm2 status
# Should show eye-clinic running
```

---

### Step 7: Firewall Configuration

#### Allow Application Port

```bash
# Check if firewall is active
sudo ufw status

# If active, allow port 3000
sudo ufw allow 3000/tcp

# Reload firewall
sudo ufw reload
```

---

### Step 8: Find Server IP Address

```bash
# Find LAN IP address
ip addr show

# Look for inet address under your network interface (usually eth0 or ens33)
# Example: inet 192.168.1.100/24
```

---

### Step 9: Access Application

**From any device on the same LAN**:

Open web browser and navigate to:
```
http://[SERVER-IP]:3000
```

Example: `http://192.168.1.100:3000`

**Login with default credentials**:
- Username: `admin`
- Password: `Admin@123`

**⚠️ Immediately change password after first login!**

---

## Post-Installation Configuration

### 1. Change Admin Password

1. Login as admin
2. Go to Settings → Users
3. Click Edit on admin user
4. Change password to a strong password
5. Save

### 2. Configure Clinic Information

1. Go to Settings → Clinic Information
2. Fill in all details:
   - Clinic Name
   - Address
   - Phone, Email
   - Upload clinic logo
3. Save

### 3. Add Other Users

1. Go to Settings → Users
2. Click "Add New User"
3. Create users with appropriate roles:
   - Receptionist
   - Doctor
   - Accountant
4. Assign multiple roles if needed (e.g., Receptionist + Accountant)

### 4. Configure Appointment Settings

1. Go to Settings → General Settings
2. Set clinic hours (opening/closing times)
3. Set default appointment duration
4. Configure days open
5. Save

### 5. Set Up Billing Defaults

1. Go to Settings → Billing Configuration
2. Set default prices for common services
3. Configure tax settings (if applicable)
4. Set invoice terms
5. Save

---

## Backup & Maintenance

### Manual Backup

#### Database Backup
```bash
# Copy database file
cp /opt/eye-clinic-app/database/clinic.db \
   /opt/eye-clinic-app/backups/clinic-db-$(date +%Y%m%d-%H%M%S).db

# Backup uploads folder
tar -czf /opt/eye-clinic-app/backups/uploads-$(date +%Y%m%d).tar.gz \
   /opt/eye-clinic-app/uploads/
```

#### Automated Backup Script

Create backup script:
```bash
nano /opt/eye-clinic-app/backup.sh
```

Add content:
```bash
#!/bin/bash

BACKUP_DIR="/opt/eye-clinic-app/backups"
DATE=$(date +%Y%m%d-%H%M%S)
APP_DIR="/opt/eye-clinic-app"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
cp $APP_DIR/database/clinic.db $BACKUP_DIR/clinic-db-$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz $APP_DIR/uploads/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "clinic-db-*.db" -mtime +30 -delete
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make executable:
```bash
chmod +x /opt/eye-clinic-app/backup.sh
```

Schedule daily backup:
```bash
# Edit crontab
crontab -e

# Add line (runs daily at 2 AM):
0 2 * * * /opt/eye-clinic-app/backup.sh >> /var/log/clinic-backup.log 2>&1
```

---

### Restore from Backup

```bash
# Stop application
pm2 stop eye-clinic

# Restore database
cp /opt/eye-clinic-app/backups/clinic-db-YYYYMMDD-HHMMSS.db \
   /opt/eye-clinic-app/database/clinic.db

# Restore uploads (if needed)
tar -xzf /opt/eye-clinic-app/backups/uploads-YYYYMMDD.tar.gz -C /

# Restart application
pm2 restart eye-clinic
```

---

### Update Application

**From Git**:
```bash
cd /opt/eye-clinic-app
pm2 stop eye-clinic
git pull origin main
npm install
npm run build  # If frontend changes
pm2 restart eye-clinic
```

**From ZIP**:
```bash
pm2 stop eye-clinic
# Backup current version
cp -r /opt/eye-clinic-app /opt/eye-clinic-app-backup-$(date +%Y%m%d)
# Extract new version (preserving database and uploads)
# Restart
pm2 restart eye-clinic
```

---

## Monitoring & Logs

### View Application Logs

```bash
# Real-time logs
pm2 logs eye-clinic

# Last 100 lines
pm2 logs eye-clinic --lines 100

# Error logs only
pm2 logs eye-clinic --err
```

### Monitor System Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
# or
top
```

### Check Disk Space

```bash
# Check disk usage
df -h

# Check specific directory sizes
du -sh /opt/eye-clinic-app/database
du -sh /opt/eye-clinic-app/uploads
du -sh /opt/eye-clinic-app/backups
```

---

## Troubleshooting

### Application Won't Start

**Check logs**:
```bash
pm2 logs eye-clinic --err
```

**Common issues**:
1. **Port already in use**:
   ```bash
   # Check what's using port 3000
   sudo lsof -i :3000
   # Kill process or change port in .env
   ```

2. **Database permission issues**:
   ```bash
   # Fix permissions
   chmod 644 database/clinic.db
   chmod 755 database/
   ```

3. **Missing dependencies**:
   ```bash
   npm install
   ```

---

### Cannot Access from Other Computers

1. **Check firewall**:
   ```bash
   sudo ufw status
   sudo ufw allow 3000/tcp
   ```

2. **Verify server is listening on 0.0.0.0**:
   ```bash
   netstat -tuln | grep 3000
   # Should show 0.0.0.0:3000, not 127.0.0.1:3000
   ```

3. **Check .env HOST setting**:
   ```env
   HOST=0.0.0.0  # Not 127.0.0.1 or localhost
   ```

---

### Database Locked Error

```bash
# Find processes accessing database
lsof /opt/eye-clinic-app/database/clinic.db

# Stop application
pm2 stop eye-clinic

# Wait a few seconds
sleep 5

# Restart
pm2 restart eye-clinic
```

---

### Out of Disk Space

```bash
# Clean old backups
find /opt/eye-clinic-app/backups -mtime +30 -delete

# Clean PM2 logs
pm2 flush

# Check uploaded files
du -sh /opt/eye-clinic-app/uploads/*
# Delete if safe
```

---

## Security Recommendations

### 1. Change Default Password
- ✅ Change admin password immediately
- ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)

### 2. Firewall
- ✅ Enable UFW firewall
- ✅ Only allow port 3000 from LAN
- ❌ Do NOT expose to internet without proper security

### 3. Regular Backups
- ✅ Enable daily automated backups
- ✅ Test restore process regularly
- ✅ Store backups on separate drive/location

### 4. Updates
- ✅ Keep Ubuntu updated: `sudo apt update && sudo apt upgrade`
- ✅ Update Node.js packages: `npm update`
- ✅ Monitor security advisories

### 5. User Management
- ✅ Create individual user accounts (don't share credentials)
- ✅ Assign minimum required permissions
- ✅ Regularly review user access
- ✅ Disable inactive users

### 6. Database Security
- ✅ Ensure database file has correct permissions (644)
- ✅ Regular backups
- ✅ Keep in secure directory

---

## Performance Optimization

### For Better Performance

```bash
# Increase Node.js memory limit if needed
# Edit PM2 start command:
pm2 start server.js --name "eye-clinic" --node-args="--max-old-space-size=4096"

# Enable PM2 cluster mode for multiple cores (if needed)
pm2 start server.js -i 2  # Use 2 instances
```

### Database Optimization

```bash
# Vacuum database monthly
sqlite3 database/clinic.db "VACUUM;"

# Analyze for query optimization
sqlite3 database/clinic.db "ANALYZE;"
```

---

## System Information

### Check Application Status

```bash
# PM2 status
pm2 status

# Detailed info
pm2 info eye-clinic

# Resource usage
pm2 monit
```

### Get System Info

```bash
# OS version
lsb_release -a

# Memory usage
free -h

# Disk space
df -h

# Network interfaces
ip addr
```

---

## Support & Maintenance Checklist

**Daily**:
- [ ] Check application is running: `pm2 status`
- [ ] Monitor disk space: `df -h`

**Weekly**:
- [ ] Review application logs: `pm2 logs --lines 100`
- [ ] Check backup success
- [ ] Verify all services working

**Monthly**:
- [ ] Update system: `sudo apt update && sudo apt upgrade`
- [ ] Database vacuum: `sqlite3 database/clinic.db "VACUUM;"`
- [ ] Review user access
- [ ] Test backup restore

**Quarterly**:
- [ ] Full system backup (database + uploads + application)
- [ ] Security review
- [ ] Performance optimization
- [ ] Update application (if new version available)

---

## Quick Reference Commands

```bash
# Start application
pm2 start eye-clinic

# Stop application
pm2 stop eye-clinic

# Restart application
pm2 restart eye-clinic

# View logs
pm2 logs eye-clinic

# Application status
pm2 status

# Manual backup
./backup.sh

# Check disk space
df -h

# Find server IP
ip addr show

# Check if port is open
sudo netstat -tuln | grep 3000
```

---

## Contact & Support

For technical issues:
1. Check logs: `pm2 logs eye-clinic`
2. Review troubleshooting section above
3. Check application documentation
4. Contact system administrator

**Application URL**: `http://[SERVER-IP]:3000`
**Default Login**: admin / Admin@123 (change immediately!)

---

## Success Checklist

Deployment is successful when:
- ✅ Application accessible from LAN (http://SERVER-IP:3000)
- ✅ Can login with admin credentials
- ✅ Admin password changed to secure password
- ✅ Clinic information configured
- ✅ Additional users created with appropriate roles
- ✅ Settings configured (clinic hours, billing, etc.)
- ✅ PM2 auto-starts on server reboot
- ✅ Automated backups scheduled
- ✅ Firewall configured
- ✅ Test patient created successfully
- ✅ Test visit recorded successfully
- ✅ All features accessible and working

**System is now ready for production use!** 🎉
