# Phase 1: Foundation & Patient Registration

## Objective
Build the core application structure, authentication system, and basic patient registration functionality.

---

## What to Build

### 1. Project Structure
```
eye-clinic-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Main pages
│   │   ├── contexts/     # Auth & app contexts
│   │   ├── utils/        # Helper functions
│   │   ├── api/          # API calls
│   │   └── App.jsx
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   ├── models/       # Database queries
│   │   └── server.js
│   └── package.json
├── database/
│   └── clinic.db         # SQLite database (auto-generated)
└── uploads/              # File upload directory
```

---

## Features to Implement

### A. Authentication & User Management

#### Login Page
- Clean, professional medical UI
- Username/email and password fields
- "Remember me" checkbox
- Error handling
- Redirect to dashboard after login

#### User Dashboard Layout
- **Header**: 
  - Clinic logo/name
  - User profile dropdown (name, role badges, logout)
  - Current date/time
- **Sidebar Navigation**:
  - Dashboard (home)
  - Patients
  - Appointments
  - Billing
  - Reports
  - Settings (admin only)
- **Main Content Area**: Dynamic based on route
- **Footer**: Version info

#### User Management (Admin Only)
- List all users
- Add new user
- Edit user details
- Assign multiple roles (checkboxes for admin, doctor, receptionist, accountant)
- Activate/deactivate users
- View role assignments

**User Form Fields**:
- Username (unique, required)
- Email (unique, required)
- Full Name (required)
- Phone
- Password (on creation)
- Roles (multi-select checkboxes)
- Status (Active/Inactive)

---

### B. Patient Registration System

#### Patient List Page
- **Search Bar**: Search by patient ID, name, or phone
- **Filter Options**: 
  - Active/Inactive
  - Gender
  - Date range (registration date)
- **Patient Table**:
  - Patient ID
  - Name
  - Age/Gender
  - Phone
  - Registration Date
  - Status
  - Actions (View, Edit)
- **Add New Patient Button**: Opens registration form
- **Pagination**: 20 patients per page
- **Export Button**: CSV export (for research)

#### Patient Registration Form
Create comprehensive form with the following sections:

**Personal Information**:
- First Name (required)
- Last Name (required)
- Date of Birth (date picker, required)
- Age (auto-calculated from DOB)
- Gender (dropdown: Male, Female, Other - required)
- Phone (required, validation)
- Email (optional)

**Address Details**:
- Address (text area)
- City
- Postal Code

**Emergency Contact**:
- Contact Name
- Contact Phone

**Additional Demographics** (for research):
- Blood Group (dropdown: A+, A-, B+, B-, O+, O-, AB+, AB-)
- Occupation
- Marital Status (dropdown: Single, Married, Divorced, Widowed)

**Medical History** (basic for now):
- Known Allergies (text area)
- Current Medications (text area)
- Diabetes (checkbox)
- Hypertension (checkbox)
- Other Chronic Conditions (text area)

**Form Actions**:
- Save & Continue (saves and goes to patient detail page)
- Save & New (saves and clears form for next patient)
- Cancel (returns to list)

#### Patient Detail Page
- **Patient Header Card**:
  - Patient ID (large, prominent)
  - Full Name
  - Age, Gender
  - Phone, Email
  - Registration Date
  - Edit Patient Button

- **Tabs**:
  - Overview (basic info + medical history)
  - Visits (list of all consultations - empty for now)
  - Prescriptions (empty for now)
  - Test Reports (empty for now)
  - Appointments (empty for now)
  - Billing (empty for now)

- **Quick Actions**:
  - New Visit (will be implemented in Phase 2)
  - Schedule Appointment (will be implemented in Phase 4)
  - View Full History

---

### C. Dashboard/Home Page

#### Dashboard Widgets
- **Today's Statistics**:
  - Total patients registered
  - New patients today
  - Appointments today (placeholder)
  - Pending payments (placeholder)

- **Recent Patients**: List of last 10 registered patients
- **Quick Actions**:
  - Add New Patient
  - Schedule Appointment
  - View Today's Appointments

---

## Technical Implementation Details

### Backend Routes (Express)

