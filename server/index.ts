import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import patientsRoutes from './routes/patients.js';
import appointmentsRoutes from './routes/appointments.js';
import visitsRoutes from './routes/visits.js';
import billsRoutes from './routes/bills.js';
import statsRoutes from './routes/stats.js';

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
