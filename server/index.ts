import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import patientsRoutes from './routes/patients.js';
import appointmentsRoutes from './routes/appointments.js';
import visitsRoutes from './routes/visits.js';
import billsRoutes from './routes/bills.js';
import statsRoutes from './routes/stats.js';
import trackingRoutes from './routes/tracking.js';
import customFieldsRoutes from './routes/custom-fields.js';
import searchRoutes from './routes/search.js';
import billingRoutes from './routes/billing.js';
import rolesRoutes from './routes/roles.js';
import activityLogsRoutes from './routes/activity-logs.js';
import settingsRoutes from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';
import backupRoutes from './routes/backup.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/activity-logs', activityLogsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/backup', backupRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
