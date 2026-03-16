import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';

const Reports: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/billing/reports/summary', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Financial Reports</h1>
        
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Billed</p>
                  <p className="text-2xl font-bold">PKR {summary.total_billed?.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Collected</p>
                  <p className="text-2xl font-bold text-green-600">PKR {summary.total_collected?.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">PKR {summary.total_outstanding?.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
