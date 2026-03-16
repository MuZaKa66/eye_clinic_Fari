# Eye Clinic Management System

A comprehensive, locally-deployable clinic management system built with React, TypeScript, Express, and SQLite.

## Features

- **Patient Management**: Complete patient records with demographics, medical history, insurance, and emergency contacts
- **Appointment Scheduling**: Schedule and manage patient appointments with status tracking
- **Visit Documentation**: Record patient visits with chief complaints, diagnoses, and treatment plans
- **Billing & Invoicing**: Generate bills, track payments, and manage outstanding balances
- **Authentication**: Secure user authentication with JWT tokens
- **Dashboard**: Overview statistics and quick actions
- **Local Deployment**: Runs completely locally with SQLite database

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, Node.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT tokens with bcrypt password hashing
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/MuZaKa66/eye_clinic_Fari.git
   cd eye_clinic_Fari
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the JWT_SECRET if desired (optional for development)

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 3001) and frontend dev server (port 5173)

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

6. **Create your first account**
   Click "Sign up" and create your admin account

## Database

The SQLite database will be automatically created at `data/clinic.db` when you first start the server. The schema includes:

- Users (authentication)
- Patients (patient records)
- Appointments (scheduling)
- Visits (visit documentation)
- Examinations (eye exam results)
- Prescriptions (eyewear and medications)
- Bills (invoicing)
- Bill Items (line items)
- Payments (payment tracking)

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Project Structure

```
eye-clinic-management-system/
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── lib/               # API client and utilities
│   └── types/             # TypeScript type definitions
├── server/                # Backend source code
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   └── database.ts        # SQLite database setup
├── data/                  # SQLite database files
└── public/                # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - List appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Visits
- `GET /api/visits` - List visits
- `GET /api/visits/:id` - Get visit by ID
- `POST /api/visits` - Create visit
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit

### Bills
- `GET /api/bills` - List bills
- `GET /api/bills/:id` - Get bill by ID
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

### Stats
- `GET /api/stats` - Get dashboard statistics

## Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- All API routes (except auth) require authentication
- SQL injection protection through parameterized queries

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
