# Eye Clinic Management System - Administrator Manual

**Version:** 3.1.0
**For:** System Administrators
**Last Updated:** March 16, 2026

---

## TABLE OF CONTENTS

1. [Administrator Overview](#administrator-overview)
2. [First-Time Setup](#first-time-setup)
3. [User Management](#user-management)
4. [Role Management](#role-management)
5. [System Settings](#system-settings)
6. [Activity Monitoring](#activity-monitoring)
7. [Data Management](#data-management)
8. [Security & Permissions](#security--permissions)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## ADMINISTRATOR OVERVIEW

### What is an Administrator?

Administrators have full access to the Eye Clinic Management System and are responsible for:
- ✅ Managing user accounts
- ✅ Assigning roles and permissions
- ✅ Configuring system settings
- ✅ Monitoring system activity
- ✅ Managing data and backups
- ✅ Troubleshooting issues

### Admin Capabilities

As an administrator, you can:
- Create, edit, and deactivate users
- Assign and modify user roles
- View all patient and clinical data
- Access activity logs and audit trails
- Configure system-wide settings
- Export data for backup or analysis
- Reset user passwords
- Monitor system usage

---

## FIRST-TIME SETUP

### 1. Initial Login

**Default Credentials:**
```
URL: http://your-clinic-domain.com (or https://)
Username: admin
Password: Admin@123
```

⚠️ **SECURITY WARNING:** You MUST change this password immediately!

**Login Steps:**
1. Open your web browser
2. Navigate to your clinic's URL
3. Enter username: `admin`
4. Enter password: `Admin@123`
5. Click "Login"

### 2. Change Admin Password

**IMMEDIATELY after first login:**

1. Click your profile name in top-right corner
2. Select "Profile Settings" or "Settings"
3. Navigate to "Change Password" section
4. Enter:
   - Current Password: `Admin@123`
   - New Password: `[your-strong-password]`
   - Confirm Password: `[your-strong-password]`
5. Click "Update Password"
6. Log out and log back in with new password

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@, #, $, etc.)
- Not a common password

**Examples of Strong Passwords:**
- `Clinic@2026$Secure`
- `Eye#Admin!Password123`
- `M3d!calS3cure2026`

### 3. Update Admin Profile

1. Go to Settings → Profile
2. Update:
   - Full Name: (your actual name)
   - Email: (your work email)
   - Phone: (contact number)
3. Click "Save"

### 4. Configure Clinic Information

1. Go to Settings → Clinic Settings
2. Enter:
   - **Clinic Name:** Your Eye Clinic Name
   - **Address:** Complete clinic address
   - **City:** Your city
   - **Phone:** Clinic phone number
   - **Email:** info@yourclinic.com
   - **Working Hours:** e.g., "Mon-Sat: 9:00 AM - 6:00 PM"
3. Click "Save Settings"

---

## USER MANAGEMENT

### Understanding User Roles

The system has **4 default roles**:

| Role | Capabilities | Typical User |
|------|-------------|--------------|
| **Admin** | Full access to everything | You, IT staff |
| **Doctor** | Patient care, prescriptions, visits | Eye doctors, specialists |
| **Receptionist** | Appointments, patient registration | Front desk staff |
| **Accountant** | Billing, payments, financial reports | Billing staff |

### Creating a New User

#### Step-by-Step: Add Doctor

1. **Navigate to User Management**
   - Sidebar → "Settings"
   - Click "User Management" (or "Users" tab)
   - Click "Add New User" button

2. **Enter User Information**
   ```
   Full Name: Dr. Sarah Johnson
   Email: sarah.johnson@clinic.com
   Username: dr.sarah (or sjohnson)
   Phone: +92-300-1234567
   Password: [Auto-generated or custom]
   ```

3. **Assign Role(s)**
   - ✅ Check "Doctor"
   - You can assign multiple roles
   - Example: Check both "Doctor" and "Admin" for senior doctors

4. **Set User Status**
   - Active: User can log in immediately
   - Inactive: Account created but login disabled (use for future employees)

5. **Click "Create User"**

6. **Provide Credentials**
   - Give the new user their username and temporary password
   - Instruct them to change password on first login

#### Adding Different User Types

**Receptionist:**
```
Full Name: Ahmed Khan
Email: ahmed@clinic.com
Username: ahmed.receptionist
Role: ✅ Receptionist
Status: Active
```

**Accountant:**
```
Full Name: Fatima Ali
Email: fatima@clinic.com
Username: fatima.accounts
Role: ✅ Accountant
Status: Active
```

**Multi-Role User (Doctor who is also Admin):**
```
Full Name: Dr. Imran Malik (Head Doctor)
Email: imran@clinic.com
Username: dr.imran
Roles: ✅ Doctor, ✅ Admin
Status: Active
```

### Viewing All Users

1. Go to Settings → User Management
2. See list of all users with:
   - Name
   - Username
   - Email
   - Role(s)
   - Status (Active/Inactive)
   - Last Login
   - Actions

### Editing a User

**To Update User Information:**

1. In User Management list, find the user
2. Click "Edit" button (✏️ icon)
3. Update fields:
   - Name, email, phone
   - Add/remove roles
   - Change status
4. Click "Update User"

⚠️ **Note:** You cannot change username after creation

### Assigning Multiple Roles

**Example: Make a receptionist also handle billing**

1. Edit user "Ahmed Khan"
2. Check additional role:
   - ✅ Receptionist
   - ✅ Accountant
3. Save
4. Ahmed can now access both reception and billing features

### Deactivating a User

**When to Deactivate:**
- Employee left the clinic
- Temporary suspension
- Account compromise (security issue)

**How to Deactivate:**

1. Go to User Management
2. Find the user
3. Click "Edit"
4. Change Status to "Inactive"
5. Click "Update"

**Result:** User cannot log in, but all their data remains in system

**To Reactivate:** Change Status back to "Active"

### Deleting a User

⚠️ **WARNING:** Deletion is permanent and NOT recommended!

**Better Alternative:** Deactivate the user instead

**If you must delete:**
1. Consider data implications (visits, prescriptions created by this user)
2. Export any necessary data first
3. In User Management, click "Delete" (🗑️ icon)
4. Confirm deletion
5. User and their associations are removed

### Resetting User Password

**When Users Forget Password:**

**Method 1: Admin Reset (Current System)**

1. Go to User Management
2. Find the user
3. Click "Reset Password" button
4. System generates new temporary password
5. Provide this password to the user securely:
   - In person
   - Via secure channel (not email)
   - Phone call (verbal)
6. Instruct user to change password immediately

**Method 2: Database Reset (Advanced)**

If UI doesn't have reset function:

```bash
# Access server
ssh your-server

# Connect to database
sqlite3 /path/to/server/clinic.db

# View user
SELECT id, username, email FROM users WHERE username='username';

# Reset to default password (Admin@123)
# Note: Password must be hashed. Use application's hash function.
# Better: Use the application's API or UI
```

⚠️ **Better Solution:** Always use the application interface

---

## ROLE MANAGEMENT

### Viewing Roles

1. Sidebar → "Roles" (or "Admin" → "Role Management")
2. See all available roles:
   - **System Roles:** admin, doctor, receptionist, accountant (cannot be deleted)
   - **Custom Roles:** Any you create

### Understanding Permissions

Each role has permissions grouped by feature:

**Patients:**
- View: See patient list and details
- Create: Register new patients
- Edit: Modify patient information
- Delete: Remove patients (usually disabled)

**Clinical:**
- View: See visits, examinations
- Create: Record new visits
- Edit: Modify visit records
- Delete: Remove visit records

**Appointments:**
- View: See appointment calendar
- Create: Schedule appointments
- Edit: Reschedule appointments
- Delete: Cancel appointments
- Cancel: Specifically cancel (different from delete)

**Billing:**
- View: See invoices and payments
- Create: Create new invoices
- Edit: Modify invoices
- Delete: Delete invoices
- Reports: Access financial reports

**Admin:**
- Users: Manage user accounts
- Roles: Manage roles and permissions
- Settings: Access system settings
- Logs: View activity logs
- Export: Export system data

### Default Role Permissions

**Admin:**
- ALL permissions enabled
- Cannot be modified (system role)

**Doctor:**
- Patients: View, Create, Edit
- Clinical: View, Create, Edit
- Appointments: View, Create, Edit
- Billing: View (to see patient bills)
- Admin: None

**Receptionist:**
- Patients: View, Create, Edit
- Appointments: View, Create, Edit, Cancel
- Billing: View
- Clinical: View only (can't create visits)
- Admin: None

**Accountant:**
- Patients: View only
- Billing: View, Create, Edit, Reports
- Clinical: View only
- Appointments: View only
- Admin: None

### Creating a Custom Role

**Example: Create "Optometrist" role**

1. Go to Admin → Roles
2. Click "Create Role" button
3. Enter details:
   ```
   Role Name: optometrist
   Description: Optometrist - preliminary eye exams and refraction
   ```

4. **Set Permissions:**

   **Patients:**
   - ✅ View
   - ✅ Create
   - ✅ Edit
   - ❌ Delete

   **Clinical:**
   - ✅ View
   - ✅ Create (can record visits)
   - ❌ Edit (cannot modify others' visits)
   - ❌ Delete

   **Appointments:**
   - ✅ View
   - ✅ Create
   - ✅ Edit
   - ❌ Delete
   - ✅ Cancel

   **Billing:**
   - ✅ View (see patient bills)
   - ❌ Create, Edit, Delete, Reports

   **Admin:**
   - ❌ All (no admin access)

5. Click "Create Role"

6. **Assign to User:**
   - Go to User Management
   - Create or edit user
   - Check "Optometrist" role
   - Save

### Editing a Custom Role

**To Modify Permissions:**

1. Go to Admin → Roles
2. Find custom role (system roles cannot be edited)
3. Click "Edit"
4. Change permissions as needed
5. Click "Update"

**Changes take effect immediately** for all users with this role.

### Deleting a Custom Role

⚠️ **Warning:** Cannot delete if users are assigned to this role

**Steps:**
1. First, reassign all users with this role to different roles
2. Go to Admin → Roles
3. Click "Delete" on custom role
4. Confirm deletion

---

## SYSTEM SETTINGS

### Clinic Configuration

**Location:** Settings → Clinic Settings

**Fields to Configure:**
```
Clinic Name: [Your Clinic Name]
Address: [Full Address]
City: [City Name]
Postal Code: [Postal Code]
Phone: [+92-xxx-xxxxxxx]
Email: [info@clinic.com]
Website: [www.yourclinic.com] (optional)

Working Hours:
  Monday: 09:00 AM - 06:00 PM
  Tuesday: 09:00 AM - 06:00 PM
  Wednesday: 09:00 AM - 06:00 PM
  Thursday: 09:00 AM - 06:00 PM
  Friday: 09:00 AM - 06:00 PM
  Saturday: 09:00 AM - 04:00 PM
  Sunday: Closed

Holiday Schedule: [Eid holidays, national holidays]
```

**Save Changes**

### Appointment Settings

**Configuration:**
```
Default Appointment Duration: 30 minutes
Minimum Notice: 1 hour
Maximum Appointments Per Day: 40
Appointment Slot Interval: 15 minutes
Allow Same-Day Appointments: Yes/No
Require Patient Confirmation: Yes/No
```

### Prescription Settings

**Configuration:**
```
Doctor Signature: [Upload image]
Prescription Footer Text: [Custom text]
Auto-Print After Save: Yes/No
Include QR Code: Yes/No (future feature)
```

### Billing Settings

**Configuration:**
```
Tax/GST: [Percentage, e.g., 0% or 17%]
Currency: PKR
Receipt Footer: [Thank you message]
Payment Methods: Cash, Card, Bank Transfer, JazzCash, Easypaisa
Auto-Generate Invoice Number: Yes
Invoice Prefix: INV-
```

### Security Settings

**Configuration:**
```
Password Policy:
  Minimum Length: 8
  Require Uppercase: Yes
  Require Number: Yes
  Require Special Character: Yes

Session Timeout: 24 hours
Failed Login Attempts: 5
Account Lockout Duration: 30 minutes
```

---

## ACTIVITY MONITORING

### Viewing Activity Logs

**Purpose:** Track all user actions for security and audit

**Access:**
1. Sidebar → "Activity Logs" (or "Admin" → "Activity Logs")

**What You See:**
| Timestamp | User | Role | Action | Entity | Details |
|-----------|------|------|--------|--------|---------|
| 2026-03-16 10:30:15 | dr.sarah | Doctor | Created | Patient | PID-20260316-0001 |
| 2026-03-16 10:32:45 | ahmed | Receptionist | Updated | Appointment | APT-20260316-0012 |
| 2026-03-16 11:15:22 | admin | Admin | Created | User | dr.imran |

### Filtering Activity Logs

**Available Filters:**
1. **Date Range:**
   - Today
   - Last 7 days
   - Last 30 days
   - Custom range

2. **User:** Filter by specific user

3. **Action Type:**
   - Created
   - Updated
   - Deleted
   - Viewed
   - Login
   - Logout

4. **Entity Type:**
   - Patient
   - Visit
   - Appointment
   - Bill
   - User
   - Setting

**How to Filter:**
1. Go to Activity Logs
2. Use filter dropdowns at top
3. Click "Apply Filters"
4. View filtered results

### Exporting Activity Logs

**For Audit Purposes:**

1. Apply desired filters
2. Click "Export" button
3. Choose format:
   - CSV (for Excel)
   - PDF (for reports)
4. Download file

**Use Cases:**
- Monthly audit reports
- Compliance documentation
- Security investigations
- Performance reviews

### Monitoring User Logins

**View Last Login Times:**
1. Go to User Management
2. See "Last Login" column
3. Identify:
   - Inactive users (never logged in or not recently)
   - Unusual login patterns
   - Potential security issues

---

## DATA MANAGEMENT

### Backing Up Data

⚠️ **CRITICAL:** Regular backups prevent data loss!

**What to Backup:**
1. **Database:** All patient/clinical data
2. **Uploads:** Prescription images, test reports
3. **Configuration:** System settings

**Backup Schedule:**
- Daily: Automated (if configured)
- Weekly: Manual verification
- Monthly: Off-site/cloud backup

**Manual Backup Steps:**

**Method 1: Using Backup Script (Server Access Required)**

```bash
# SSH into server
ssh your-server

# Run backup script
cd /opt/eye-clinic
./backup.sh

# Verify backup created
ls -lh /backups/eye-clinic/
```

**Method 2: Database Export (via Application)**

1. Go to Settings → Data Management
2. Click "Export Database"
3. Choose:
   - Full Export (all data)
   - Partial Export (date range)
4. Click "Export"
5. Download file
6. Store securely (external drive, cloud)

**Method 3: Manual File Copy**

```bash
# Copy database
cp /opt/eye-clinic/server/clinic.db ~/backups/clinic_backup_$(date +%Y%m%d).db

# Copy uploads folder
tar -czf ~/backups/uploads_$(date +%Y%m%d).tar.gz /opt/eye-clinic/uploads/
```

### Restoring from Backup

⚠️ **WARNING:** Restoring replaces current data!

**Pre-Restoration Checklist:**
- [ ] Backup current database first
- [ ] Notify all users (system will be offline)
- [ ] Stop application
- [ ] Verify backup file integrity

**Restoration Steps:**

1. **Stop Application**
   ```bash
   pm2 stop eye-clinic
   ```

2. **Backup Current Database**
   ```bash
   cp /opt/eye-clinic/server/clinic.db /opt/eye-clinic/server/clinic.db.before-restore
   ```

3. **Restore Database**
   ```bash
   cp /backups/eye-clinic/clinic_20260316.db /opt/eye-clinic/server/clinic.db
   ```

4. **Restore Uploads (if needed)**
   ```bash
   tar -xzf /backups/eye-clinic/uploads_20260316.tar.gz -C /opt/eye-clinic/
   ```

5. **Restart Application**
   ```bash
   pm2 start eye-clinic
   ```

6. **Verify**
   - Login
   - Check patient data
   - Check recent records

### Exporting Data for Research

**Purpose:** Export de-identified data for research/analysis

1. Go to Reports → Research Export
2. Select data types:
   - [ ] Patient demographics
   - [ ] Visit data
   - [ ] Eye examination data
   - [ ] IOP readings
   - [ ] Prescriptions (metadata)
3. Apply filters (date range, diagnosis, age)
4. **Enable De-identification:**
   - [ ] Remove names
   - [ ] Remove contact info
   - [ ] Anonymize Patient IDs
5. Choose format: CSV, Excel, SPSS
6. Click "Generate Export"
7. Download file

---

## SECURITY & PERMISSIONS

### Security Best Practices

**1. Password Management**
- ✅ Change default admin password immediately
- ✅ Use strong, unique passwords
- ✅ Never share your password
- ✅ Change password every 90 days
- ❌ Don't write passwords down
- ❌ Don't use same password for multiple systems

**2. User Account Security**
- ✅ Deactivate accounts when employees leave
- ✅ Review user list quarterly
- ✅ Use principle of least privilege (minimum necessary permissions)
- ✅ Monitor activity logs for suspicious behavior
- ❌ Don't create shared accounts (e.g., "doctor1" used by multiple doctors)

**3. System Access**
- ✅ Use HTTPS (SSL) for web access
- ✅ Restrict server access to authorized personnel
- ✅ Keep software updated
- ✅ Use firewall
- ❌ Don't expose database to internet

**4. Data Protection**
- ✅ Regular backups (daily)
- ✅ Off-site/cloud backup (weekly)
- ✅ Test backup restoration (monthly)
- ✅ Encrypt sensitive data
- ❌ Don't store backups on same server

### Managing Permissions

**Principle of Least Privilege:**
Give users only the permissions they need.

**Examples:**

**Good:**
- Receptionist: Can schedule appointments, register patients
- Cannot: Delete clinical records, access financial reports

**Bad:**
- Receptionist: Given "Admin" role for convenience
- Problem: Can now see financial data, delete records, create users

**How to Check User Permissions:**
1. Go to User Management
2. Click "View" on user
3. See assigned roles and their permissions
4. Verify permissions match job requirements

**Audit Checklist:**
- [ ] All users have appropriate roles
- [ ] No unnecessary admin accounts
- [ ] Inactive accounts deactivated
- [ ] Former employees removed
- [ ] Shared accounts eliminated

---

## TROUBLESHOOTING

### Common Issues & Solutions

#### Issue 1: User Can't Login

**Symptoms:** "Invalid username or password"

**Solutions:**

1. **Verify Credentials:**
   - Check username (case-sensitive)
   - Check password (case-sensitive)
   - Check Caps Lock

2. **Check Account Status:**
   - Go to User Management
   - Find user
   - Verify Status = "Active"
   - If "Inactive", activate account

3. **Reset Password:**
   - Click "Reset Password"
   - Provide new temporary password to user

4. **Check Account Lockout:**
   - After 5 failed attempts, account locks for 30 minutes
   - Wait 30 minutes or manually unlock (if feature available)

#### Issue 2: User Missing Permissions

**Symptoms:** "You don't have permission to access this feature"

**Solutions:**

1. **Check User Roles:**
   - Go to User Management
   - View user's assigned roles
   - Verify role includes required permissions

2. **Modify Roles:**
   - Edit user
   - Assign additional role(s)
   - Save

3. **Check Role Permissions:**
   - Go to Role Management
   - View role's permissions
   - Ensure required permissions are enabled

#### Issue 3: Activity Logs Not Showing

**Solutions:**

1. **Check Filters:**
   - Ensure date range includes expected activities
   - Clear all filters and try again

2. **Check User Permissions:**
   - Viewing logs requires "Admin" role
   - Verify you have admin access

3. **Database Issue:**
   - Contact system administrator
   - Check server logs

#### Issue 4: Can't Delete User

**Symptoms:** "Cannot delete user: has associated records"

**Solution:**
- **Don't delete**, instead **deactivate**
- Deletion is prevented if user created patients, visits, etc.
- Deactivating preserves data integrity

#### Issue 5: System Running Slow

**Solutions:**

1. **Check Server Resources:**
   - Contact system administrator
   - May need more RAM/CPU

2. **Database Maintenance:**
   - Run database optimization (VACUUM)
   - Archive old data

3. **Clear Browser Cache:**
   - Browser settings → Clear cache
   - Refresh page

---

## BEST PRACTICES

### Daily Tasks

**As Administrator:**
- [ ] Check system status (login works)
- [ ] Review overnight activity logs
- [ ] Monitor user login issues
- [ ] Respond to user permission requests

### Weekly Tasks

- [ ] Review new user accounts created
- [ ] Check backup completion
- [ ] Review activity logs for unusual patterns
- [ ] Verify system health

### Monthly Tasks

- [ ] User account audit (active vs inactive)
- [ ] Review role assignments
- [ ] Database optimization (VACUUM)
- [ ] Test backup restoration
- [ ] Review security settings
- [ ] Update documentation

### Quarterly Tasks

- [ ] Comprehensive security audit
- [ ] User permission review
- [ ] Training for new features
- [ ] Review and update clinic settings
- [ ] Archive old data (if applicable)

### Annual Tasks

- [ ] Full system backup
- [ ] Disaster recovery test
- [ ] Password policy review
- [ ] User training refresh
- [ ] System upgrade planning

### User Onboarding Checklist

**When Adding New Employee:**

1. [ ] Collect employee information
   - Full name
   - Email address
   - Phone number
   - Job role

2. [ ] Create user account
   - Choose appropriate username
   - Generate strong password
   - Assign correct role(s)
   - Set status to "Active"

3. [ ] Provide credentials securely
   - In person or via phone (not email)
   - Instruct to change password immediately

4. [ ] Provide training
   - System basics
   - Their specific role functions
   - Security guidelines

5. [ ] Verify access
   - Have them login
   - Test key functions
   - Answer questions

### User Offboarding Checklist

**When Employee Leaves:**

1. [ ] Deactivate account immediately
   - Change status to "Inactive"
   - Don't delete (preserves data integrity)

2. [ ] Revoke all access
   - Verify cannot login
   - Remove from any shared accounts

3. [ ] Document handover
   - Note any patients/cases in progress
   - Transfer responsibilities

4. [ ] Audit activity
   - Review their recent actions
   - Check for any irregularities

5. [ ] Update records
   - Mark as "Former Employee" in notes
   - Archive if needed

---

## QUICK REFERENCE

### Admin Keyboard Shortcuts

*Note: Keyboard shortcuts will be implemented in future versions*

**Planned Shortcuts:**
- `Ctrl + K`: Global search
- `Ctrl + S`: Save current form
- `Ctrl + P`: Print current view
- `Alt + U`: User management
- `Alt + R`: Role management
- `Alt + L`: Activity logs

### Common Admin URLs

```
Dashboard: /dashboard
User Management: /settings/users (or /admin/users)
Role Management: /admin/roles
Activity Logs: /admin/activity-logs
System Settings: /settings
Reports: /reports
```

### Support Contacts

**Technical Issues:**
- System Administrator: [admin@clinic.com]
- Server: [Contact server provider]

**User Issues:**
- Training: [Provide training contact]
- Password Resets: [Admin phone/email]

---

## CONCLUSION

As an administrator, you are responsible for the security, integrity, and smooth operation of the Eye Clinic Management System.

**Remember:**
- ✅ Security first - protect patient data
- ✅ Regular backups - prevent data loss
- ✅ Monitor activity - catch issues early
- ✅ Least privilege - only necessary permissions
- ✅ Document changes - maintain audit trail

**Questions?**
- Review this manual
- Check system documentation
- Contact technical support

---

**Administrator Manual Version:** 1.0
**Last Updated:** March 16, 2026
**System Version:** 3.1.0

**Thank you for maintaining the security and integrity of the Eye Clinic Management System!**
