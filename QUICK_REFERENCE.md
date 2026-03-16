# Eye Clinic Management System - Quick Reference Card

## Instant Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start development server
npm run dev
```

## Essential URLs

- **Dev Server**: http://localhost:5173
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Documentation**: See README.md

## Project Structure at a Glance

```
project/
├── src/
│   ├── pages/          # 9 page components
│   ├── components/     # 3 reusable components
│   ├── lib/            # Auth & Supabase config
│   └── types/          # TypeScript definitions
├── public/             # Static assets
└── supabase-schema.sql # Database setup
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routing configuration |
| `src/lib/supabase.ts` | Database client |
| `src/lib/AuthContext.tsx` | Authentication logic |
| `src/types/index.ts` | All TypeScript types |
| `supabase-schema.sql` | Database schema |

## Pages & Routes

| Route | File | Purpose |
|-------|------|---------|
| `/login` | `Login.tsx` | User login |
| `/signup` | `Signup.tsx` | Registration |
| `/dashboard` | `Dashboard.tsx` | Main dashboard |
| `/patients` | `Patients.tsx` | Patient list |
| `/patients/new` | `PatientForm.tsx` | Add patient |
| `/patients/:id/edit` | `PatientForm.tsx` | Edit patient |
| `/appointments` | `Appointments.tsx` | Appointments |
| `/visits` | `Visits.tsx` | Visit records |
| `/billing` | `Billing.tsx` | Billing |
| `/settings` | `Settings.tsx` | Settings |

## Database Tables

1. **patients** - Patient records
2. **appointments** - Appointment scheduling
3. **visits** - Visit documentation
4. **examinations** - Eye exam results
5. **prescriptions** - Prescriptions
6. **bills** - Invoices
7. **bill_items** - Invoice line items
8. **payments** - Payment records

## Common Tasks

### Adding a New Page

1. Create file in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add link in `src/components/Sidebar.tsx` (if needed)

### Adding a New Component

1. Create file in `src/components/NewComponent.tsx`
2. Import and use in pages
3. Export from component if reusable

### Adding a TypeScript Type

1. Open `src/types/index.ts`
2. Add interface definition
3. Export the interface

### Querying Supabase

```typescript
// Fetch data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .order('created_at', { ascending: false });

// Insert
const { error } = await supabase
  .from('table_name')
  .insert([data]);

// Update
const { error } = await supabase
  .from('table_name')
  .update(data)
  .eq('id', id);

// Delete
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id);
```

## Styling Reference

### Custom CSS Classes

```css
.btn              /* Base button */
.btn-primary      /* Primary button (blue) */
.btn-secondary    /* Secondary button (gray) */
.btn-danger       /* Danger button (red) */
.input            /* Form input */
.label            /* Form label */
.card             /* Card container */
.card-header      /* Card header */
.card-body        /* Card body */
.table            /* Table */
.table-header     /* Table header */
.table-cell       /* Table cell */
```

### Tailwind Utilities

```html
<!-- Spacing -->
<div class="p-4">Padding</div>
<div class="m-4">Margin</div>
<div class="space-y-4">Vertical spacing</div>

<!-- Layout -->
<div class="flex items-center justify-between">Flexbox</div>
<div class="grid grid-cols-2 gap-4">Grid</div>

<!-- Colors -->
<div class="bg-primary-600 text-white">Primary</div>
<div class="text-gray-600">Text color</div>

<!-- Responsive -->
<div class="hidden lg:block">Desktop only</div>
<div class="block lg:hidden">Mobile only</div>
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

## NPM Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Troubleshooting Quick Fixes

### Issue: "Supabase credentials not found"
**Solution**: Check `.env` file exists and has correct variables

### Issue: Authentication not working
**Solution**:
1. Verify Supabase Email provider is enabled
2. Check API credentials are correct
3. Disable email confirmation for testing

### Issue: Database errors
**Solution**: Run `supabase-schema.sql` in Supabase SQL Editor

### Issue: TypeScript errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Styles not working
**Solution**:
1. Check `tailwind.config.js` paths
2. Verify `index.css` imports
3. Restart dev server

## Deployment Checklist

- [ ] Build passes: `npm run build`
- [ ] Environment variables set in hosting platform
- [ ] Database schema deployed to Supabase
- [ ] Supabase URL and keys configured
- [ ] Test authentication flow
- [ ] Test all major features
- [ ] Check responsive design
- [ ] Verify API endpoints work
- [ ] Test on different browsers

## Useful Supabase CLI Commands

```bash
# In Supabase Dashboard SQL Editor:

