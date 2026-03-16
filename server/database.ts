import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../data/clinic.db'));

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'doctor',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    patient_id TEXT UNIQUE,
    user_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    age INTEGER,
    gender TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    blood_group TEXT,
    occupation TEXT,
    marital_status TEXT,
    registration_date DATE DEFAULT (date('now')),
    is_active INTEGER DEFAULT 1,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

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

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    appointment_number TEXT UNIQUE,
    user_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type TEXT,
    status TEXT DEFAULT 'Scheduled',
    reason TEXT,
    notes TEXT,
    doctor_id TEXT,
    confirmed_by_phone INTEGER DEFAULT 0,
    confirmed_by_sms INTEGER DEFAULT 0,
    reminder_sent INTEGER DEFAULT 0,
    cancellation_reason TEXT,
    cancelled_at DATETIME,
    cancelled_by TEXT,
    completed_at DATETIME,
    no_show_notes TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS appointment_status_history (
    id TEXT PRIMARY KEY,
    appointment_id TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    visit_number TEXT UNIQUE,
    user_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    appointment_id TEXT,
    visit_date DATE NOT NULL,
    visit_time TIME,
    visit_type TEXT,
    chief_complaint TEXT,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    notes TEXT,
    doctor_id TEXT NOT NULL,
    follow_up_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
  );

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

  CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    visit_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    prescription_type TEXT NOT NULL,
    medications TEXT,
    spectacle_od_sphere REAL,
    spectacle_od_cylinder REAL,
    spectacle_od_axis INTEGER,
    spectacle_od_add REAL,
    spectacle_os_sphere REAL,
    spectacle_os_cylinder REAL,
    spectacle_os_axis INTEGER,
    spectacle_os_add REAL,
    instructions TEXT,
    prescription_image_path TEXT,
    issued_date DATE NOT NULL,
    expiry_date DATE,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

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

  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    visit_id TEXT,
    billing_date DATE DEFAULT (date('now')),
    consultation_fee REAL DEFAULT 0,
    test_charges REAL DEFAULT 0,
    other_charges REAL DEFAULT 0,
    subtotal REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    amount_paid REAL NOT NULL DEFAULT 0,
    balance REAL NOT NULL DEFAULT 0,
    payment_status TEXT DEFAULT 'Unpaid',
    payment_method TEXT,
    payment_date DATE,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bill_id TEXT NOT NULL,
    payment_date DATE NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (bill_id) REFERENCES bills(id)
  );

  CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id TEXT PRIMARY KEY,
    field_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    data_type TEXT NOT NULL,
    field_options TEXT,
    is_required INTEGER DEFAULT 0,
    show_in_reports INTEGER DEFAULT 0,
    is_research_field INTEGER DEFAULT 0,
    help_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS custom_field_values (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    field_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES custom_field_definitions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
  CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
  CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
  CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
  CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
  CREATE INDEX IF NOT EXISTS idx_patients_registration_date ON patients(registration_date);
  CREATE INDEX IF NOT EXISTS idx_medical_history_patient ON medical_history(patient_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
  CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_date, appointment_time);
  CREATE INDEX IF NOT EXISTS idx_appointment_status_history_appointment ON appointment_status_history(appointment_id);
  CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
  CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
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
  CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
  CREATE INDEX IF NOT EXISTS idx_bills_patient_id ON bills(patient_id);
  CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(billing_date);
  CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(payment_status);
  CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_entity ON custom_field_definitions(entity_type);
  CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_active ON custom_field_definitions(is_active);
  CREATE INDEX IF NOT EXISTS idx_custom_field_values_field ON custom_field_values(field_id);
  CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
`);

const insertSettings = db.prepare(`
  INSERT OR IGNORE INTO system_settings (id, setting_key, setting_value, description) VALUES (?, ?, ?, ?)
`);

insertSettings.run('1', 'clinic_name', 'Eye Care Clinic', 'Clinic name for reports');
insertSettings.run('2', 'default_appointment_duration', '30', 'Default appointment duration in minutes');
insertSettings.run('3', 'currency', 'PKR', 'Currency for billing');
insertSettings.run('4', 'date_format', 'DD/MM/YYYY', 'Date display format');
insertSettings.run('5', 'clinic_start_time', '09:00', 'Clinic opening time');
insertSettings.run('6', 'clinic_end_time', '18:00', 'Clinic closing time');

export default db;
