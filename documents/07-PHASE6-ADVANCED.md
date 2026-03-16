# Phase 6: Advanced Features - Search, Billing, Reports & Polish

## Objective
Complete the system with advanced search, billing/payment tracking, comprehensive reports, user role management, and final polishing touches.

---

## Features to Implement

### A. Advanced Search System

#### Global Search

**Search Bar** (top navigation):
- Prominent search icon
- Keyboard shortcut: `Ctrl + K` or `Cmd + K`
- Placeholder: "Search patients, visits, prescriptions..."

**Search Modal**:
Opens overlay with search input and results

**Search Scope Tabs**:
- All
- Patients
- Visits
- Appointments
- Prescriptions
- Test Reports

**Search Capabilities**:

**Patient Search**:
- Name (partial match, case-insensitive)
- Patient ID (exact or partial)
- Phone number (any format)
- Email
- Address
- Registration date range

**Visit Search**:
- Visit number
- Diagnosis keywords
- Date range
- Doctor name
- Visit type

**Prescription Search**:
- Prescription number
- Medicine name
- Date range

**Appointment Search**:
- Appointment number
- Date range
- Status

**Search Results Display**:
```
┌─ Search Results for "john" ────────────────┐
│                                            │
│ PATIENTS (3)                               │
│ ● John Doe - PID-20250101-0123             │
│   Age: 45, Phone: 0300-1234567             │
│                                            │
│ ● Johnson Smith - PID-20250215-0045        │
│   Age: 52, Phone: 0301-2345678             │
│                                            │
│ VISITS (5)                                 │
│ ● John Doe - VIS-20260315-0001             │
│   Mar 15, 2026 - Myopia progression        │
│                                            │
│ APPOINTMENTS (2)                           │
│ ● John Doe - APT-20260320-0012             │
│   Mar 20, 2026 10:30 AM - Follow-up        │
│                                            │
│ [View All Results →]                       │
└────────────────────────────────────────────┘
```

**Keyboard Navigation**:
- Arrow keys: Navigate results
- Enter: Open selected result
- Esc: Close search modal

---

#### Advanced Filters

**Patients Page - Advanced Filter Panel**:

**Filter Criteria**:
- Name/ID search
- Age range (from/to)
- Gender (multi-select)
- Registration date range
- Has active prescriptions (yes/no)
- Has upcoming appointments (yes/no)
- Last visit date range
- Diagnosis (multi-select common diagnoses)
- Custom field filters (dynamic)

**Apply Filters Button**: Refreshes list
**Clear All Filters Button**: Resets
**Save Filter Preset**: Save commonly used filter combinations

**Filter Presets**:
- New patients this month
- Active glaucoma patients
- Diabetic patients needing screening
- Patients with appointments today
- Patients with pending payments

---

### B. Billing & Payment System

#### Billing Overview

**Patient Detail → Billing Tab**:

**Summary Cards**:
- Total Billed: PKR 15,000
- Total Paid: PKR 10,000
- Outstanding: PKR 5,000
- Last Payment: Mar 10, 2026

**Billing History Table**:
| Invoice # | Date | Services | Amount | Paid | Balance | Status | Actions |
|-----------|------|----------|--------|------|---------|--------|---------|
| INV-001   | Mar 15| Consult  | 2,000  | 2,000| 0       | ✓ Paid | View/Print |
| INV-002   | Feb 10| Consult + Tests | 8,000 | 5,000 | 3,000 | Partial| View/Pay |

---

#### Create Invoice

**Access Points**:
1. From visit detail: "Create Invoice" button
2. From patient billing tab: "New Invoice" button
3. From billing page: "Create Invoice"

**Invoice Form**:

**Header**:
- Invoice Number: `INV-YYYYMMDD-####` (auto-generated)
- Invoice Date: (default today)
- Due Date: (default today + 30 days)
- Patient: (auto-selected or search)
- Visit: (dropdown, optional link to visit)

**Line Items** (add multiple):

| Service/Item | Description | Quantity | Unit Price | Total |
|--------------|-------------|----------|------------|-------|
| (dropdown)   | (text)      | (number) | (PKR)      | (calc)|

**Common Services** (quick add):
- Consultation Fee (default: PKR 2,000)
- Follow-up Visit (default: PKR 1,500)
- Eye Examination (default: PKR 1,000)
- Visual Field Test (default: PKR 3,000)
- OCT Scan (default: PKR 5,000)
- A-Scan (default: PKR 2,500)
- Contact Lens Fitting (default: PKR 1,500)
- Custom

