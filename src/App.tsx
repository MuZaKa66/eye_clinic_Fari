import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientForm from './pages/PatientForm';
import Appointments from './pages/Appointments';
import Visits from './pages/Visits';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Roles from './pages/Roles';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Patient Routes */}
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:id/edit" element={<PatientForm />} />

          {/* Other Routes */}
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/visits" element={<Visits />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<Settings />} />

          {/* Phase 6 Routes */}
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/activity-logs" element={<ActivityLogs />} />
          <Route path="/reports" element={<Reports />} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
