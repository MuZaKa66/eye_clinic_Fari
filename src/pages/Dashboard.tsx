import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import { DashboardStats } from '../types';
import { api } from '../lib/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingBills: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await api.stats.get();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      link: '/patients',
    },
    {
      name: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-green-500',
      link: '/appointments',
    },
    {
      name: 'Pending Bills',
      value: stats.pendingBills,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/billing',
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/billing',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's an overview of your clinic.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => (
                <Link
                  key={stat.name}
                  to={stat.link}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.name}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color}`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <Link
                      to="/patients/new"
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900">Add New Patient</h4>
                      <p className="text-sm text-gray-600">Register a new patient</p>
                    </Link>
                    <Link
                      to="/appointments/new"
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900">Schedule Appointment</h4>
                      <p className="text-sm text-gray-600">Book a new appointment</p>
                    </Link>
                    <Link
                      to="/visits/new"
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900">Record Visit</h4>
                      <p className="text-sm text-gray-600">Document a patient visit</p>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
