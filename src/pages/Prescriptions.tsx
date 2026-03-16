import React, { useEffect, useState } from 'react';
import { Plus, FileText, Eye, Pill, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Prescription } from '../types';
import { api } from '../lib/api';
import { format } from 'date-fns';

const Prescriptions: React.FC = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = await api.get('/prescriptions');
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesType = filterType === 'all' || prescription.prescription_type === filterType;
    const matchesSearch = searchQuery === '' ||
      (prescription.patient_id && prescription.patient_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getPrescriptionIcon = (type: string) => {
    switch (type) {
      case 'eyeglasses':
      case 'contact_lenses':
        return <Eye className="w-6 h-6 text-blue-700" />;
      case 'medication':
        return <Pill className="w-6 h-6 text-green-700" />;
      default:
        return <FileText className="w-6 h-6 text-gray-700" />;
    }
  };

  const getPrescriptionTypeLabel = (type: string) => {
    switch (type) {
      case 'eyeglasses':
        return 'Eyeglasses';
      case 'contact_lenses':
        return 'Contact Lenses';
      case 'medication':
        return 'Medication';
      default:
        return type;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
            <p className="mt-2 text-gray-600">
              Manage patient prescriptions for eyeglasses, contact lenses, and medications
            </p>
          </div>
          <button
            onClick={() => navigate('/prescriptions/new')}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Prescription
          </button>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by patient ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input"
                >
                  <option value="all">All Types</option>
                  <option value="eyeglasses">Eyeglasses</option>
                  <option value="contact_lenses">Contact Lenses</option>
                  <option value="medication">Medication</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">
                {searchQuery || filterType !== 'all'
                  ? 'No prescriptions match your filters'
                  : 'No prescriptions issued yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/prescriptions/${prescription.id}/edit`)}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          {getPrescriptionIcon(prescription.prescription_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getPrescriptionTypeLabel(prescription.prescription_type)}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {format(new Date(prescription.issued_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Patient ID:</span>{' '}
                              {prescription.patient_id}
                            </p>

                            {prescription.prescription_type === 'medication' && prescription.medication_name && (
                              <>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Medication:</span>{' '}
                                  {prescription.medication_name}
                                </p>
                                {prescription.dosage && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Dosage:</span>{' '}
                                    {prescription.dosage} - {prescription.frequency}
                                  </p>
                                )}
                                {prescription.duration && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Duration:</span>{' '}
                                    {prescription.duration}
                                  </p>
                                )}
                              </>
                            )}

                            {(prescription.prescription_type === 'eyeglasses' ||
                              prescription.prescription_type === 'contact_lenses') && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="text-sm">
                                  <span className="font-medium">OD:</span>{' '}
                                  {prescription.od_sphere !== undefined && `SPH ${prescription.od_sphere > 0 ? '+' : ''}${prescription.od_sphere}`}
                                  {prescription.od_cylinder !== undefined && ` CYL ${prescription.od_cylinder > 0 ? '+' : ''}${prescription.od_cylinder}`}
                                  {prescription.od_axis !== undefined && ` × ${prescription.od_axis}°`}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">OS:</span>{' '}
                                  {prescription.os_sphere !== undefined && `SPH ${prescription.os_sphere > 0 ? '+' : ''}${prescription.os_sphere}`}
                                  {prescription.os_cylinder !== undefined && ` CYL ${prescription.os_cylinder > 0 ? '+' : ''}${prescription.os_cylinder}`}
                                  {prescription.os_axis !== undefined && ` × ${prescription.os_axis}°`}
                                </div>
                              </div>
                            )}

                            {prescription.expiry_date && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Expires:</span>{' '}
                                {format(new Date(prescription.expiry_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>

                          {prescription.instructions && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{prescription.instructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
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

export default Prescriptions;