```javascript
// Auth routes
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me  // Get current user

// User routes (admin only)
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/roles  // Get all available roles

// Patient routes
GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PUT    /api/patients/:id
DELETE /api/patients/:id  // Soft delete (set is_active = 0)
GET    /api/patients/search?q=...

// Medical history routes
GET    /api/medical-history/:patientId
POST   /api/medical-history
PUT    /api/medical-history/:id
```

### Database Initialization

Create initialization script that:
1. Creates all tables from schema
2. Creates default admin user:
   - Username: admin
   - Password: Admin@123 (user must change on first login)
   - Roles: admin, doctor
3. Inserts default roles
4. Inserts default system settings

### Authentication Middleware

```javascript
// Protect routes
authenticateToken(req, res, next)

// Check specific roles
requireRoles(['admin', 'doctor'])(req, res, next)

// Check ANY of multiple roles
requireAnyRole(['doctor', 'receptionist'])(req, res, next)
```

### Frontend State Management

Use React Context for:
- **AuthContext**: 
  - Current user
  - User roles
  - Login/logout functions
  - Token management
- **AppContext**:
  - Loading states
  - Error notifications
  - Success messages

### Form Validation

**Frontend** (React Hook Form + Zod):
- Required fields
- Email format
- Phone number format (Pakistan: +92 or 03XX)
- Date validations (DOB cannot be future)

**Backend** (Joi):
- Same validations
- Duplicate checks (patient ID, username, email)
- Data sanitization

---

## UI/UX Guidelines

### Color Scheme (Medical/Professional)
- Primary: Blue (#3B82F6) - trust, medical
- Secondary: Teal (#14B8A6) - calm, clinical
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Danger: Red (#EF4444)
- Neutral: Gray shades for backgrounds

### Typography
- Headings: Inter or System UI fonts
- Body: Same, readable sizes (16px base)
- Medical data: Monospace for numbers/IDs

### Layout
- Clean, spacious design
- Clear visual hierarchy
- Ample whitespace
- Responsive (tablet support at minimum)

### Components to Use (shadcn/ui or Ant Design)
- Data tables with sorting/filtering
- Date pickers
- Form inputs with validation states
- Modal dialogs
- Toast notifications
- Loading spinners

---

## Testing Checklist

Before moving to Phase 2:

- [ ] User can login with default admin credentials
- [ ] Admin can create new users with multiple roles
- [ ] Admin can edit and deactivate users
- [ ] Users can only access features allowed by their roles
- [ ] Can register new patient with all fields
- [ ] Patient ID auto-generates correctly (PID-YYYYMMDD-0001)
- [ ] Age calculates automatically from DOB
- [ ] Can search patients by name, ID, phone
- [ ] Can edit existing patient
- [ ] Patient detail page displays correctly
- [ ] Medical history saves with patient
- [ ] Form validation works (frontend + backend)
- [ ] Error messages display clearly
- [ ] Success notifications appear
- [ ] Dashboard shows correct statistics
- [ ] All navigation links work
- [ ] Responsive on different screen sizes

---

## Code Quality

- Clean, commented code
- Consistent naming conventions
- Error handling on all API calls
- Loading states for async operations
- Proper HTTP status codes
- Database transactions where needed
- SQL injection prevention (parameterized queries)

---

## Notes for Bolt.new

1. **Auto-generate Patient ID**: Use format `PID-YYYYMMDD-####` where #### increments daily
2. **Age calculation**: Automatic from DOB, read-only field
3. **Phone validation**: Support both formats: +923001234567 and 03001234567
4. **Initial admin user**: Create on first database initialization
5. **Soft deletes**: Set `is_active = 0` instead of deleting records
6. **Timestamps**: Auto-update `updated_at` on every modification
7. **Role checking**: Implement helper functions for permission checks
8. **Session management**: JWT with 24-hour expiry, refresh on activity

---

## Success Criteria

Phase 1 is complete when:
- ✅ Authentication works with role-based access
- ✅ Admin can manage users with multiple roles
- ✅ Can create and manage patients
- ✅ Patient search and filtering works
- ✅ Dashboard shows basic statistics
- ✅ All forms validate properly
- ✅ Navigation and layout are functional
- ✅ Database schema is correctly implemented
- ✅ Code is clean and maintainable

**Ready to proceed to Phase 2: Clinical Data Entry**
