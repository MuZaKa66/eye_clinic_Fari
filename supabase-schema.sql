-- Eye Clinic Management System - Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Patients Table
create table if not exists patients (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  email text,
  phone text not null,
  address text,
  city text,
  state text,
  zip_code text,
  emergency_contact_name text,
  emergency_contact_phone text,
  insurance_provider text,
  insurance_policy_number text,
  medical_history text,
  allergies text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appointments Table
create table if not exists appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  appointment_date date not null,
  appointment_time time not null,
  appointment_type text not null check (appointment_type in ('consultation', 'follow_up', 'emergency', 'surgery', 'other')),
  status text not null check (status in ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  reason text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Visits Table
create table if not exists visits (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  appointment_id uuid references appointments(id) on delete set null,
  visit_date date not null,
  visit_time time not null,
  chief_complaint text not null,
  diagnosis text,
  treatment_plan text,
  notes text,
  follow_up_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Examinations Table
create table if not exists examinations (
  id uuid default uuid_generate_v4() primary key,
  visit_id uuid references visits(id) on delete cascade not null,
  visual_acuity_od text,
  visual_acuity_os text,
  intraocular_pressure_od numeric(5, 2),
  intraocular_pressure_os numeric(5, 2),
  refraction_od_sphere numeric(5, 2),
  refraction_od_cylinder numeric(5, 2),
  refraction_od_axis integer,
  refraction_os_sphere numeric(5, 2),
  refraction_os_cylinder numeric(5, 2),
  refraction_os_axis integer,
  pupil_od text,
  pupil_os text,
  external_exam text,
  slit_lamp_exam text,
  dilated_fundus_exam text,
  additional_findings text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Prescriptions Table
create table if not exists prescriptions (
  id uuid default uuid_generate_v4() primary key,
  visit_id uuid references visits(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  prescription_type text not null check (prescription_type in ('eyeglasses', 'contact_lenses', 'medication')),
  od_sphere numeric(5, 2),
  od_cylinder numeric(5, 2),
  od_axis integer,
  od_add numeric(5, 2),
  os_sphere numeric(5, 2),
  os_cylinder numeric(5, 2),
  os_axis integer,
  os_add numeric(5, 2),
  pd numeric(5, 2),
  medication_name text,
  dosage text,
  frequency text,
  duration text,
  instructions text,
  issued_date date not null,
  expiry_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bills Table
create table if not exists bills (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  visit_id uuid references visits(id) on delete set null,
  bill_date date not null,
  due_date date,
  total_amount numeric(10, 2) not null,
  paid_amount numeric(10, 2) default 0 not null,
  balance numeric(10, 2) not null,
  status text not null check (status in ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  payment_method text check (payment_method in ('cash', 'card', 'insurance', 'check', 'other')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bill Items Table
create table if not exists bill_items (
  id uuid default uuid_generate_v4() primary key,
  bill_id uuid references bills(id) on delete cascade not null,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments Table
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  bill_id uuid references bills(id) on delete cascade not null,
  payment_date date not null,
  amount numeric(10, 2) not null,
  payment_method text not null check (payment_method in ('cash', 'card', 'insurance', 'check', 'other')),
  reference_number text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_patients_last_name on patients(last_name);
create index if not exists idx_patients_phone on patients(phone);
create index if not exists idx_appointments_date on appointments(appointment_date);
create index if not exists idx_appointments_patient_id on appointments(patient_id);
create index if not exists idx_visits_patient_id on visits(patient_id);
create index if not exists idx_visits_date on visits(visit_date);
create index if not exists idx_bills_patient_id on bills(patient_id);
create index if not exists idx_bills_status on bills(status);

-- Enable Row Level Security (RLS)
alter table patients enable row level security;
alter table appointments enable row level security;
alter table visits enable row level security;
alter table examinations enable row level security;
alter table prescriptions enable row level security;
alter table bills enable row level security;
alter table bill_items enable row level security;
alter table payments enable row level security;

-- Create RLS policies (adjust these based on your security requirements)

-- Patients policies
create policy "Enable read access for authenticated users" on patients
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on patients
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on patients
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on patients
  for delete using (auth.role() = 'authenticated');

-- Appointments policies
create policy "Enable all operations for authenticated users" on appointments
  for all using (auth.role() = 'authenticated');

-- Visits policies
create policy "Enable all operations for authenticated users" on visits
  for all using (auth.role() = 'authenticated');

-- Examinations policies
create policy "Enable all operations for authenticated users" on examinations
  for all using (auth.role() = 'authenticated');

-- Prescriptions policies
create policy "Enable all operations for authenticated users" on prescriptions
  for all using (auth.role() = 'authenticated');

-- Bills policies
create policy "Enable all operations for authenticated users" on bills
  for all using (auth.role() = 'authenticated');

-- Bill Items policies
create policy "Enable all operations for authenticated users" on bill_items
  for all using (auth.role() = 'authenticated');

-- Payments policies
create policy "Enable all operations for authenticated users" on payments
  for all using (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_patients_updated_at before update on patients
  for each row execute function update_updated_at_column();

create trigger update_appointments_updated_at before update on appointments
  for each row execute function update_updated_at_column();

create trigger update_visits_updated_at before update on visits
  for each row execute function update_updated_at_column();

create trigger update_examinations_updated_at before update on examinations
  for each row execute function update_updated_at_column();

create trigger update_prescriptions_updated_at before update on prescriptions
  for each row execute function update_updated_at_column();

create trigger update_bills_updated_at before update on bills
  for each row execute function update_updated_at_column();
