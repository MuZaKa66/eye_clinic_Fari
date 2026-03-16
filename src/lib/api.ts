const API_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  auth: {
    signup: async (email: string, password: string, fullName: string) => {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }
      return response.json();
    },

    login: async (email: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      return response.json();
    },

    logout: async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.json();
    }
  },

  patients: {
    getAll: async (search?: string) => {
      const url = new URL(`${API_URL}/patients`);
      if (search) url.searchParams.append('search', search);
      const response = await fetch(url.toString(), {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch patients');
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch patient');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create patient');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update patient');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete patient');
      return response.json();
    }
  },

  appointments: {
    getAll: async (filters?: { status?: string; date?: string }) => {
      const url = new URL(`${API_URL}/appointments`);
      if (filters?.status) url.searchParams.append('status', filters.status);
      if (filters?.date) url.searchParams.append('date', filters.date);
      const response = await fetch(url.toString(), {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch appointment');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create appointment');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update appointment');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete appointment');
      return response.json();
    }
  },

  visits: {
    getAll: async (patientId?: string) => {
      const url = new URL(`${API_URL}/visits`);
      if (patientId) url.searchParams.append('patient_id', patientId);
      const response = await fetch(url.toString(), {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch visits');
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/visits/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch visit');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_URL}/visits`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create visit');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_URL}/visits/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update visit');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/visits/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete visit');
      return response.json();
    }
  },

  bills: {
    getAll: async (filters?: { status?: string; patient_id?: string }) => {
      const url = new URL(`${API_URL}/bills`);
      if (filters?.status) url.searchParams.append('status', filters.status);
      if (filters?.patient_id) url.searchParams.append('patient_id', filters.patient_id);
      const response = await fetch(url.toString(), {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch bills');
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/bills/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch bill');
      return response.json();
    },

    create: async (data: any) => {
      const response = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create bill');
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`${API_URL}/bills/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update bill');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/bills/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete bill');
      return response.json();
    }
  },

  stats: {
    get: async () => {
      const response = await fetch(`${API_URL}/stats`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  },

  // Generic HTTP methods
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  },

  post: async (endpoint: string, data?: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  }
};
