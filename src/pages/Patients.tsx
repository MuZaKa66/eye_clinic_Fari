import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import { Patient } from '../types';
import { api } from '../lib/api';
import { format } from 'date-fns';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await api.patients.getAll();
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchTerm) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="mt-2 text-gray-600">
              Manage all patient records and information
            </p>
          </div>
          <Link to="/patients/new" className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add Patient
          </Link>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <p className="text-gray-500">No patients found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Date of Birth</th>
                    <th className="table-header-cell">Phone</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Registered</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{patient.gender}</div>
                      </td>
                      <td className="table-cell">
                        {format(new Date(patient.date_of_birth), 'MMM dd, yyyy')}
                      </td>
                      <td className="table-cell">{patient.phone}</td>
                      <td className="table-cell">{patient.email || '-'}</td>
                      <td className="table-cell">
                        {format(new Date(patient.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/patients/${patient.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Patients;
