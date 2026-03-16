import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  patients?: any[];
  visits?: any[];
  appointments?: any[];
  prescriptions?: any[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const searchAPI = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults({});
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}&type=all&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || {});
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) {
        searchAPI(query);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchAPI]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleResultClick = (type: string, id: string) => {
    if (type === 'patient') {
      navigate(`/patients/${id}/edit`);
    } else if (type === 'visit') {
      navigate('/visits');
    } else if (type === 'appointment') {
      navigate('/appointments');
    }
    onClose();
  };

  if (!isOpen) return null;

  const totalResults =
    (results.patients?.length || 0) +
    (results.visits?.length || 0) +
    (results.appointments?.length || 0) +
    (results.prescriptions?.length || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[600px] flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients, visits, appointments..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button onClick={onClose} className="absolute right-3 top-3 text-gray-400">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && query.length >= 2 && totalResults === 0 && (
            <div className="text-center py-8 text-gray-500">No results found</div>
          )}

          {!loading && totalResults > 0 && (
            <div className="space-y-6">
              {results.patients && results.patients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Patients ({results.patients.length})</h3>
                  </div>
                  {results.patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleResultClick('patient', patient.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border mb-2"
                    >
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
