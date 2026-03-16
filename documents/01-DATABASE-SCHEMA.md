# Database Schema - Eye Clinic Management System

## Schema Version: 1.0
**Database**: SQLite3 (migration-ready for PostgreSQL)

---

## Table: users

**Purpose**: System users (doctors, receptionists, accountants)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `CREATE INDEX idx_users_username ON users(username);`
- `CREATE INDEX idx_users_email ON users(email);`

---

## Table: roles

**Purpose**: System roles (admin, doctor, receptionist, accountant)

```sql
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Default Data**:
```sql
INSERT INTO roles (role_name, description) VALUES 
    ('admin', 'Full system access - Doctor/Owner'),
    ('doctor', 'Clinical data access'),
    ('receptionist', 'Patient registration and appointments'),
    ('accountant', 'Billing and payment management');
```

---

## Table: user_roles

**Purpose**: Many-to-many relationship (users can have multiple roles)

```sql
CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);
```

**Indexes**:
- `CREATE INDEX idx_user_roles_user ON user_roles(user_id);`
- `CREATE INDEX idx_user_roles_role ON user_roles(role_id);`

---

## Table: patients

**Purpose**: Core patient information and demographics

```sql
CREATE TABLE patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id VARCHAR(20) UNIQUE NOT NULL,  -- Auto-generated: PID-YYYYMMDD-0001
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INTEGER,  -- Calculated field
    gender VARCHAR(10) NOT NULL,  -- Male, Female, Other
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    blood_group VARCHAR(5),
    occupation VARCHAR(100),
    marital_status VARCHAR(20),
    registration_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_patients_patient_id ON patients(patient_id);`
- `CREATE INDEX idx_patients_name ON patients(last_name, first_name);`
- `CREATE INDEX idx_patients_phone ON patients(phone);`
- `CREATE INDEX idx_patients_registration_date ON patients(registration_date);`

---

## Table: medical_history

**Purpose**: Patient medical background

```sql
CREATE TABLE medical_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    allergies TEXT,  -- JSON array or comma-separated
    current_medications TEXT,
    past_surgeries TEXT,
    family_history TEXT,
    chronic_conditions TEXT,
    diabetes BOOLEAN DEFAULT 0,
    hypertension BOOLEAN DEFAULT 0,
    other_conditions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

**Indexes**:
- `CREATE INDEX idx_medical_history_patient ON medical_history(patient_id);`

---

## Table: visits

**Purpose**: Patient consultation/visit records

```sql
CREATE TABLE visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_number VARCHAR(20) UNIQUE NOT NULL,  -- VIS-YYYYMMDD-0001
    patient_id INTEGER NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME,
    visit_type VARCHAR(50),  -- Follow-up, New Consultation, Emergency
    chief_complaint TEXT,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    doctor_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_visits_patient ON visits(patient_id);`
- `CREATE INDEX idx_visits_date ON visits(visit_date);`
- `CREATE INDEX idx_visits_doctor ON visits(doctor_id);`

---

## Table: eye_examinations

**Purpose**: Eye-specific examination data (vision, IOP, etc.)

