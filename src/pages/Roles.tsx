import React, { useState, useEffect } from 'react';
import { Shield, Plus } from 'lucide-react';
import Layout from '../components/Layout';

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setRoles(await response.json());
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Role Management</h1>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Role
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg capitalize">{role.role_name}</h3>
              </div>
              <p className="text-gray-600 text-sm">{role.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Roles;
