# Eye Clinic Management System - User Manual

**Version:** 3.1.0
**For:** All Users (Doctors, Receptionists, Accountants)
**Last Updated:** March 16, 2026

---

## QUICK START GUIDE

### Logging In

1. Open your web browser (Chrome, Firefox, Edge)
2. Go to your clinic's URL: `https://your-clinic.com`
3. Enter your **Username** and **Password**
4. Click **Login**

**First Time Login?**
- Your admin will provide your credentials
- Change your password immediately:
  - Click your name (top-right)
  - Select "Profile" or "Settings"
  - Change Password
  - Save

---

## NAVIGATION

### Sidebar Menu

**Main Navigation (Left Side):**

| Icon | Menu Item | Purpose |
|------|-----------|---------|
| 📊 | Dashboard | Overview & quick stats |
| 👥 | Patients | Manage patient records |
| 📅 | Appointments | Schedule & view appointments |
| 📋 | Visits | Record clinical consultations |
| 💵 | Billing | Create invoices & payments |
| 📈 | Reports | Financial reports |
| 🛡️ | Roles | Role management (admin) |
| 📜 | Activity Logs | System audit trail (admin) |
| ⚙️ | Settings | System configuration |

### Top Bar

- **Search** (🔍): Quick search patients, visits
- **Notifications** (🔔): Alerts and reminders
- **Profile**: Your name → Settings, Logout

---

## DASHBOARD

### What You See

**Statistics Cards:**
- Total Patients: All registered patients
- Today's Appointments: Scheduled for today
- Pending Bills: Unpaid invoices
- Monthly Revenue: Current month earnings

**Quick Actions:**
- ➕ Add New Patient
- 📅 Schedule Appointment
- 📋 Record Visit

**Recent Activity:**
- Latest patients
- Recent appointments
- Today's schedule

---

## PATIENT MANAGEMENT

### Viewing Patient List

1. Click **Patients** in sidebar
2. See all registered patients

**Patient Table Columns:**
- Patient ID (e.g., PID-20260316-0001)
- Name
- Age / Gender
- Phone
- Registration Date
- Actions (View, Edit)

### Searching Patients

**Search Box (Top):**
- Type patient name, ID, or phone number
- Results filter automatically

**Examples:**
- Search: "Ahmad" → Shows all patients named Ahmad
- Search: "0300" → Shows patients with this phone number
- Search: "PID-2026" → Shows patients from 2026

### Registering New Patient

1. Click **"Add New Patient"** button
2. Fill required fields (marked with *)

**Personal Information:**
```
First Name*: Ahmad
Last Name*: Khan
Date of Birth*: 1990-05-15 (use date picker)
Gender*: Male (dropdown)
Phone*: +92-300-1234567 or 03001234567
Email: ahmad@email.com (optional)
```

**Address Details:**
```
Address: House 123, Street 45, F-10/4
City: Islamabad
Postal Code: 44000
```

**Emergency Contact:**
```
Contact Name: Fatima Khan
Contact Phone: 0301-2345678
```

**Medical History:**
```
Known Allergies: Penicillin, Dust
Current Medications: None
☐ Diabetes (check if yes)
☐ Hypertension (check if yes)
Other Conditions: [text area]
```

3. Click **"Save Patient"**

**Patient ID Auto-Generated:**
- Format: PID-YYYYMMDD-0001
- Example: PID-20260316-0015 (15th patient on March 16, 2026)

### Viewing Patient Details

1. In patient list, click **"View"** or patient name
2. See patient information:
   - Personal details
   - Medical history
   - Contact information

**Patient Detail Tabs** (when fully implemented):
- Overview: Basic info
- Visits: All consultations
- Prescriptions: Medication & spectacles
- Tests: Lab results, images
- Appointments: Scheduled visits
- Billing: Invoices & payments

### Editing Patient Information

1. Click **"Edit"** button
2. Modify any field
3. Click **"Update Patient"**

**Note:** Cannot change Patient ID after creation

---

## APPOINTMENTS

### Viewing Appointments

1. Click **Appointments** in sidebar
2. See appointment list

**Appointment Table:**
- Appointment Number (APT-YYYYMMDD-0001)
- Date & Time
- Patient Name
- Type (New, Follow-up, Emergency)
- Doctor
- Status (Scheduled, Confirmed, Completed, Cancelled)

### Scheduling New Appointment

1. Click **"New Appointment"** button
2. Fill form:

```
Patient*: [Search and select patient]
   - Start typing patient name
   - Select from dropdown

Date*: [Select date] (cannot be in past)
Time*: [Select time slot] (e.g., 10:30 AM)
Duration: 30 minutes (default)

Appointment Type*:
   - New Patient Consultation
   - Follow-up Visit
   - Routine Check-up
   - Emergency
   - Post-operative Review

Assigned Doctor*: [Select doctor]

Reason for Visit:
   [Patient's chief complaint]

Notes: [Internal notes, optional]
```

3. Click **"Save Appointment"**

**Confirmation:**
- Appointment number generated
- Confirmation message appears
- Option to print appointment slip

### Appointment Status

