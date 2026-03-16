import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../data/clinic.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    insurance_group_number TEXT,
    allergies TEXT,
    current_medications TEXT,
    medical_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    appointment_date DATETIME NOT NULL,
    appointment_type TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    appointment_id TEXT,
    visit_date DATETIME NOT NULL,
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    follow_up_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
  );

  CREATE TABLE IF NOT EXISTS examinations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    visit_id TEXT NOT NULL,
    od_sphere REAL,
    od_cylinder REAL,
    od_axis INTEGER,
    od_visual_acuity TEXT,
    os_sphere REAL,
    os_cylinder REAL,
    os_axis INTEGER,
    os_visual_acuity TEXT,
    intraocular_pressure_od INTEGER,
    intraocular_pressure_os INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (visit_id) REFERENCES visits(id)
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    visit_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    prescription_type TEXT NOT NULL,
    od_sphere REAL,
    od_cylinder REAL,
    od_axis INTEGER,
    od_add REAL,
    os_sphere REAL,
    os_cylinder REAL,
    os_axis INTEGER,
    os_add REAL,
    pd REAL,
    medication_name TEXT,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    notes TEXT,
    issued_date DATE NOT NULL,
    expiry_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    visit_id TEXT,
    bill_number TEXT UNIQUE NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    subtotal REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    amount_paid REAL NOT NULL DEFAULT 0,
    balance REAL NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (visit_id) REFERENCES visits(id)
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

  CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
  CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
  CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
  CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
  CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
  CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
  CREATE INDEX IF NOT EXISTS idx_bills_patient_id ON bills(patient_id);
`);

export default db;
