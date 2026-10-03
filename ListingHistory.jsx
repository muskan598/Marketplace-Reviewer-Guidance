import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingHistory, getListing } from '../services/api';
import { Clock, User, FileText } from 'lucide-react';

function ListingHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [listingData, historyData] = await Promise.all([
        getListing(id),
        getListingHistory(id)
      ]);
      setListing(listingData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      created: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      edited: 'bg-yellow-100 text-yellow-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Listing History</h2>
        {listing && (
          <p className="mt-1 text-sm text-gray-500">
            {listing.title}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto text-gray-400" size={48} />
            <p className="mt-2 text-gray-500">No history available</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {history.map((entry, index) => (
                <li key={entry.id}>
                  <div className="relative pb-8">
                    {index !== history.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <Clock className="text-white" size={16} />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(entry.action)}`}>
                              {entry.action.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <User size={14} className="mr-1" />
                              {entry.user}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {entry.user_notes && (
                          <p className="mt-2 text-sm text-gray-700">
                            {entry.user_notes}
                          </p>
                        )}
                        {entry.original_data && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 mb-1">Changes:</p>
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(entry.revised_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ListingHistory;