**Charges Summary**:
- Subtotal: (auto-calculated)
- Tax/GST (if applicable): (percentage field)
- Discount: (amount or percentage)
- **Total Amount**: (bold, large)

**Payment Section** (optional, can be done later):
- Amount Paid Now: (number input)
- Payment Method: (dropdown)
  - Cash
  - Card (Debit/Credit)
  - Bank Transfer
  - UPI/JazzCash/EasyPaisa
  - Insurance
  - Other
- Payment Date: (default today)
- Payment Notes: (text area)

**Save Options**:
- **Save Invoice**: Creates invoice (unpaid or partial)
- **Save & Mark Paid**: Creates and marks as fully paid
- **Save & Print**: Creates and opens print preview
- **Save & Email**: (future) Email invoice to patient
- **Cancel**: Discard

---

#### Record Payment

**For Existing Invoices**:

**Payment Form** (from billing tab or invoice detail):
- Invoice Number: (read-only)
- Total Amount: (read-only)
- Amount Already Paid: (read-only)
- Balance Due: (read-only, highlighted)
- **Amount Paying Now**: (input, validate <= balance)
- Payment Method: (dropdown)
- Payment Date: (date picker, default today)
- Reference/Transaction ID: (text input, optional)
- Notes: (text area)

**Save Payment**:
- Updates invoice balance
- Records payment in payment history
- Updates payment status (Paid/Partial/Unpaid)
- Generates receipt

**Multiple Payment Support**:
- Invoice can have multiple payment records
- Payment history shows all payments for an invoice

---

#### Invoice & Receipt Printing

**Invoice Print Layout**:
```
┌─────────────────────────────────────────────────────┐
│ [Clinic Logo]           INVOICE                     │
│                                                     │
│ Clinic Name                                         │
│ Address, City, Postal Code                          │
│ Phone: +92-51-1234567                               │
│ Email: info@eyeclinic.com                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Invoice #: INV-20260315-0001                        │
│ Invoice Date: March 15, 2026                        │
│ Due Date: April 14, 2026                            │
│                                                     │
│ Bill To:                                            │
│ Patient Name: John Doe                              │
│ Patient ID: PID-20250101-0123                       │
│ Phone: 0300-1234567                                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Description            Qty    Rate     Amount (PKR) │
├─────────────────────────────────────────────────────┤
│ Consultation Fee        1    2,000.00    2,000.00  │
│ Visual Field Test       1    3,000.00    3,000.00  │
│ OCT Scan                1    5,000.00    5,000.00  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                               Subtotal:  10,000.00  │
│                               Discount:       0.00  │
│                               Tax (if any):   0.00  │
│                               ──────────────────── │
│                               TOTAL:     10,000.00  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Payment Information:                                │
│ Amount Paid:     5,000.00                           │
│ Payment Method:  Cash                               │
│ Payment Date:    March 15, 2026                     │
│                                                     │
│ Balance Due:     5,000.00                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Terms & Conditions:                                 │
│ • Payment due within 30 days                        │
│ • Please bring this invoice for reference           │
│                                                     │
│ Thank you for choosing our services!                │
└─────────────────────────────────────────────────────┘
```

**Receipt Print Layout** (after payment):
Similar to invoice, but:
- Title: "PAYMENT RECEIPT"
- Shows amount paid prominently
- References original invoice
- Receipt number: `RCP-YYYYMMDD-####`

---

#### Billing Reports

**Billing → Reports**:

**Financial Summary**:
- Date range selector
- Total revenue
- Total collected
- Outstanding amount
- Revenue by service type (pie chart)
- Revenue trend (line chart)

**Payment Analytics**:
- Payment methods breakdown
- Average transaction value
- Collection rate (%)
- Outstanding invoices list

**Export Options**:
- Export to CSV/Excel
- Print financial report
- Generate tax report (if needed)

---

### C. User Role Management (Enhanced)

#### Role-Based Permissions Matrix

**Settings → Roles & Permissions** (Admin only):

**Permission Categories**:

1. **Patient Management**:
   - [ ] View patients
   - [ ] Create patients
   - [ ] Edit patients
   - [ ] Delete patients
   - [ ] View patient medical history

2. **Clinical Data**:
   - [ ] View visits
   - [ ] Create visits
   - [ ] Edit visits
   - [ ] Delete visits
   - [ ] View prescriptions
   - [ ] Create prescriptions
   - [ ] View test results

3. **Appointments**:
   - [ ] View appointments
   - [ ] Create appointments
   - [ ] Edit appointments
   - [ ] Cancel appointments
   - [ ] View all doctors' appointments

