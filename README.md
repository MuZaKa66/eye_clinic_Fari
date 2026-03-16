# Eye Clinic Management System

A comprehensive web-based management system for eye clinics built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- **Patient Management**: Register and manage patient records with comprehensive information including personal details, medical history, allergies, and insurance information
- **Appointment Scheduling**: Schedule, track, and manage patient appointments with various appointment types and statuses
- **Visit Records**: Document patient visits with chief complaints, diagnoses, treatment plans, and follow-up information
- **Examinations**: Record detailed eye examination results including visual acuity, intraocular pressure, refraction measurements, and fundus exam findings
- **Prescriptions**: Issue prescriptions for eyeglasses, contact lenses, and medications
- **Billing & Invoicing**: Create and manage bills, track payments, and monitor outstanding balances
- **Dashboard**: View clinic statistics and quick access to common actions
- **User Authentication**: Secure login and signup system with role-based access
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
project/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navbar.tsx
│   ├── pages/          # Page components
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Patients.tsx
│   │   ├── PatientForm.tsx
│   │   ├── Appointments.tsx
│   │   ├── Visits.tsx
│   │   ├── Billing.tsx
│   │   └── Settings.tsx
│   ├── lib/            # Utilities and configurations
│   │   ├── supabase.ts
│   │   └── AuthContext.tsx
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

## Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd /tmp/cc-agent/64734039/project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database:**

   Create the following tables in your Supabase database:

   **Patients Table:**
   ```sql
   create table patients (
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
   ```

   **Appointments Table:**
   ```sql
   create table appointments (
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
   ```

   **Visits Table:**
   ```sql
   create table visits (
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
   ```

   **Bills Table:**
   ```sql
   create table bills (
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
   ```

5. **Enable Row Level Security (RLS) in Supabase:**

   For each table, enable RLS and create policies as needed. Example policy for authenticated users:

   ```sql
   alter table patients enable row level security;

   create policy "Enable read access for authenticated users" on patients
     for select using (auth.role() = 'authenticated');

   create policy "Enable insert for authenticated users" on patients
     for insert with check (auth.role() = 'authenticated');

   create policy "Enable update for authenticated users" on patients
     for update using (auth.role() = 'authenticated');
   ```

   Repeat similar policies for other tables.

## Running the Application

**Development mode:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Build for production:**

```bash
npm run build
```

**Preview production build:**

```bash
npm run preview
```

## Usage

1. **Sign Up / Sign In:**
   - Navigate to the signup page to create a new account
   - Or sign in with existing credentials

2. **Dashboard:**
   - View clinic statistics including total patients, today's appointments, pending bills, and monthly revenue
   - Access quick actions for common tasks

3. **Manage Patients:**
   - Add new patients with comprehensive information
   - View all patients in a searchable list
   - Edit patient information

4. **Schedule Appointments:**
   - Create new appointments for patients
   - View appointments by date
   - Update appointment status

5. **Record Visits:**
   - Document patient visits with complaints, diagnosis, and treatment
   - Link visits to appointments

6. **Manage Billing:**
   - Create invoices for services
   - Track payments and outstanding balances
   - Filter bills by status

7. **Settings:**
   - Update profile information
   - Change password
   - Configure notification preferences

## Default Credentials

After setting up Supabase authentication, you can create your first user through the signup page.

## Features in Development

- PDF export for prescriptions and bills
- Patient medical history timeline
- Advanced search and filtering
- Email notifications
- Appointment reminders
- Multi-user roles and permissions
- Analytics and reporting

## Contributing

This is a demonstration project. For production use, ensure you:

- Implement proper authentication and authorization
- Add comprehensive error handling
- Set up proper database indexes
- Configure backup strategies
- Add unit and integration tests
- Implement audit logging
- Add data validation
- Configure proper CORS settings

## License

MIT License - feel free to use this project for learning or as a starting point for your own clinic management system.

## Support

For issues or questions, please create an issue in the repository.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Backend by [Supabase](https://supabase.com/)