**Status Flow:**
```
Scheduled → Confirmed → In Progress → Completed
    ↓           ↓            ↓
Cancelled   No-show      Cancelled
```

**Changing Status:**
1. Click appointment
2. Select new status from dropdown
3. For cancellation: Enter reason
4. Save

**Status Meanings:**
- **Scheduled:** Appointment booked
- **Confirmed:** Patient confirmed (by phone/SMS)
- **In Progress:** Patient arrived, consultation ongoing
- **Completed:** Visit finished
- **Cancelled:** Appointment cancelled
- **No-show:** Patient didn't arrive

---

## VISIT & CLINICAL DATA

### Recording a Visit

**From Patient Detail:**
1. Open patient record
2. Click **"New Visit"** button

**From Visits Page:**
1. Click **Visits** in sidebar
2. Click **"New Visit"** button
3. Select patient

### Visit Form Sections

#### Section 1: Visit Information

```
Visit Number: VIS-YYYYMMDD-0001 (auto-generated)
Patient: [Auto-filled or selected]
Visit Date: [Today, editable]
Visit Time: [Current time, editable]

Visit Type*:
   - New Consultation
   - Follow-up
   - Emergency
   - Routine Check-up
   - Post-operative

Chief Complaint*:
   [Patient's main issue in their own words]
   Example: "Blurred vision in right eye for 2 weeks"
```

#### Section 2: Eye Examination

**Visual Acuity:**
```
Right Eye (OD):
   Distance Vision: 6/6 (dropdown: 6/6, 6/9, 6/12...)
   Near Vision: N6 (dropdown: N6, N8, N10...)

Left Eye (OS):
   Distance Vision: 6/9
   Near Vision: N8
```

**Refraction** (Spectacle Power):
```
Right Eye (OD):
   Sphere: -2.50 (range: -20.00 to +20.00)
   Cylinder: -1.00 (range: -10.00 to +10.00)
   Axis: 90 (0 to 180 degrees)
   Add (Reading): +2.00 (for presbyopia)

Left Eye (OS):
   Sphere: -3.00
   Cylinder: -0.75
   Axis: 85
   Add: +2.00
```

**Intraocular Pressure (IOP):**
```
Right Eye (OD): 18 mmHg
Left Eye (OS): 17 mmHg
Method: Goldman (dropdown)

Normal Range: 10-21 mmHg
⚠️ Alert if > 21 mmHg (high pressure warning)
```

**Other Examinations:**
```
Pupil Response:
   OD: PERRLA (Pupils Equal, Round, Reactive to Light)
   OS: PERRLA

Color Vision:
   Result: Normal / Defective
   Test Used: Ishihara

Additional Notes:
   [Slit lamp findings, fundus examination, etc.]
```

#### Section 3: Diagnosis

```
Primary Diagnosis*:
   [Quick select common diagnoses or type custom]
   - Myopia
   - Hyperopia
   - Astigmatism
   - Presbyopia
   - Cataract
   - Glaucoma
   - Diabetic Retinopathy
   - Dry Eye Syndrome
   - Conjunctivitis
   - Custom: [free text]

ICD-10 Code: [Optional, autocomplete]

Secondary Diagnosis:
   [Additional diagnoses if any]
```

#### Section 4: Clinical Notes

```
Doctor's Notes:
   [Private notes for medical record]

Patient Instructions:
   [Instructions given to patient]
   Example: "Use prescribed eye drops 3 times daily. 
            Avoid screen time > 2 hours. Return in 2 weeks."
```

### Save Options

- **Save Visit**: Save and continue editing
- **Save & Print**: Save and open print preview
- **Save & Prescribe**: Save and create prescription
- **Save & Order Tests**: Save and recommend tests
- **Cancel**: Discard changes

---

## PRESCRIPTIONS

*Note: Full prescription module to be completed*

### Types of Prescriptions

1. **Medication Prescription**: Eye drops, tablets
2. **Spectacle Prescription**: Glasses/lenses
3. **Both**: Medication + Spectacles

### Creating Prescription

1. From visit: Click **"Save & Prescribe"**
2. Or from patient detail: **"New Prescription"**

**Prescription Number:** RX-YYYYMMDD-0001 (auto-generated)

---

## BILLING

### Viewing Bills

1. Click **Billing** in sidebar
2. See invoice list

**Invoice Table:**
- Invoice Number
- Date
- Patient
- Total Amount
- Amount Paid
- Balance
- Status (Paid, Partial, Unpaid)

### Creating Invoice

1. Click **"New Invoice"**
2. Select patient
3. Add services/items
4. Enter amounts
5. Select payment method
6. Save

---

## REPORTS

### Financial Reports

1. Click **Reports** in sidebar
2. See summary cards:
   - **Total Billed**: All invoices
   - **Total Collected**: Payments received
   - **Outstanding**: Unpaid balances

### Date Range

- Select "From" and "To" dates
- Click **"Generate Report"**
- View updated statistics

---

## ROLE-SPECIFIC FEATURES

### For Doctors

**You Can:**
- ✅ View all patients
- ✅ Register new patients
- ✅ Record visits and examinations
- ✅ Create prescriptions
- ✅ Schedule appointments
- ✅ View billing (patient bills)

