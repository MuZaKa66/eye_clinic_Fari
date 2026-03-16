import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { Prescription, Visit, Patient } from '../types';

const PrescriptionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  const [formData, setFormData] = useState<Partial<Prescription>>({
    prescription_type: 'eyeglasses',
    issued_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchPatients();
    if (isEditMode && id) {
      fetchPrescription(id);
    }
  }, [id, isEditMode]);

  const fetchPatients = async () => {
    try {
      const data = await api.patients.getAll();
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchVisits = async (patientId: string) => {
    try {
      const data = await api.get(`/visits?patient_id=${patientId}`);
      setVisits(data || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
  };

  const fetchPrescription = async (prescriptionId: string) => {
    try {
      const data = await api.get(`/prescriptions/${prescriptionId}`);
      setFormData(data);
      if (data.patient_id) {
        await fetchVisits(data.patient_id);
      }
    } catch (error) {
      console.error('Error fetching prescription:', error);
    }
  };

  const handlePatientChange = async (patientId: string) => {
    setFormData({ ...formData, patient_id: patientId, visit_id: '' });
    await fetchVisits(patientId);
  };

  const handleVisitChange = async (visitId: string) => {
    setFormData({ ...formData, visit_id: visitId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && id) {
        await api.put(`/prescriptions/${id}`, formData);
      } else {
        await api.post('/prescriptions', formData);
      }
      navigate('/prescriptions');
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Prescription, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/prescriptions')}
              className="btn btn-secondary"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Edit Prescription' : 'New Prescription'}
              </h1>
              <p className="mt-2 text-gray-600">
                {isEditMode ? 'Update prescription details' : 'Create a new prescription for a patient'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Prescription Information</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>
                  <select
                    required
                    value={formData.patient_id || ''}
                    onChange={(e) => handlePatientChange(e.target.value)}
                    className="input"
                    disabled={isEditMode}
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit (Optional)
                  </label>
                  <select
                    value={formData.visit_id || ''}
                    onChange={(e) => handleVisitChange(e.target.value)}
                    className="input"
                    disabled={!formData.patient_id}
                  >
                    <option value="">Select Visit</option>
                    {visits.map((visit) => (
                      <option key={visit.id} value={visit.id}>
                        {new Date(visit.visit_date).toLocaleDateString()} - {visit.chief_complaint}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription Type *
                  </label>
                  <select
                    required
                    value={formData.prescription_type || 'eyeglasses'}
                    onChange={(e) => handleChange('prescription_type', e.target.value as any)}
                    className="input"
                  >
                    <option value="eyeglasses">Eyeglasses</option>
                    <option value="contact_lenses">Contact Lenses</option>
                    <option value="medication">Medication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issued Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.issued_date || ''}
                    onChange={(e) => handleChange('issued_date', e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date || ''}
                    onChange={(e) => handleChange('expiry_date', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>

          {(formData.prescription_type === 'eyeglasses' || formData.prescription_type === 'contact_lenses') && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Refraction Details</h2>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Right Eye (OD)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sphere
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={formData.od_sphere || ''}
                        onChange={(e) => handleChange('od_sphere', parseFloat(e.target.value))}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cylinder
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={formData.od_cylinder || ''}
                        onChange={(e) => handleChange('od_cylinder', parseFloat(e.target.value))}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Axis (°)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={formData.od_axis || ''}
                        onChange={(e) => handleChange('od_axis', parseInt(e.target.value))}
                        className="input"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={formData.od_add || ''}
                        onChange={(e) => handleChange('od_add', parseFloat(e.target.value))}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Left Eye (OS)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sphere
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={formData.os_sphere || ''}
                        onChange={(e) => handleChange('os_sphere', parseFloat(e.target.value))}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cylinder
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={formData.os_cylinder || ''}
                        onChange={(e) => handleChange('os_cylinder', parseFloat(e.target.value))}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Axis (°)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={formData.os_axis || ''}
                        onChange={(e) => handleChange('os_axis', parseInt(e.target.value))}
                        className="input"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={formData.os_add || ''}
                        onChange={(e) => handleChange('os_add', parseFloat(e.target.value))}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pupillary Distance (PD) - mm
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.pd || ''}
                    onChange={(e) => handleChange('pd', parseFloat(e.target.value))}
                    className="input"
                    placeholder="63.0"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.prescription_type === 'medication' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Medication Details</h2>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.medication_name || ''}
                    onChange={(e) => handleChange('medication_name', e.target.value)}
                    className="input"
                    placeholder="e.g., Timolol 0.5% Eye Drops"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={formData.dosage || ''}
                      onChange={(e) => handleChange('dosage', e.target.value)}
                      className="input"
                      placeholder="e.g., 1 drop"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={formData.frequency || ''}
                      onChange={(e) => handleChange('frequency', e.target.value)}
                      className="input"
                      placeholder="e.g., Twice daily"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={(e) => handleChange('duration', e.target.value)}
                      className="input"
                      placeholder="e.g., 30 days"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Instructions</h2>
            </div>
            <div className="card-body">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.instructions || ''}
                  onChange={(e) => handleChange('instructions', e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Any special instructions or notes..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/prescriptions')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isEditMode ? 'Update' : 'Create'} Prescription
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PrescriptionForm;