4. **Billing**:
   - [ ] View billing
   - [ ] Create invoices
   - [ ] Record payments
   - [ ] Edit invoices
   - [ ] Delete invoices
   - [ ] View financial reports

5. **Administration**:
   - [ ] Manage users
   - [ ] Manage roles
   - [ ] Manage settings
   - [ ] View audit logs
   - [ ] Export data

**Default Role Configurations**:

**Admin** (all permissions):
- Full system access
- User management
- System configuration

**Doctor**:
- ✓ All patient management
- ✓ All clinical data
- ✓ View/Create appointments
- ✓ View billing
- ✗ Edit billing
- ✗ User management

**Receptionist**:
- ✓ View/Create patients
- ✓ View visits (read-only)
- ✓ All appointment management
- ✗ Create/edit clinical data
- ✓ View billing
- ✗ User management

**Accountant**:
- ✓ View patients (basic info)
- ✓ View visits (for billing context)
- ✗ Edit clinical data
- ✓ View appointments
- ✓ All billing functions
- ✗ User management

**Custom Roles**:
- Create new role
- Name role
- Select specific permissions
- Assign to users

---

#### User Activity Logs (Audit Trail)

**Settings → Activity Logs** (Admin only):

**Log Entry Fields**:
- Timestamp
- User (name, role)
- Action (Created, Updated, Deleted, Viewed)
- Entity Type (Patient, Visit, Prescription, etc.)
- Entity ID
- Changes Made (if edit)
- IP Address
- Device/Browser

**Log Filters**:
- Date range
- User
- Action type
- Entity type

**Log Table**:
| Time | User | Action | Entity | Details |
|------|------|--------|--------|---------|
| 10:30| Dr. Smith | Created | Visit | VIS-001 for Patient PID-123 |
| 10:25| Receptionist | Updated | Patient | Changed phone for PID-456 |

**Export Logs**:
- Export to CSV
- Required for compliance/audits

---

### D. System Settings & Configuration

**Settings Page** (Admin only):

**Tabs**:
1. General Settings
2. Clinic Information
3. Roles & Permissions
4. Custom Fields
5. Billing Configuration
6. Backup & Data
7. Activity Logs

---

#### General Settings