# View all patients
SELECT * FROM patients;

# View appointments for today
SELECT * FROM appointments
WHERE appointment_date = CURRENT_DATE;

# View pending bills
SELECT * FROM bills
WHERE status = 'pending';

# Get patient count
SELECT COUNT(*) FROM patients;
```

## Color Reference

```css
/* Primary Colors */
--primary-50:  #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Status Colors */
--success: #22c55e;
--warning: #eab308;
--error:   #ef4444;
--info:    #3b82f6;
```

## Icons (Lucide React)

```tsx
import {
  Eye,           // Logo
  Users,         // Patients
  Calendar,      // Appointments
  ClipboardList, // Visits
  DollarSign,    // Billing
  Settings,      // Settings
  Plus,          // Add
  Edit,          // Edit
  Search,        // Search
  LogOut         // Logout
} from 'lucide-react';
```

## Type Definitions Quick Reference

```typescript
// Main types in src/types/index.ts
Patient
Appointment
Visit
Examination
Prescription
Bill
BillItem
Payment
User
AuthContextType
DashboardStats
```

## Authentication Context Usage

```tsx
import { useAuth } from '../lib/AuthContext';

function Component() {
  const { user, signIn, signOut } = useAuth();

  // user.email
  // user.full_name
  // user.role
}
```

## Form Patterns

```tsx
// Standard form pattern
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // Submit logic
};
```

## Loading States

```tsx
const [loading, setLoading] = useState(false);

// In async function:
setLoading(true);
try {
  // API call
} finally {
  setLoading(false);
}

// In JSX:
{loading ? (
  <div className="animate-spin...">Loading</div>
) : (
  // Content
)}
```

## Error Handling Pattern

```tsx
const [error, setError] = useState('');

try {
  // Operation
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}

// In JSX:
{error && (
  <div className="bg-red-50 text-red-700">{error}</div>
)}
```

## Date Formatting

```tsx
import { format } from 'date-fns';

// Format date
format(new Date(), 'MMM dd, yyyy')      // Jan 01, 2024
format(new Date(), 'yyyy-MM-dd')        // 2024-01-01
format(new Date(), 'h:mm a')            // 2:30 PM
```

## Protected Route Pattern

```tsx
// Already implemented in Layout.tsx
const { user, loading } = useAuth();

if (loading) return <Loading />;
if (!user) return <Navigate to="/login" />;

return <>{children}</>;
```

## API Query Examples

```typescript
// With relations
.select(`
  *,
  patient:patients(*)
`)

// Filtering
.eq('status', 'pending')
.gte('created_at', startDate)
.order('created_at', { ascending: false })

// Count
.select('*', { count: 'exact', head: true })
```

## Git Workflow

```bash
# Initialize (if needed)
git init
git add .
git commit -m "Initial commit"

# Push to remote
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## Production Build

```bash
# Build
npm run build

# Output in 'dist' folder
# Deploy 'dist' to hosting service
```

## Getting Help

1. Check `README.md` for detailed docs
2. See `SETUP.md` for setup issues
3. Review `PROJECT_OVERVIEW.md` for architecture
4. Check `FEATURES.md` for feature list
5. Look at inline code comments

## Support

- Documentation: See all `.md` files
- Database: See `supabase-schema.sql`
- Types: See `src/types/index.ts`

---

**Quick Tip**: Start with the SETUP.md file for first-time setup!

**Version**: 1.0.0
**Last Updated**: 2026-03-16
