import React, { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import Layout from '../components/Layout';
import { Appointment } from '../types';
import { api } from '../lib/api';
import { format } from 'date-fns';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate]);

  const fetchAppointments = async () => {
    try {
      const data = await api.appointments.getAll(
        filterDate ? { date: filterDate } : undefined
      );
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      await api.appointments.update(id, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="mt-2 text-gray-600">
              Manage and schedule patient appointments
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            New Appointment
          </button>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">No appointments scheduled for this date</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary-100 p-3 rounded-lg">
                          <CalendarIcon className="w-6 h-6 text-primary-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patient
                              ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                              : 'Unknown Patient'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {format(new Date(`${appointment.appointment_date}T${appointment.appointment_time}`), 'h:mm a')} - {appointment.appointment_type}
                          </p>
                          {appointment.reason && (
                            <p className="text-sm text-gray-500 mt-1">
                              Reason: {appointment.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <select
                        value={appointment.status}
                        onChange={(e) =>
                          updateAppointmentStatus(appointment.id, e.target.value)
                        }
                        className="input py-2"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;
