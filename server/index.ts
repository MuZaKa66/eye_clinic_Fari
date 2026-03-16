import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import patientsRoutes from './routes/patients';
import appointmentsRoutes from './routes/appointments';
import visitsRoutes from './routes/visits';
import billsRoutes from './routes/bills';
import statsRoutes from './routes/stats';
import trackingRoutes from './routes/tracking';
import customFieldsRoutes from './routes/custom-fields';
import searchRoutes from './routes/search';
import billingRoutes from './routes/billing';
import rolesRoutes from './routes/roles';
import activityLogsRoutes from './routes/activity-logs';
import settingsRoutes from './routes/settings';
import dashboardRoutes from './routes/dashboard';
import backupRoutes from './routes/backup';
import prescriptionsRoutes from './routes/prescriptions';
import uploadsRoutes from './routes/uploads';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/uploads', uploadsRoutes);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`LAN access available at http://<your-ip>:${PORT}`);
});