**You Cannot:**
- ❌ Manage users
- ❌ Access activity logs
- ❌ Change system settings
- ❌ Delete records

### For Receptionists

**You Can:**
- ✅ Register patients
- ✅ Schedule/manage appointments
- ✅ View patient information
- ✅ View visit records (read-only)
- ✅ View bills

**You Cannot:**
- ❌ Record clinical visits
- ❌ Create prescriptions
- ❌ Create/edit invoices
- ❌ Access admin features

### For Accountants

**You Can:**
- ✅ Create invoices
- ✅ Record payments
- ✅ View all billing records
- ✅ Generate financial reports
- ✅ View patient information (for billing)

**You Cannot:**
- ❌ Record clinical visits
- ❌ Create prescriptions
- ❌ Schedule appointments
- ❌ Access admin features

---

## SEARCH FUNCTIONALITY

### Global Search

**Access:**
- Click search icon (🔍) in top bar
- **Keyboard Shortcut** (future): Ctrl+K or Cmd+K

**What You Can Search:**
- Patients (by name, ID, phone)
- Visits
- Appointments
- Prescriptions

**How to Search:**
1. Type at least 2 characters
2. Results appear automatically
3. Categorized by type (Patients, Visits, etc.)
4. Click result to open

---

## TIPS & BEST PRACTICES

### General

- ✅ **Save Frequently**: Click Save regularly
- ✅ **Log Out**: Always log out when done
- ✅ **Strong Passwords**: Use secure passwords
- ✅ **Verify Data**: Double-check patient info before saving
- ❌ **Don't Share Passwords**: Keep credentials private

### Patient Registration

- ✅ Use complete names (First + Last)
- ✅ Verify phone numbers (patient may provide multiple)
- ✅ Ask about allergies
- ✅ Record emergency contact
- ✅ Check for duplicate patients before creating new

### Visit Recording

- ✅ Record chief complaint in patient's words
- ✅ Be specific in diagnosis
- ✅ Document all examination findings
- ✅ Provide clear patient instructions
- ✅ Note follow-up date

### Appointments

- ✅ Confirm appointments with patients
- ✅ Call if appointment changed
- ✅ Mark no-shows appropriately
- ✅ Block time for lunch/breaks
- ✅ Allow buffer time between appointments

### Billing

- ✅ Create invoice immediately after service
- ✅ Specify payment method
- ✅ Print/provide receipt
- ✅ Record partial payments accurately

---

## COMMON QUESTIONS

**Q: I forgot my password. What do I do?**
A: Contact your administrator to reset your password.

**Q: Can I change patient information after saving?**
A: Yes, click Edit on the patient record. Cannot change Patient ID.

**Q: How do I search for a patient?**
A: Use the search box at the top of the patient list. Type name, ID, or phone.

**Q: Can I delete a visit record?**
A: No, for data integrity. Contact admin if critical error.

**Q: How do I print prescriptions?**
A: After creating prescription, click "Save & Print" or "Print" button.

**Q: What if appointment time conflicts?**
A: System shows warning. Choose different time or override (with reason).

**Q: How do I mark appointment as completed?**
A: Open appointment, change status to "Completed", save.

**Q: Can I see another doctor's patients?**
A: Yes, if you have doctor role. All doctors can view all patients.

**Q: How do I generate reports?**
A: Go to Reports → Select date range → Click Generate.

**Q: What does IOP alert mean?**
A: IOP > 21 mmHg is high (glaucoma risk). Requires monitoring.

---

## KEYBOARD SHORTCUTS

*Note: To be implemented*

**Planned Shortcuts:**
- `Ctrl + K`: Global search
- `Ctrl + S`: Save current form
- `Ctrl + P`: Print
- `Ctrl + N`: New patient (on patients page)
- `Tab`: Navigate form fields
- `Enter`: Submit form
- `Esc`: Close modals

---

## GETTING HELP

**Technical Issues:**
- Cannot login → Contact admin
- Error messages → Screenshot and report to admin
- System slow → Check internet, contact admin

**Training:**
- Review this manual
- Ask experienced colleagues
- Request training from admin

**Feature Requests:**
- Suggest improvements to admin
- Document workflow issues

---

## GLOSSARY

**OD**: Oculus Dexter (Right Eye)
**OS**: Oculus Sinister (Left Eye)
**OU**: Oculus Uterque (Both Eyes)
**IOP**: Intraocular Pressure (eye pressure)
**VA**: Visual Acuity (how well you can see)
**Sph**: Sphere (spherical lens power)
**Cyl**: Cylinder (cylindrical lens power for astigmatism)
**Axis**: Orientation of cylindrical lens (0-180°)
**Add**: Addition (reading power for bifocals/progressives)
**PERRLA**: Pupils Equal, Round, Reactive to Light and Accommodation
**ICD-10**: International Classification of Diseases, 10th Revision

---

**User Manual Version:** 1.0
**Last Updated:** March 16, 2026
**System Version:** 3.1.0

**Thank you for using the Eye Clinic Management System!**
