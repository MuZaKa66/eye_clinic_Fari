import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Appointment } from '../types';
import { api } from '../lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const AppointmentCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      const data = await api.appointments.getAll();
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt =>
      isSameDay(new Date(apt.appointment_date), day)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-600 border-b">
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-primary-600 font-bold' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${getStatusColor(apt.status)}`}
                    onClick={() => navigate('/appointments')}
                  >
                    <div className="font-medium truncate">
                      {format(new Date(`${apt.appointment_date}T${apt.appointment_time}`), 'h:mm a')}
                    </div>
                    <div className="truncate">
                      {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Unknown'}
                    </div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);

    return (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-1 min-w-[1000px]">
          <div className="p-2 border-b font-semibold text-gray-600">Time</div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toString()} className={`p-2 text-center border-b ${isToday ? 'bg-primary-50' : ''}`}>
                <div className={`font-semibold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-sm ${isToday ? 'text-primary-600 font-bold' : 'text-gray-600'}`}>
                  {format(day, 'MMM d')}
                </div>
              </div>
            );
          })}

          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="p-2 text-sm text-gray-600 border-r">
                {format(new Date().setHours(hour, 0), 'h:mm a')}
              </div>
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDay(day).filter(apt => {
                  const aptHour = new Date(`${apt.appointment_date}T${apt.appointment_time}`).getHours();
                  return aptHour === hour;
                });

                return (
                  <div key={`${day}-${hour}`} className="p-1 border min-h-[60px]">
                    {dayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`text-xs p-1 rounded border mb-1 cursor-pointer hover:shadow-sm ${getStatusColor(apt.status)}`}
                        onClick={() => navigate('/appointments')}
                      >
                        <div className="font-medium">
                          {format(new Date(`${apt.appointment_date}T${apt.appointment_time}`), 'h:mm a')}
                        </div>
                        <div className="truncate">
                          {apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Calendar</h1>
            <p className="mt-2 text-gray-600">
              View and manage appointments in calendar format
            </p>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Appointment
          </button>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPreviousMonth}
                  className="btn btn-secondary p-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="btn btn-secondary p-2"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="btn btn-secondary"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Today
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('month')}
                  className={`px-4 py-2 rounded-lg ${
                    view === 'month'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded-lg ${
                    view === 'week'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span className="text-gray-600">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-gray-600">Cancelled</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : view === 'month' ? (
              renderMonthView()
            ) : (
              renderWeekView()
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentCalendar;