```sql
CREATE TABLE eye_examinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    
    -- Right Eye (OD - Oculus Dexter)
    od_vision_distance VARCHAR(10),  -- 6/6, 6/9, etc.
    od_vision_near VARCHAR(10),
    od_sphere DECIMAL(5,2),
    od_cylinder DECIMAL(5,2),
    od_axis INTEGER,
    od_add DECIMAL(4,2),
    od_iop INTEGER,  -- Intraocular Pressure (mmHg)
    
    -- Left Eye (OS - Oculus Sinister)
    os_vision_distance VARCHAR(10),
    os_vision_near VARCHAR(10),
    os_sphere DECIMAL(5,2),
    os_cylinder DECIMAL(5,2),
    os_axis INTEGER,
    os_add DECIMAL(4,2),
    os_iop INTEGER,
    
    -- Additional measurements
    pupil_od VARCHAR(50),
    pupil_os VARCHAR(50),
    color_vision VARCHAR(50),
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

**Indexes**:
- `CREATE INDEX idx_eye_exam_visit ON eye_examinations(visit_id);`
- `CREATE INDEX idx_eye_exam_patient ON eye_examinations(patient_id);`

---

## Table: prescriptions

**Purpose**: Medication and spectacle prescriptions

```sql
CREATE TABLE prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    prescription_type VARCHAR(20) NOT NULL,  -- Medication, Spectacles, Both
    
    -- Typed prescription data
    medications TEXT,  -- JSON array of {medicine, dosage, frequency, duration}
    
    -- Spectacle prescription (if different from exam)
    spectacle_od_sphere DECIMAL(5,2),
    spectacle_od_cylinder DECIMAL(5,2),
    spectacle_od_axis INTEGER,
    spectacle_os_sphere DECIMAL(5,2),
    spectacle_os_cylinder DECIMAL(5,2),
    spectacle_os_axis INTEGER,
    
    instructions TEXT,
    
    -- Image upload (handwritten prescription)
    prescription_image_path VARCHAR(255),
    
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_prescriptions_visit ON prescriptions(visit_id);`
- `CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);`

---

## Table: test_recommendations

**Purpose**: Tests ordered for patients

```sql
CREATE TABLE test_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    test_type VARCHAR(50),  -- Lab, Imaging, OCT, Visual Field, etc.
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'Pending',  -- Pending, Completed, Cancelled
    ordered_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    result_summary TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_test_recommendations_visit ON test_recommendations(visit_id);`
- `CREATE INDEX idx_test_recommendations_patient ON test_recommendations(patient_id);`
- `CREATE INDEX idx_test_recommendations_status ON test_recommendations(status);`

---

## Table: test_reports

**Purpose**: Uploaded test report images/files

```sql
CREATE TABLE test_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_recommendation_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    file_type VARCHAR(20),  -- image/jpeg, image/png, application/pdf
    file_size INTEGER,
    upload_date DATE DEFAULT CURRENT_DATE,
    uploaded_by INTEGER NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_recommendation_id) REFERENCES test_recommendations(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_test_reports_test ON test_reports(test_recommendation_id);`
- `CREATE INDEX idx_test_reports_patient ON test_reports(patient_id);`

---

## Table: appointments

**Purpose**: Patient appointment scheduling

```sql
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_number VARCHAR(20) UNIQUE NOT NULL,  -- APT-YYYYMMDD-0001
    patient_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(50),  -- Follow-up, New Patient, Emergency
    status VARCHAR(20) DEFAULT 'Scheduled',  -- Scheduled, Completed, Cancelled, No-Show
    reason TEXT,
    notes TEXT,
    doctor_id INTEGER,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_appointments_patient ON appointments(patient_id);`
- `CREATE INDEX idx_appointments_date ON appointments(appointment_date);`
- `CREATE INDEX idx_appointments_status ON appointments(status);`
- `CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);`

---

## Table: billing

**Purpose**: Payment and billing records

```sql
CREATE TABLE billing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,  -- INV-YYYYMMDD-0001
    patient_id INTEGER NOT NULL,
    visit_id INTEGER,
    billing_date DATE DEFAULT CURRENT_DATE,
    
    -- Charges
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    test_charges DECIMAL(10,2) DEFAULT 0,
    other_charges DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Unpaid',  -- Paid, Partial, Unpaid
    payment_method VARCHAR(50),  -- Cash, Card, UPI, Insurance
    payment_date DATE,
    
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_billing_patient ON billing(patient_id);`
- `CREATE INDEX idx_billing_date ON billing(billing_date);`
- `CREATE INDEX idx_billing_status ON billing(payment_status);`

---

## Table: custom_fields

**Purpose**: Expandable custom fields for research/future needs

```sql
CREATE TABLE custom_fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type VARCHAR(50) NOT NULL,  -- patient, visit, examination
    entity_id INTEGER NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT,
    data_type VARCHAR(20),  -- text, number, date, boolean
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `CREATE INDEX idx_custom_fields_entity ON custom_fields(entity_type, entity_id);`

---

## Table: system_settings

**Purpose**: Application configuration

```sql
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Default Settings**:
```sql
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('clinic_name', 'Eye Care Clinic', 'Clinic name for reports'),
    ('default_appointment_duration', '30', 'Default appointment duration in minutes'),
    ('currency', 'PKR', 'Currency for billing'),
    ('date_format', 'DD/MM/YYYY', 'Date display format'),
    ('backup_enabled', '1', 'Enable automatic backups');
```

---

## Relationships Summary

```
users ←→ user_roles ←→ roles (Many-to-Many)
users → patients (created_by)
patients → medical_history (One-to-One)
patients → visits (One-to-Many)
visits → eye_examinations (One-to-One)
visits → prescriptions (One-to-Many)
visits → test_recommendations (One-to-Many)
test_recommendations → test_reports (One-to-Many)
patients → appointments (One-to-Many)
patients → billing (One-to-Many)
```

---

## Data Migration Notes

**SQLite → PostgreSQL**:
- Change `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- Change `DATETIME` → `TIMESTAMP`
- Change `BOOLEAN` → `BOOLEAN` (same)
- Add proper schema versioning
- Implement migration scripts

---

## Backup Strategy

1. Daily automated SQLite database backup
2. Copy to `/backups/clinic-db-YYYYMMDD.sqlite`
3. Keep last 30 days
4. Weekly full system backup (database + uploaded files)
