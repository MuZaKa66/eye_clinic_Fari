import React, { useEffect, useState } from 'react';
import { Plus, DollarSign, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import { Bill } from '../types';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const Billing: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchBills();
  }, [filterStatus]);

  const fetchBills = async () => {
    try {
      let query = supabase
        .from('bills')
        .select(`
          *,
          patient:patients(*)
        `)
        .order('bill_date', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
            <p className="mt-2 text-gray-600">
              Manage invoices and payment records
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create Invoice
          </button>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <label className="label">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : bills.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">No bills found</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Bill Date</th>
                    <th className="table-header-cell">Patient</th>
                    <th className="table-header-cell">Total Amount</th>
                    <th className="table-header-cell">Paid Amount</th>
                    <th className="table-header-cell">Balance</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="table-cell">
                        {format(new Date(bill.bill_date), 'MMM dd, yyyy')}
                        {bill.due_date && (
                          <div className="text-xs text-gray-500">
                            Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="table-cell">
                        {bill.patient
                          ? `${bill.patient.first_name} ${bill.patient.last_name}`
                          : 'Unknown Patient'}
                      </td>
                      <td className="table-cell font-medium">
                        ${bill.total_amount.toFixed(2)}
                      </td>
                      <td className="table-cell">
                        ${bill.paid_amount.toFixed(2)}
                      </td>
                      <td className="table-cell font-medium text-gray-900">
                        ${bill.balance.toFixed(2)}
                      </td>
                      <td className="table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            bill.status
                          )}`}
                        >
                          {bill.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Billed</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    ${bills.reduce((sum, bill) => sum + bill.total_amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    ${bills.reduce((sum, bill) => sum + bill.paid_amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="mt-2 text-2xl font-bold text-red-600">
                    ${bills.reduce((sum, bill) => sum + bill.balance, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Billing;
