# Eye Clinic Management System - Deployment Guide

**Version:** 3.1.0
**Last Updated:** March 16, 2026
**System:** Eye Clinic Management System (ECMS)

---

## TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Building for Production](#building-for-production)
7. [Deployment Options](#deployment-options)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Backup & Maintenance](#backup--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## PREREQUISITES

### Software Requirements

**Required:**
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git (for version control)

**Optional:**
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certificate (for HTTPS)

### Knowledge Requirements

- Basic command line operations
- Understanding of Node.js applications
- Basic system administration

---

## SYSTEM REQUIREMENTS

### Minimum Requirements:
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 20 GB (10 GB for app + 10 GB for data/uploads)
- **OS:** Ubuntu 20.04+, CentOS 8+, Windows Server 2019+, or macOS 11+

### Recommended for Production:
- **CPU:** 4+ cores
- **RAM:** 8+ GB
- **Storage:** 50+ GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Network:** Static IP, domain name, SSL certificate

---

## INSTALLATION STEPS

### 1. Clone the Repository

```bash
# Navigate to your desired installation directory
cd /opt  # or C:\inetpub\ on Windows

# Clone the repository
git clone https://github.com/MuZaKa66/eye_clinic_Fari.git eye-clinic
cd eye-clinic
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# Verify installation
npm list --depth=0
```

**Expected Output:**
```
eye-clinic-management-system@1.0.0
├── @types/node@20.x.x
├── express@4.18.x
├── react@18.2.x
├── typescript@5.2.x
├── vite@5.4.x
└── ... (additional packages)
```

### 3. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env  # or use your preferred editor
```

---

## DATABASE SETUP

### SQLite Database (Default)

The system uses SQLite, which is automatically created on first run.

**Database Location:** `./server/clinic.db`

### Initial Database Setup

The database is automatically initialized with:
- ✅ All 24 tables (schema)
- ✅ Default admin user
- ✅ System roles (admin, doctor, receptionist, accountant)
- ✅ Default settings

**Default Admin Credentials:**
```
Username: admin
Password: Admin@123
Email: admin@clinic.local
```

⚠️ **IMPORTANT:** Change the admin password immediately after first login!

### Manual Database Initialization (if needed)

```bash
# If database doesn't auto-create, run:
cd server
node -e "require('./database').initializeDatabase()"
```

### Database File Permissions

```bash
# Ensure proper permissions (Linux/Mac)
chmod 644 server/clinic.db
chmod 755 server/

# Or set ownership
chown www-data:www-data server/clinic.db  # Ubuntu/Apache
chown nginx:nginx server/clinic.db        # CentOS/Nginx
```

---

## ENVIRONMENT CONFIGURATION

### Environment Variables (.env)

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=./server/clinic.db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRY=24h

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Application
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:3001

# Clinic Information
CLINIC_NAME=Eye Clinic Fari
CLINIC_ADDRESS=Your Clinic Address
CLINIC_PHONE=+92-51-1234567
CLINIC_EMAIL=info@clinic.local
```

### Security Configuration

**Generate Secure JWT Secret:**
```bash
# Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste into `.env` as `JWT_SECRET`.

---

## BUILDING FOR PRODUCTION

### 1. Build Frontend

```bash
# Build the React frontend
npm run build
```

**Output:** `dist/` folder containing production-ready static files

**Expected Output:**
```
✓ 1758 modules transformed.
dist/index.html                   0.48 kB
dist/assets/index-[hash].css     23.56 kB │ gzip:  4.71 kB
dist/assets/index-[hash].js     246.69 kB │ gzip: 70.64 kB
✓ built in 5.86s
```

### 2. Test the Build

```bash
# Start the production server
npm start

# Or with explicit environment
NODE_ENV=production node server/index.js
```

### 3. Verify Build

Open browser: `http://localhost:3001`

Expected: Login page loads with no console errors

---

## DEPLOYMENT OPTIONS

### Option 1: Direct Node.js (Development/Small Clinics)

```bash
# Start the server
npm start

# Or with PM2 for auto-restart
npm install -g pm2
pm2 start server/index.js --name eye-clinic
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

**PM2 Commands:**
```bash
pm2 status            # Check status
pm2 logs eye-clinic   # View logs
pm2 restart eye-clinic # Restart app
pm2 stop eye-clinic   # Stop app
pm2 delete eye-clinic # Remove from PM2
```

---

### Option 2: Nginx Reverse Proxy (Recommended for Production)

#### Install Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
```

#### Configure Nginx

Create configuration file:
```bash
sudo nano /etc/nginx/sites-available/eye-clinic
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name clinic.yourdomain.com;  # Change to your domain

    # Frontend (static files)
    location / {
        root /opt/eye-clinic/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File uploads
    location /uploads {
        alias /opt/eye-clinic/uploads;
        internal;  # Only accessible through application
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size
    client_max_body_size 10M;
}
```

#### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/eye-clinic /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### Option 3: SSL/HTTPS Configuration (Production)

#### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d clinic.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

Certbot automatically modifies your Nginx configuration to use HTTPS.

#### Manual SSL Certificate

If using a purchased certificate:

```nginx
server {
    listen 443 ssl http2;
    server_name clinic.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name clinic.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

### Option 4: Docker Deployment (Advanced)

**Dockerfile** (create in project root):

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "server/index.js"]
```

**Build and Run:**
```bash
# Build image
docker build -t eye-clinic:latest .

# Run container
docker run -d \
  --name eye-clinic \
  -p 3001:3001 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/server/clinic.db:/app/server/clinic.db \
  --restart unless-stopped \
  eye-clinic:latest

# Check logs
docker logs -f eye-clinic
```

---

## POST-DEPLOYMENT CONFIGURATION

### 1. Change Default Admin Password

**Login Steps:**
1. Navigate to `https://your-domain.com`
2. Login with default credentials (admin/Admin@123)
3. Go to Settings → Profile
4. Change password
5. Update email address

### 2. Create Additional Users

**Admin Instructions:**
1. Login as admin
2. Go to Settings → User Management (when implemented)
3. Add users:
   - Doctors
   - Receptionists
   - Accountants
4. Assign appropriate roles

**Via Database (if UI not available):**
```sql
-- Connect to database
sqlite3 server/clinic.db

-- View users
SELECT * FROM users;

-- Create new user (password must be hashed)
-- Use the application's signup page or API endpoint instead
```

### 3. Configure Clinic Settings

**Settings to Configure:**
1. Clinic name, address, phone, email
2. Working hours
3. Appointment slots/duration
4. Receipt/Prescription headers
5. Logo upload (when implemented)

### 4. Setup Backups

**Automated Backup Script (Linux):**

Create `/opt/eye-clinic/backup.sh`:
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups/eye-clinic"
DB_FILE="/opt/eye-clinic/server/clinic.db"
UPLOADS_DIR="/opt/eye-clinic/uploads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
sqlite3 $DB_FILE ".backup $BACKUP_DIR/clinic_$TIMESTAMP.db"

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz $UPLOADS_DIR

# Delete backups older than 30 days
find $BACKUP_DIR -name "clinic_*.db" -mtime +30 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
```

**Make executable and schedule:**
```bash
chmod +x /opt/eye-clinic/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /opt/eye-clinic/backup.sh >> /var/log/eye-clinic-backup.log 2>&1
```

### 5. Setup Monitoring

**PM2 Monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Health Check Endpoint:**
```bash
# Test
curl http://localhost:3001/api/health

# Expected response:
{"status":"ok","timestamp":"2026-03-16T..."}
```

---

## BACKUP & MAINTENANCE

### Daily Backups

**What to Backup:**
1. **Database:** `server/clinic.db`
2. **Uploads:** `uploads/` folder
3. **Configuration:** `.env` file

**Backup Locations:**
- Local: External drive
- Remote: Cloud storage (Dropbox, Google Drive, AWS S3)

### Database Maintenance

**Vacuum (optimize database):**
```bash
# Monthly maintenance
sqlite3 server/clinic.db "VACUUM;"
```

**Check Database Integrity:**
```bash
sqlite3 server/clinic.db "PRAGMA integrity_check;"
# Expected: ok
```

### Log Rotation

**Nginx Logs:**
```bash
# Logrotate is automatic, verify:
ls -lh /var/log/nginx/
```

**Application Logs (PM2):**
```bash
pm2 flush  # Clear logs
pm2 logs --lines 100  # View logs
```

### Updates

**Update Application:**
```bash
cd /opt/eye-clinic

# Backup first!
./backup.sh

# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Rebuild frontend
npm run build

# Restart application
pm2 restart eye-clinic

# Or without PM2
npm start
```

---

## TROUBLESHOOTING

### Application Won't Start

**Check 1: Port in Use**
```bash
# Linux/Mac
lsof -i :3001

# Windows
netstat -ano | findstr :3001

# Solution: Change port in .env or kill process
```

**Check 2: Database Permissions**
```bash
ls -l server/clinic.db
# Should be readable/writable by application user
```

**Check 3: Missing Dependencies**
```bash
npm install
```

### Database Errors

**Error:** "SQLITE_CANTOPEN: unable to open database"

**Solution:**
```bash
# Ensure directory exists and is writable
mkdir -p server
touch server/clinic.db
chmod 664 server/clinic.db
```

**Error:** "Database is locked"

**Solution:**
```bash
# Check for other processes using database
lsof server/clinic.db

# Kill process if needed
# Then restart application
```

### Upload Errors

**Error:** "ENOENT: no such file or directory, open 'uploads/...'"

**Solution:**
```bash
# Create uploads directory with subdirectories
mkdir -p uploads/prescriptions uploads/reports
chmod 775 uploads
```

### Login Issues

**Problem:** Can't login with admin credentials

**Solution 1:** Reset admin password (database)
```bash
sqlite3 server/clinic.db
DELETE FROM users WHERE username='admin';
# Restart application to recreate default admin
```

**Solution 2:** Check JWT secret
```bash
# Ensure JWT_SECRET is set in .env
cat .env | grep JWT_SECRET
```

### Performance Issues

**Problem:** Slow response times

**Solutions:**
1. Check server resources: `htop` or `top`
2. Check database size: `ls -lh server/clinic.db`
3. Vacuum database: `sqlite3 server/clinic.db "VACUUM;"`
4. Restart application: `pm2 restart eye-clinic`
5. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Nginx Issues

**Problem:** 502 Bad Gateway

**Solution:**
```bash
# Check if application is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart services
pm2 restart eye-clinic
sudo systemctl restart nginx
```

---

## SECURITY CHECKLIST

### Pre-Deployment:
- [ ] Change default admin password
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set appropriate file permissions
- [ ] Configure firewall (allow only 80, 443, SSH)
- [ ] Disable directory listing
- [ ] Remove .git folder from web root

### Post-Deployment:
- [ ] Regular backups configured
- [ ] Monitoring/alerts setup
- [ ] Log rotation configured
- [ ] Keep system updated
- [ ] Regular security audits

### Ongoing:
- [ ] Update Node.js and npm regularly
- [ ] Review user accounts quarterly
- [ ] Monitor access logs
- [ ] Test backup restoration annually

---

## SUPPORT & MAINTENANCE

### Regular Maintenance Schedule

**Daily:**
- Check application status
- Review error logs

**Weekly:**
- Verify backups
- Check disk space

**Monthly:**
- Update dependencies (if security patches available)
- Vacuum database
- Review access logs

**Quarterly:**
- Test backup restoration
- Review user accounts
- Update documentation

### Getting Help

**Documentation:**
- README.md
- FEATURES.md
- API Documentation (documents/PHASE6_BACKEND_COMPLETE.md)

**Logs Location:**
- Application: `~/.pm2/logs/`
- Nginx: `/var/log/nginx/`
- System: `/var/log/syslog` or `/var/log/messages`

---

## CONCLUSION

Your Eye Clinic Management System is now deployed!

**Next Steps:**
1. Login and change admin password
2. Create user accounts
3. Configure clinic settings
4. Setup automated backups
5. Train staff on system usage

**Important Reminders:**
- ⚠️ Always backup before updates
- ⚠️ Keep credentials secure
- ⚠️ Monitor logs regularly
- ⚠️ Keep system updated

---

**Deployment Guide Version:** 1.0
**Last Updated:** March 16, 2026
**Questions?** Refer to troubleshooting section or contact system administrator.
