# Quick Setup Guide for Eye Clinic Management System

## Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Supabase Account** - [Sign up for free](https://supabase.com/)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /tmp/cc-agent/64734039/project
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com/) and create a new account (if you don't have one)
2. Create a new project
3. Wait for the project to be fully provisioned (this may take 1-2 minutes)

### 3. Create Database Tables

1. In your Supabase project dashboard, go to the **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the entire contents of `supabase-schema.sql` file from this project
4. Paste it into the SQL Editor
5. Click **Run** to execute the SQL script
6. You should see "Success. No rows returned" message

### 4. Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

### 5. Configure Environment Variables

1. In the project root, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key
   ```

### 6. Run the Application

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 7. Create Your First Account

1. Open your browser and go to `http://localhost:5173`
2. You'll be redirected to the login page
3. Click **Sign up** link
4. Create your account with:
   - Full name
   - Email address
   - Password (minimum 6 characters)
5. After successful signup, you'll be logged in and redirected to the dashboard

## Verify Everything is Working

1. **Dashboard** - You should see statistics cards (all showing 0 initially)
2. **Patients** - Click on Patients in the sidebar, then "Add Patient" to create a test patient
3. **Appointments** - Schedule a test appointment
4. **Navigation** - All menu items in the sidebar should be accessible

## Troubleshooting

### "Supabase credentials not found" warning in console

- Make sure your `.env` file is in the project root
- Check that variable names start with `VITE_`
- Restart the dev server after changing `.env`

### Database connection errors

- Verify your Supabase project is fully provisioned
- Check that you've run the `supabase-schema.sql` script
- Confirm your API credentials are correct

### Authentication not working

1. Go to Supabase Dashboard → Authentication → Providers
2. Make sure **Email** provider is enabled
3. Under Email Auth, disable **Confirm email** for testing (optional)

### Page shows "No rows returned" or empty data

- This is normal for a fresh installation
- Start by adding some test data through the UI

## Production Deployment

For deploying to production:

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory

3. Deploy to your preferred hosting service:
   - **Vercel**: `npm i -g vercel && vercel`
   - **Netlify**: Drag and drop `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)
   - **GitHub Pages**: Use GitHub Actions with the built files

4. Make sure to set environment variables in your hosting platform

## Next Steps

- Customize the theme colors in `tailwind.config.js`
- Add more features based on your clinic's needs
- Set up proper user roles and permissions
- Configure email notifications
- Add data backup strategies

## Need Help?

- Check the main `README.md` for detailed documentation
- Review the `supabase-schema.sql` file to understand the database structure
- Ensure all dependencies are installed correctly

## Security Notes for Production

- Enable email confirmation in Supabase Authentication settings
- Set up proper Row Level Security policies
- Use strong passwords for all accounts
- Enable 2FA for Supabase dashboard access
- Regularly backup your database
- Monitor error logs and usage patterns
