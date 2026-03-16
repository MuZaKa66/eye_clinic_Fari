// Patient Types
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  medical_history?: string;
  allergies?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  medical_history?: string;
  allergies?: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  patient_id: string;
  patient?: Patient;
  appointment_date: string;
  appointment_time: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'surgery' | 'other';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentFormData {
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'surgery' | 'other';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
}

// Visit Types
export interface Visit {
  id: string;
  patient_id: string;
  patient?: Patient;
  appointment_id?: string;
  visit_date: string;
  visit_time: string;
  chief_complaint: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface VisitFormData {
  patient_id: string;
  appointment_id?: string;
  visit_date: string;
  visit_time: string;
  chief_complaint: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  follow_up_date?: string;
}

// Examination Types
export interface Examination {
  id: string;
  visit_id: string;
  visual_acuity_od?: string; // Right eye
  visual_acuity_os?: string; // Left eye
  intraocular_pressure_od?: number;
  intraocular_pressure_os?: number;
  refraction_od_sphere?: number;
  refraction_od_cylinder?: number;
  refraction_od_axis?: number;
  refraction_os_sphere?: number;
  refraction_os_cylinder?: number;
  refraction_os_axis?: number;
  pupil_od?: string;
  pupil_os?: string;
  external_exam?: string;
  slit_lamp_exam?: string;
  dilated_fundus_exam?: string;
  additional_findings?: string;
  created_at: string;
  updated_at: string;
}

// Prescription Types
export interface Prescription {
  id: string;
  visit_id: string;
  patient_id: string;
  prescription_type: 'eyeglasses' | 'contact_lenses' | 'medication';
  // For eyeglasses/contact lenses
  od_sphere?: number;
  od_cylinder?: number;
  od_axis?: number;
  od_add?: number;
  os_sphere?: number;
  os_cylinder?: number;
  os_axis?: number;
  os_add?: number;
  pd?: number; // Pupillary distance
  // For medication
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  issued_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

// Billing Types
export interface Bill {
  id: string;
  patient_id: string;
  patient?: Patient;
  visit_id?: string;
  bill_date: string;
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: 'cash' | 'card' | 'insurance' | 'check' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BillItem {
  id: string;
  bill_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  bill_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'insurance' | 'check' | 'other';
  reference_number?: string;
  notes?: string;
  created_at: string;
}

// User/Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'doctor' | 'staff';
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Dashboard Statistics
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingBills: number;
  monthlyRevenue: number;
}
