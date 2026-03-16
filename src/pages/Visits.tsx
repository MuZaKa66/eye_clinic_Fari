import React, { useEffect, useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import Layout from '../components/Layout';
import { Visit } from '../types';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const Visits: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          patient:patients(*)
        `)
        .order('visit_date', { ascending: false })
        .order('visit_time', { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visits</h1>
            <p className="mt-2 text-gray-600">
              View and manage patient visit records
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Record Visit
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : visits.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">No visits recorded yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <ClipboardList className="w-6 h-6 text-green-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {visit.patient
                                ? `${visit.patient.first_name} ${visit.patient.last_name}`
                                : 'Unknown Patient'}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {format(new Date(`${visit.visit_date}T${visit.visit_time}`), 'MMM dd, yyyy h:mm a')}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Chief Complaint:</span>{' '}
                              {visit.chief_complaint}
                            </p>
                            {visit.diagnosis && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Diagnosis:</span>{' '}
                                {visit.diagnosis}
                              </p>
                            )}
                            {visit.treatment_plan && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Treatment Plan:</span>{' '}
                                {visit.treatment_plan}
                              </p>
                            )}
                            {visit.follow_up_date && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Follow-up:</span>{' '}
                                {format(new Date(visit.follow_up_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                          {visit.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{visit.notes}</p>
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

export default Visits;
