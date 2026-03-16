import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import Layout from '../components/Layout';

interface Patient {
  id: number;
  patient_id: string;
  first_name: string;
  last_name: string;
}

export default function VisitForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    patient_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'new_consultation',
    chief_complaint: '',
    // Visual Acuity
    va_od_distance: '6/6',
    va_os_distance: '6/6',
    va_od_near: 'N6',
    va_os_near: 'N6',
    // Refraction
    refraction_od_sphere: '',
    refraction_od_cylinder: '',
    refraction_od_axis: '',
    refraction_od_add: '',
    refraction_os_sphere: '',
    refraction_os_cylinder: '',
    refraction_os_axis: '',
    refraction_os_add: '',
    // IOP
    iop_od: '',
    iop_os: '',
    iop_method: 'Goldman',
    // Other
    pupil_od: 'PERRLA',
    pupil_os: 'PERRLA',
    color_vision: 'Normal',
    color_vision_test: 'Ishihara',
    examination_notes: '',
    // Diagnosis
    primary_diagnosis: '',
    icd_10_code: '',
    secondary_diagnosis: '',
    // Notes
    clinical_notes: '',
    patient_instructions: ''
  });

  useEffect(() => {
    loadPatients();
    if (id) {
      loadVisit();
    }
  }, [id]);

  const loadPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadVisit = async () => {
    try {
      const response = await api.get(`/visits/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error loading visit:', error);
      showMessage('error', 'Failed to load visit');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await api.put(`/visits/${id}`, formData);
        showMessage('success', 'Visit updated successfully');
      } else {
        await api.post('/visits', formData);
        showMessage('success', 'Visit created successfully');
      }
      setTimeout(() => navigate('/visits'), 1500);
    } catch (error: any) {
      console.error('Error saving visit:', error);
      showMessage('error', error.response?.data?.error || 'Failed to save visit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const commonDiagnoses = [
    'Myopia',
    'Hyperopia',
    'Astigmatism',
    'Presbyopia',
    'Cataract',
    'Glaucoma',
    'Diabetic Retinopathy',
    'Dry Eye Syndrome',
    'Conjunctivitis',
    'Corneal Ulcer',
    'Age-related Macular Degeneration'
  ];

  const visionOptions = ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'CF', 'HM', 'PL', 'NPL'];
  const nearVisionOptions = ['N6', 'N8', 'N10', 'N12', 'N18', 'N24', 'N36'];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {id ? 'Edit Visit' : 'New Visit / Consultation'}
          </h1>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Visit Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Visit Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_id} - {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="visit_date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="visit_type"
                  value={formData.visit_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new_consultation">New Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine_checkup">Routine Check-up</option>
                  <option value="post_operative">Post-operative</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chief Complaint <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Patient's main complaint in their own words..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Eye Examination */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Eye Examination</h2>

            {/* Visual Acuity */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Visual Acuity</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OD Distance</label>
                  <select
                    name="va_od_distance"
                    value={formData.va_od_distance}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {visionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OD Near</label>
                  <select
                    name="va_od_near"
                    value={formData.va_od_near}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {nearVisionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OS Distance</label>
                  <select
                    name="va_os_distance"
                    value={formData.va_os_distance}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {visionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OS Near</label>
                  <select
                    name="va_os_near"
                    value={formData.va_os_near}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {nearVisionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Refraction */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Refraction</h3>
              <div className="space-y-4">
                {/* Right Eye (OD) */}
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Right Eye (OD)</div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Sphere</label>
                      <input
                        type="number"
                        name="refraction_od_sphere"
                        value={formData.refraction_od_sphere}
                        onChange={handleChange}
                        step="0.25"
                        min="-20"
                        max="20"
                        placeholder="-2.50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Cylinder</label>
                      <input
                        type="number"
                        name="refraction_od_cylinder"
                        value={formData.refraction_od_cylinder}
                        onChange={handleChange}
                        step="0.25"
                        min="-10"
                        max="10"
                        placeholder="-1.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Axis</label>
                      <input
                        type="number"
                        name="refraction_od_axis"
                        value={formData.refraction_od_axis}
                        onChange={handleChange}
                        min="0"
                        max="180"
                        placeholder="90"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Add</label>
                      <input
                        type="number"
                        name="refraction_od_add"
                        value={formData.refraction_od_add}
                        onChange={handleChange}
                        step="0.25"
                        min="0"
                        max="4"
                        placeholder="+2.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Left Eye (OS) */}
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Left Eye (OS)</div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Sphere</label>
                      <input
                        type="number"
                        name="refraction_os_sphere"
                        value={formData.refraction_os_sphere}
                        onChange={handleChange}
                        step="0.25"
                        min="-20"
                        max="20"
                        placeholder="-3.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Cylinder</label>
                      <input
                        type="number"
                        name="refraction_os_cylinder"
                        value={formData.refraction_os_cylinder}
                        onChange={handleChange}
                        step="0.25"
                        min="-10"
                        max="10"
                        placeholder="-0.75"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Axis</label>
                      <input
                        type="number"
                        name="refraction_os_axis"
                        value={formData.refraction_os_axis}
                        onChange={handleChange}
                        min="0"
                        max="180"
                        placeholder="85"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Add</label>
                      <input
                        type="number"
                        name="refraction_os_add"
                        value={formData.refraction_os_add}
                        onChange={handleChange}
                        step="0.25"
                        min="0"
                        max="4"
                        placeholder="+2.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* IOP */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Intraocular Pressure (IOP)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OD (mmHg)</label>
                  <input
                    type="number"
                    name="iop_od"
                    value={formData.iop_od}
                    onChange={handleChange}
                    min="5"
                    max="50"
                    placeholder="18"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      formData.iop_od && parseInt(formData.iop_od) > 21 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                    }`}
                  />
                  {formData.iop_od && parseInt(formData.iop_od) > 21 && (
                    <p className="text-xs text-yellow-600 mt-1">⚠️ High IOP (Normal: 10-21 mmHg)</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OS (mmHg)</label>
                  <input
                    type="number"
                    name="iop_os"
                    value={formData.iop_os}
                    onChange={handleChange}
                    min="5"
                    max="50"
                    placeholder="17"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      formData.iop_os && parseInt(formData.iop_os) > 21 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                    }`}
                  />
                  {formData.iop_os && parseInt(formData.iop_os) > 21 && (
                    <p className="text-xs text-yellow-600 mt-1">⚠️ High IOP (Normal: 10-21 mmHg)</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    name="iop_method"
                    value={formData.iop_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Goldman">Goldman</option>
                    <option value="Non-contact">Non-contact</option>
                    <option value="Tonopen">Tonopen</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Other Examinations */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Other Examinations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pupil OD</label>
                  <input
                    type="text"
                    name="pupil_od"
                    value={formData.pupil_od}
                    onChange={handleChange}
                    placeholder="PERRLA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pupil OS</label>
                  <input
                    type="text"
                    name="pupil_os"
                    value={formData.pupil_os}
                    onChange={handleChange}
                    placeholder="PERRLA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Vision</label>
                  <select
                    name="color_vision"
                    value={formData.color_vision}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Defective">Defective</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Used</label>
                  <select
                    name="color_vision_test"
                    value={formData.color_vision_test}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ishihara">Ishihara</option>
                    <option value="Farnsworth">Farnsworth</option>
                    <option value="Hardy-Rand-Rittler">Hardy-Rand-Rittler</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Examination Notes</label>
                  <textarea
                    name="examination_notes"
                    value={formData.examination_notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Slit lamp findings, fundus examination, other observations..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Diagnosis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Diagnosis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Diagnosis <span className="text-red-500">*</span>
                </label>
                <select
                  name="primary_diagnosis"
                  value={formData.primary_diagnosis}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select diagnosis...</option>
                  {commonDiagnoses.map(diag => (
                    <option key={diag} value={diag}>{diag}</option>
                  ))}
                  <option value="Other">Other (specify in notes)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICD-10 Code (Optional)</label>
                <input
                  type="text"
                  name="icd_10_code"
                  value={formData.icd_10_code}
                  onChange={handleChange}
                  placeholder="e.g., H52.1 for Myopia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Diagnosis (Optional)</label>
                <textarea
                  name="secondary_diagnosis"
                  value={formData.secondary_diagnosis}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Additional diagnoses..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Clinical Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Clinical Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor's Notes</label>
                <textarea
                  name="clinical_notes"
                  value={formData.clinical_notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Private notes for doctor, observations, follow-up instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Instructions</label>
                <textarea
                  name="patient_instructions"
                  value={formData.patient_instructions}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Instructions given to patient, lifestyle modifications, when to return..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/visits')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>Save Visit</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