**Application Settings**:
- Clinic Name: (text input)
- Currency: (dropdown: PKR, USD, EUR, etc.)
- Date Format: (dropdown: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- Time Format: (12-hour / 24-hour)
- Default Language: (English - expandable later)
- Timezone: (dropdown)

**Clinic Hours**:
- Opening Time: (time picker)
- Closing Time: (time picker)
- Days Open: (checkboxes: Mon-Sun)
- Holiday Calendar: (date picker for holidays)

**Appointment Settings**:
- Default appointment duration: (dropdown: 15/30/45/60 min)
- Max appointments per day: (number)
- Allow same-day appointments: (yes/no)
- Appointment reminder timing: (1 day / 2 hours)

---

#### Clinic Information

**Contact Details**:
- Clinic Name: (text)
- Address Line 1: (text)
- Address Line 2: (text)
- City: (text)
- Postal Code: (text)
- Phone: (text)
- Email: (text)
- Website: (text, optional)

**Doctor Information**:
- List of doctors
- For each doctor:
  - Name
  - Qualifications
  - Registration Number
  - Signature (image upload for prescriptions)
  - Active/Inactive status

**Clinic Logo**:
- Upload logo (for invoices, prescriptions, reports)
- Recommended size: 200x200 px
- Formats: PNG, JPG

---

#### Billing Configuration

**Default Prices**:
- Consultation Fee: (amount)
- Follow-up Fee: (amount)
- Eye Examination: (amount)
- Common test prices (editable list)

**Tax Settings**:
- Enable tax: (yes/no)
- Tax name: (e.g., GST, VAT)
- Tax rate: (percentage)

**Invoice Settings**:
- Invoice prefix: (e.g., INV-)
- Invoice numbering: (start from)
- Invoice terms: (text area - shown on invoice)
- Payment terms: (text - e.g., "Due in 30 days")

---

#### Backup & Data Management

**Database Backup**:
- **Manual Backup**:
  - Button: "Backup Now"
  - Downloads: clinic-db-YYYYMMDD-HHMMSS.sqlite
  
- **Automatic Backup**:
  - [ ] Enable automatic daily backups
  - Backup time: (time picker)
  - Backup location: /backups/ (read-only)
  - Keep last N backups: (number, default: 30)

**Restore Database**:
- Upload backup file
- Confirmation warning: "This will replace current data"
- Restore button (admin password required)

**Export All Data**:
- Button: "Export Complete System Data"
- Creates ZIP with:
  - Database (SQLite file)
  - All uploaded files
  - Configuration files
- Use for migration or complete backup

---

### E. Dashboard Enhancements

#### Enhanced Dashboard Widgets

**Today's Summary** (row of cards):
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Patients   │ Appointments │  Completed   │   Revenue    │
│              │              │              │              │
│      12      │      8       │      5       │  PKR 25,000  │
│  +2 from ytd │  -1 from ytd │   3 pending  │  +PKR 5,000  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Charts**:
- **Patients Registered**: Line chart (last 30 days)
- **Visits per Day**: Bar chart (last 7 days)
- **Revenue Trend**: Line chart (last 30 days)
- **Diagnosis Breakdown**: Pie chart (current month)

**Quick Access**:
- **Recent Patients**: Last 5 registered
- **Today's Appointments**: List with status
- **Pending Payments**: Top 5 outstanding invoices
- **Upcoming Tasks**: Tests to review, follow-ups needed

**Upcoming Appointments** (calendar mini-view):
- Next 7 days
- Click date to see appointments
- Visual indicators for busy days

---

### F. Data Import/Export

#### Import Patients (Bulk)

**Tools → Import Data**:

**Import Wizard**:
1. **Select Import Type**: Patients / Visits / Appointments
2. **Upload CSV/Excel file**
3. **Map Columns**: 
   - Match CSV columns to database fields
   - Preview mapping
4. **Validation**:
   - Check for errors (missing required fields, invalid formats)
   - Show validation results
5. **Import**:
   - Import valid records
   - Show summary: X imported, Y failed
   - Download failed records CSV

**CSV Template Download**:
- Button: "Download Sample CSV"
- Provides template with correct columns

---

#### Export Data

**Tools → Export Data**:

**Export Options**:
- **Entity Type**: Patients / Visits / Examinations / Appointments / Billing
- **Date Range**: From/To
- **Filters**: (entity-specific)
- **Format**: CSV / Excel / PDF
- **Include**: (checkboxes for fields to include)

**Generate Export**:
- Shows progress
- Download button when ready

---

## Technical Implementation

### Backend Routes

```javascript
// Search
GET    /api/search?q=...&type=...

// Advanced filters
POST   /api/patients/filter
POST   /api/visits/filter

// Billing
GET    /api/billing
POST   /api/billing/invoices
GET    /api/billing/invoices/:id
PUT    /api/billing/invoices/:id
DELETE /api/billing/invoices/:id
POST   /api/billing/invoices/:id/payments
GET    /api/billing/reports

// Settings
GET    /api/settings
PUT    /api/settings/:category
POST   /api/settings/backup
POST   /api/settings/restore

// Activity logs
GET    /api/activity-logs

// Roles & permissions
GET    /api/roles/:roleId/permissions
PUT    /api/roles/:roleId/permissions

// Import/Export
POST   /api/import/:entityType
POST   /api/export/:entityType
```

---

## Testing Checklist

- [ ] Global search works across all entities
- [ ] Advanced filters apply correctly
- [ ] Filter presets save and load
- [ ] Can create invoices with multiple line items
- [ ] Invoice calculations are accurate (subtotal, tax, discount, total)
- [ ] Can record payments against invoices
- [ ] Payment updates invoice status correctly
- [ ] Invoices print professionally
- [ ] Receipts generate after payment
- [ ] Billing reports calculate correctly
- [ ] Role permissions matrix displays
- [ ] Custom role creation works
- [ ] Permission enforcement works throughout app
- [ ] Activity logs record all actions
- [ ] Can filter and export activity logs
- [ ] All settings save and load correctly
- [ ] Clinic logo uploads and displays
- [ ] Manual database backup works
- [ ] Can import patients from CSV
- [ ] Column mapping works in import wizard
- [ ] Data export includes all selected fields
- [ ] Dashboard widgets display correct data
- [ ] Charts render and are interactive

---

## Success Criteria

Phase 6 is complete when:
- ✅ Global search finds results across all entities
- ✅ Advanced filters work for all entity types
- ✅ Billing system creates invoices and records payments
- ✅ Invoice and receipt printing works professionally
- ✅ Role-based permissions enforce access control
- ✅ Activity logs track all user actions
- ✅ Settings page allows complete system configuration
- ✅ Database backup and restore works
- ✅ Data import wizard handles bulk patient uploads
- ✅ Data export generates correct formats
- ✅ Dashboard provides useful overview and quick access
- ✅ All reports calculate correctly

**System is now production-ready for deployment!**
