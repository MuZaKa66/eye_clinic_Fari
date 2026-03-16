# Eye Clinic Management System - Tech Stack Specification

## Project Overview
A comprehensive clinic management system for an eye specialist, initially deployed on LAN (5 concurrent users), with future online deployment capability.

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui or Ant Design (for medical/dashboard interfaces)
- **State Management**: React Context API or Zustand
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **Icons**: Lucide React or Heroicons
- **Calendar**: React Big Calendar or FullCalendar

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **Validation**: Joi or Zod
- **CORS**: cors middleware

### Database
- **Primary**: SQLite3 (for LAN deployment)
- **Migration Path**: PostgreSQL (for future online deployment)
- **ORM/Query Builder**: Better-sqlite3 or Knex.js
- **Schema**: SQL with migration support

### File Storage
- **Location**: Local filesystem (`/uploads` directory)
- **Structure**: 
  - `/uploads/prescriptions/{patient_id}/{timestamp}.{ext}`
  - `/uploads/reports/{patient_id}/{timestamp}.{ext}`
- **Future**: MinIO or S3 for cloud deployment

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Vite
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

### Deployment (LAN)
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 16GB available
- **Process Manager**: PM2
- **Web Server**: Express (built-in)
- **Port**: 3000 (configurable)
- **Access**: http://[LAN-IP]:3000

## Key Technical Requirements

### Security
- Role-based access control (RBAC)
- Multi-role support (users can have multiple roles)
- Session management with JWT
- Secure password storage (bcrypt)
- Input validation and sanitization
- File upload validation (type, size)

### Performance
- Support 5 concurrent users
- Fast patient search (indexed database)
- Efficient image loading
- Optimistic UI updates

### Data Integrity
- Database transactions
- Foreign key constraints
- Data validation (frontend + backend)
- Automated backups

### Scalability
- Modular architecture
- Easy database migration path (SQLite → PostgreSQL)
- Stateless API design
- Configurable environment variables

## Architecture Pattern

**Client-Server Model**
```
React Frontend (Port 3000)
        ↓
   Express API (REST)
        ↓
   SQLite Database
        ↓
   Local File System
```

## Future Enhancements (Post-LAN)
- OCR for handwritten prescriptions (Tesseract.js)
- Cloud deployment (AWS/DigitalOcean)
- PostgreSQL migration
- S3 file storage
- Advanced analytics/reporting
- Telemedicine integration

## Development Approach
Build in phases using Bolt.new, with incremental feature addition while maintaining code consistency and testing at each stage.
