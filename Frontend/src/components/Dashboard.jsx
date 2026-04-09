import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Navigation, AlertTriangle, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';

const SEVERITY_COLORS = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-400 text-gray-800',
  low: 'bg-gray-400 text-white',
};

const STATUS_COLORS = {
  reported: 'bg-blue-100 text-blue-700',
  verified: 'bg-indigo-100 text-indigo-700',
  dispatched: 'bg-yellow-100 text-yellow-700',
  repaired: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-700',
};

// Create an exact URL path mapper assuming dev backend is running on 5001 or proxied.
const getImageUrl = (path) => {
  if (!path) return '';
  // Vite proxies /uploads to the backend server
  return path;
};

export default function Dashboard() {
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPotholes = async () => {
    setLoading(true);
    setError('');
    try {
      // Vite proxies /api requests to the backend server
      const res = await axios.get('/api/potholes');
      if (res.data?.success) {
        setPotholes(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch potholes. Ensure the backend is active on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pothole report?')) return;
    
    try {
      const res = await axios.delete(`/api/potholes/${id}`);
      if (res.data?.success) {
        setPotholes(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete pothole report');
    }
  };

  useEffect(() => {
    fetchPotholes();
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Pothole Shield Dashboard</h2>
          <p className="text-gray-500 mt-1">Live overview of reported road anomalies across the city.</p>
        </div>
        <button 
          onClick={fetchPotholes} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 text-gray-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium flex items-center gap-2">
           <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      {loading && potholes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-green animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse font-medium">Fetching municipal records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {potholes.map((p) => (
             <PotholeCard key={p._id} pothole={p} onDelete={handleDelete} />
          ))}

          {!loading && potholes.length === 0 && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
               <CheckCircle className="w-12 h-12 text-gray-300 mb-2" />
               <p className="text-gray-500 font-medium">No potholes have been recorded yet.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

function PotholeCard({ pothole, onDelete }) {
  const { imageUrl, address, verification, status, createdAt } = pothole;
  const severityStr = verification?.severity || 'low';
  const isAIConfirmed = verification?.isPothole;
  
  // Format Date string softly
  const dateObj = new Date(createdAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col relative group">
      {/* Delete Button (Visible on Hover) */}
      <button 
        onClick={() => onDelete(pothole._id)}
        className="absolute top-3 left-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete Report"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img 
          src={getImageUrl(imageUrl)} 
          alt="Pothole"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Severity Badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded shadow-sm ${SEVERITY_COLORS[severityStr] || 'bg-gray-400 text-white'}`}>
             {severityStr} Severity
          </span>
        </div>

        {/* AI Verification Badge overlay */}
        <div className="absolute top-3 right-3">
          {isAIConfirmed ? (
            <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded shadow-md border border-green-600/20 backdrop-blur-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-tighter">AI Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded shadow-md border border-red-600/20 backdrop-blur-sm">
              <XCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-tighter">AI Rejected</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
             <Clock className="w-3.5 h-3.5" />
             {formattedDate}
          </div>
          
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
             {status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight flex items-start gap-1">
           {address?.street || 'Unknown Street Pin'}
        </h3>
        
        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1 mb-4">
           <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
           {address?.surburb || address?.city || 'Unknown Coordinates'}
        </div>
        
        <div className="mt-auto flex justify-between items-center bg-gray-50 -mx-5 -mb-5 px-5 py-3 border-t border-gray-100">
           <span className="text-xs font-medium text-gray-400 uppercase">
             AI Scan Result: <span className={isAIConfirmed ? 'text-green-600' : 'text-red-500'}>{isAIConfirmed ? 'Valid Pothole' : 'Rejected'}</span>
           </span>
           <span className="text-xs text-gray-400 font-semibold">
             {(verification?.confidenceScore * 100).toFixed(0)}% Confidence
           </span>
        </div>
      </div>
    </div>
  );
}
