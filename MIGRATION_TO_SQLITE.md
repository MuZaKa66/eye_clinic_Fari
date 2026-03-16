# Migration to SQLite - Local Deployment Guide

This document explains the changes made to convert the Eye Clinic Management System from Supabase to SQLite for local deployment.

## What Changed?

### Database
- **Before**: Cloud-hosted PostgreSQL database via Supabase
- **After**: Local SQLite database stored in `data/clinic.db`

### Backend
- **Before**: Direct Supabase client calls from frontend
- **After**: Express.js REST API server with better-sqlite3

### Authentication
- **Before**: Supabase Auth with OAuth support
- **After**: JWT tokens with bcrypt password hashing

### Deployment
- **Before**: Required Supabase account and configuration
- **After**: Fully local deployment, no external dependencies

## Architecture Changes

### New Backend Structure

```
server/
├── database.ts           # SQLite database connection and schema
├── index.ts             # Express server setup
├── middleware/
│   └── auth.ts          # JWT authentication middleware
└── routes/
    ├── auth.ts          # Authentication endpoints
    ├── patients.ts      # Patient management
    ├── appointments.ts  # Appointment management
    ├── visits.ts        # Visit management
    ├── bills.ts         # Billing management
    └── stats.ts         # Dashboard statistics
```

### Frontend Changes

1. **New API Client** (`src/lib/api.ts`)
   - Replaces direct Supabase calls
   - REST API client with fetch
   - Token-based authentication

2. **Updated Auth Context** (`src/lib/AuthContext.tsx`)
   - Uses localStorage for token storage
   - Simplified auth flow
   - JWT token management

3. **Updated Components**
   - All pages now use `api` instead of `supabase`
   - Simplified data fetching
   - Direct error handling

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

New dependencies added:
- `better-sqlite3` - SQLite database driver
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `tsx` - TypeScript execution for backend
- `concurrently` - Run multiple commands simultaneously

### 2. Environment Setup

```bash
cp .env.example .env
```

The `.env` file now only needs:
```
JWT_SECRET=your-secret-key-change-in-production
```

No more Supabase URL or keys needed!

### 3. Start the Application

```bash
npm run dev
```

This command now:
1. Starts the Express backend on port 3001
2. Starts the Vite frontend on port 5173
3. Both run concurrently and reload on changes

### 4. Database Initialization

The SQLite database is automatically created when you first start the server. The schema includes all necessary tables:

- `users` - User accounts and authentication
- `patients` - Patient records
- `appointments` - Scheduling
- `visits` - Visit documentation
- `examinations` - Eye exam results
- `prescriptions` - Prescriptions
- `bills` - Invoicing
- `bill_items` - Invoice line items
- `payments` - Payment tracking

## API Endpoints

All endpoints are prefixed with `/api` and run on port 3001.

### Authentication (Public)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Protected Endpoints
All other endpoints require `Authorization: Bearer <token>` header.

#### Patients
- `GET /api/patients?search=<query>` - List/search patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

#### Appointments
- `GET /api/appointments?status=<status>&date=<date>` - List appointments
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

#### Visits
- `GET /api/visits?patient_id=<id>` - List visits
- `GET /api/visits/:id` - Get visit details
- `POST /api/visits` - Create visit
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit

#### Bills
- `GET /api/bills?status=<status>&patient_id=<id>` - List bills
- `GET /api/bills/:id` - Get bill details (includes items and payments)
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

#### Statistics
- `GET /api/stats` - Get dashboard statistics

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds
- Original passwords are never stored
- Secure password comparison

### JWT Authentication
- Tokens expire after 7 days
- Tokens include user ID for authorization
- All protected routes verify tokens

### SQL Injection Protection
- Parameterized queries using better-sqlite3
- No string concatenation in SQL
- Automatic escaping of user input

### CORS Configuration
- Configured to allow frontend access
- Can be restricted to specific origins in production

## Database Management

### Backup
Simply copy the `data/clinic.db` file:
```bash
cp data/clinic.db data/clinic.backup.db
```

### Reset
Delete the database file and restart the server:
```bash
rm data/clinic.db
npm run dev
```

### Migration
The schema is automatically created on first run. For schema changes, modify `server/database.ts`.

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

This creates optimized production files in `dist/` directory.

### Production Server
You'll need to:
1. Build the frontend: `npm run build`
2. Serve static files from `dist/`
3. Run the backend: `node server/index.js` (after compiling TypeScript)
4. Use a process manager like PM2 for production

## Troubleshooting

### Port Already in Use
If port 3001 or 5173 is in use:
- Change the port in `server/index.ts` (backend)
- Change the port in `vite.config.ts` (frontend)
- Update `src/lib/api.ts` with new backend URL

### Database Locked
If you get "database is locked" errors:
- Close any other applications accessing the database
- Check for zombie processes
- Restart the server

### CORS Errors
If you get CORS errors:
- Verify the frontend is accessing `http://localhost:3001`
- Check CORS configuration in `server/index.ts`
- Ensure both servers are running

### JWT Token Issues
If authentication fails:
- Clear localStorage in browser
- Check JWT_SECRET matches in backend
- Verify token is being sent in Authorization header

## Benefits of SQLite Migration

1. **No External Dependencies**: Runs completely offline
2. **Simple Setup**: No cloud account or API keys needed
3. **Fast Performance**: Local database is very fast
4. **Easy Backup**: Just copy the database file
5. **Portable**: Database file can be moved between machines
6. **Cost**: Completely free, no cloud service fees
7. **Privacy**: All data stays on your local machine

## Limitations

1. **Single User at a Time**: SQLite doesn't handle high concurrency well
2. **No Horizontal Scaling**: Can't distribute across multiple servers
3. **Local Only**: Not suitable for distributed teams without VPN
4. **No Built-in Replication**: Requires manual backup strategy

## Migration from Old Version

If you were using the Supabase version:

1. Export your data from Supabase
2. Pull the latest code
3. Install new dependencies
4. Start the server (creates new database)
5. Import your data using the API endpoints

## Support

For issues or questions:
- Check the README.md for basic setup
- Review this migration guide
- Open an issue on GitHub
