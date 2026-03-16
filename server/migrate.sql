-- Add missing columns to users table
ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'doctor';
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to patients table
ALTER TABLE patients ADD COLUMN patient_id TEXT UNIQUE;
ALTER TABLE patients ADD COLUMN age INTEGER;
ALTER TABLE patients ADD COLUMN blood_group TEXT;
ALTER TABLE patients ADD COLUMN occupation TEXT;
ALTER TABLE patients ADD COLUMN marital_status TEXT;
ALTER TABLE patients ADD COLUMN registration_date DATE DEFAULT (date('now'));
ALTER TABLE patients ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE patients ADD COLUMN created_by TEXT REFERENCES users(id);

-- Rename address columns in patients
ALTER TABLE patients RENAME COLUMN address_line1 TO address;

-- Add missing columns to appointments
ALTER TABLE appointments ADD COLUMN appointment_number TEXT UNIQUE;
ALTER TABLE appointments ADD COLUMN appointment_time TIME;
ALTER TABLE appointments ADD COLUMN duration_minutes INTEGER DEFAULT 30;
ALTER TABLE appointments ADD COLUMN reason TEXT;
ALTER TABLE appointments ADD COLUMN doctor_id TEXT REFERENCES users(id);
ALTER TABLE patients ADD COLUMN created_by TEXT REFERENCES users(id);

-- Rename appointment_date to split date/time
ALTER TABLE appointments RENAME COLUMN appointment_date TO appointment_date_temp;
ALTER TABLE appointments ADD COLUMN appointment_date DATE;

-- Add missing columns to visits
ALTER TABLE visits ADD COLUMN visit_number TEXT UNIQUE;
ALTER TABLE visits ADD COLUMN visit_time TIME;
ALTER TABLE visits ADD COLUMN visit_type TEXT;
ALTER TABLE visits ADD COLUMN doctor_id TEXT REFERENCES users(id);

-- Create medical_history table
CREATE TABLE IF NOT EXISTS medical_history (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  allergies TEXT,
  current_medications TEXT,
  past_surgeries TEXT,
  family_history TEXT,
  chronic_conditions TEXT,
  diabetes INTEGER DEFAULT 0,
  hypertension INTEGER DEFAULT 0,
  other_conditions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Rename examinations to eye_examinations and add fields
CREATE TABLE IF NOT EXISTS eye_examinations (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  od_vision_distance TEXT,
  od_vision_near TEXT,
  od_sphere REAL,
  od_cylinder REAL,
  od_axis INTEGER,
  od_add REAL,
  od_iop INTEGER,
  os_vision_distance TEXT,
  os_vision_near TEXT,
  os_sphere REAL,
  os_cylinder REAL,
  os_axis INTEGER,
  os_add REAL,
  os_iop INTEGER,
  pupil_od TEXT,
  pupil_os TEXT,
  color_vision TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Add missing columns to prescriptions
ALTER TABLE prescriptions ADD COLUMN medications TEXT;
ALTER TABLE prescriptions ADD COLUMN spectacle_od_sphere REAL;
ALTER TABLE prescriptions ADD COLUMN spectacle_od_cylinder REAL;
ALTER TABLE prescriptions ADD COLUMN spectacle_od_axis INTEGER;
ALTER TABLE prescriptions ADD COLUMN spectacle_os_sphere REAL;
ALTER TABLE prescriptions ADD COLUMN spectacle_os_cylinder REAL;
ALTER TABLE prescriptions ADD COLUMN spectacle_os_axis INTEGER;
ALTER TABLE prescriptions ADD COLUMN instructions TEXT;
ALTER TABLE prescriptions ADD COLUMN prescription_image_path TEXT;
ALTER TABLE prescriptions ADD COLUMN created_by TEXT REFERENCES users(id);
ALTER TABLE prescriptions ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create test_recommendations table
CREATE TABLE IF NOT EXISTS test_recommendations (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT,
  instructions TEXT,
  status TEXT DEFAULT 'Pending',
  ordered_date DATE DEFAULT (date('now')),
  completed_date DATE,
  result_summary TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create test_reports table
CREATE TABLE IF NOT EXISTS test_reports (
  id TEXT PRIMARY KEY,
  test_recommendation_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  upload_date DATE DEFAULT (date('now')),
  uploaded_by TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_recommendation_id) REFERENCES test_recommendations(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Add missing billing columns
ALTER TABLE bills RENAME COLUMN bill_number TO invoice_number;
ALTER TABLE bills ADD COLUMN billing_date DATE DEFAULT (date('now'));
ALTER TABLE bills ADD COLUMN consultation_fee REAL DEFAULT 0;
ALTER TABLE bills ADD COLUMN test_charges REAL DEFAULT 0;
ALTER TABLE bills ADD COLUMN other_charges REAL DEFAULT 0;
ALTER TABLE bills ADD COLUMN payment_status TEXT DEFAULT 'Unpaid';
ALTER TABLE bills ADD COLUMN payment_method TEXT;
ALTER TABLE bills ADD COLUMN payment_date DATE;
ALTER TABLE bills ADD COLUMN created_by TEXT REFERENCES users(id);

-- Create custom_fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  data_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create all new indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_registration_date ON patients(registration_date);
CREATE INDEX IF NOT EXISTS idx_medical_history_patient ON medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_doctor ON visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_eye_exam_visit ON eye_examinations(visit_id);
CREATE INDEX IF NOT EXISTS idx_eye_exam_patient ON eye_examinations(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_visit ON prescriptions(visit_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_test_recommendations_visit ON test_recommendations(visit_id);
CREATE INDEX IF NOT EXISTS idx_test_recommendations_patient ON test_recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_test_recommendations_status ON test_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_test_reports_test ON test_reports(test_recommendation_id);
CREATE INDEX IF NOT EXISTS idx_test_reports_patient ON test_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(billing_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_custom_fields_entity ON custom_fields(entity_type, entity_id);

-- Insert default settings
INSERT OR IGNORE INTO system_settings (id, setting_key, setting_value, description) VALUES
  ('1', 'clinic_name', 'Eye Care Clinic', 'Clinic name for reports'),
  ('2', 'default_appointment_duration', '30', 'Default appointment duration in minutes'),
  ('3', 'currency', 'PKR', 'Currency for billing'),
  ('4', 'date_format', 'DD/MM/YYYY', 'Date display format');
