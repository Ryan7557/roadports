import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Navigation, AlertTriangle, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import { RippleButton, RippleButtonRipples } from '@/components/animate-ui/components/buttons/ripple';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PotholeCardSkeleton, MapSkeleton } from './Skeletons';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SEVERITY_COLORS = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-400 text-gray-800',
  low: 'bg-gray-400 text-white',
};

const STATUS_COLORS = {
  reported: 'bg-red-100 text-red-700',
  verified: 'bg-indigo-100 text-indigo-700',
  assigned: 'bg-orange-100 text-orange-700',
  in_progress: 'bg-blue-100 text-blue-700',
  repaired: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-700',
};

const MARKER_COLORS = {
  reported: '#ef4444', 
  verified: '#6366f1', 
  assigned: '#f59e0b', 
  in_progress: '#3b82f6', 
  repaired: '#10b981', 
  rejected: '#9ca3af', 
};

const createMarkerIcon = (status) => {
  const color = MARKER_COLORS[status] || '#9ca3af';
  // A glowing pin icon indicating status
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${color}80;"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

const STATUS_OPTIONS = ['reported', 'verified', 'assigned', 'in_progress', 'repaired', 'rejected'];

// Create an exact URL path mapper assuming dev backend is running on 5001 or proxied.
const getImageUrl = (path) => {
  if (!path) return '';
  return path;
};

export default function Dashboard({ user }) {
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPotholes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/potholes');
      if (res.data?.success) {
        setPotholes(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch potholes.');
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const token = await user?.getIdToken();
      const res = await axios.delete(`/api/potholes/${deleteConfirmId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data?.success) {
        setPotholes(prev => prev.filter(p => p._id !== deleteConfirmId));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete pothole report');
      setDeleteConfirmId(null);
    }
  };



  const handleUpdateReporter = async (id, name, phone) => {
    try {
      const token = await user?.getIdToken();
      const res = await axios.put(`/api/potholes/${id}/reporter`, { name, phone }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data?.success) {
        setPotholes(prev => prev.map(p => p._id === id ? { ...p, reportedBy: { ...p.reportedBy, name, phone } } : p));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  useEffect(() => {
    fetchPotholes();
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">My Reports</h2>
          <p className="text-gray-500 mt-1 font-medium">Track the progress of your submitted pothole reports.</p>
        </div>
        <div className="flex items-center gap-4">
          <RippleButton
            onClick={fetchPotholes}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 border-gray-200 bg-white shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
            <RippleButtonRipples />
          </RippleButton>
        </div>
      </div>

      {/* Public Progress Map */}
      {loading && potholes.length === 0 ? (
        <MapSkeleton />
      ) : (
        <div className="w-full bg-white p-2 rounded-2xl shadow-xl border border-gray-200 mb-8 flex flex-col relative z-0 min-h-[300px]">
           <div className="bg-gray-900 text-white p-3 rounded-t-xl flex justify-between items-center z-10 w-full mb-2">
              <span className="font-bold tracking-wide uppercase text-sm">Live Incident Map</span>
              <div className="flex items-center gap-4">
                {lastUpdated && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
                <div className="flex gap-3">
                  {Object.entries(MARKER_COLORS).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-1.5 text-xs text-gray-300 font-medium capitalize">
                      <div style={{ backgroundColor: color }} className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"></div>
                      {status.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </div>
           </div>
           <div className="w-full h-[350px] rounded-b-xl overflow-hidden shadow-inner bg-gray-100 z-0 border border-gray-200">
             <MapContainer center={[-17.8248, 31.0530]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {potholes.map((p) => {
                   if (p.location?.coordinates?.length === 2) {
                     const [c0, c1] = p.location.coordinates;
                     
                     // GeoJSON stores [lng, lat]. Old data may have been saved as [lat, lng].
                     // Heuristic: if c0 is negative (like Harare lat ~-17) and c1 is positive and large 
                     // (like Harare lng ~31), the data was stored in wrong [lat, lng] order — use as-is for Leaflet.
                     // If c0 is positive and large (lng) and c1 is negative (lat), it is correct GeoJSON — swap for Leaflet.
                     let pos;
                     if (c0 < 0 && c1 > 0) {
                       // Stored as [lat, lng] — use directly since Leaflet wants [lat, lng]
                       pos = [c0, c1];
                     } else {
                       // Correct GeoJSON [lng, lat] — swap for Leaflet
                       pos = [c1, c0];
                     }
                     
                     // Determine if we should draw a heatmap-style radius
                     const severity = p.verification?.severity || 'low';
                     const isHotspot = severity === 'high' || severity === 'critical';
                     const radiusSize = severity === 'critical' ? 400 : 200;
                     const heatColor = severity === 'critical' ? '#ef4444' : '#f59e0b'; // red or orange
  
                     return (
                       <React.Fragment key={p._id}>
                         {isHotspot && (
                           <Circle 
                             center={pos} 
                             radius={radiusSize} 
                             pathOptions={{ color: heatColor, fillColor: heatColor, fillOpacity: 0.2, weight: 0 }} 
                           />
                         )}
                         <Marker position={pos} icon={createMarkerIcon(p.status)}>
                            <Popup>
                               <div className="text-sm font-semibold mb-1 uppercase tracking-tight">{p.address?.street || 'Unknown Street'}</div>
                               <div className="text-xs text-gray-500 mb-2">{p.address?.surburb || p.address?.city}</div>
                               <img src={getImageUrl(p.imageUrl)} className="w-[120px] h-16 object-cover rounded shadow border border-gray-200 mb-2"/>
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[p.status]}`}>
                                 {p.status.replace('_', ' ')}
                               </span>
                            </Popup>
                         </Marker>
                       </React.Fragment>
                     )
                   }
                   return null;
                })}
             </MapContainer>
           </div>
        </div>
      )}


      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      {loading && potholes.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <PotholeCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {potholes.map((p) => (
            <PotholeCard 
               key={p._id} 
               pothole={p} 
               onDelete={handleDelete} 
               onUpdateReporter={handleUpdateReporter}
            />
          ))}

          {!loading && potholes.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <CheckCircle className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium">No potholes have been recorded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Pothole Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pothole report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 sm:justify-end mt-4">
            <RippleButton 
              variant="outline" 
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 sm:flex-none"
            >
              Cancel
              <RippleButtonRipples />
            </RippleButton>
            <RippleButton 
              onClick={handleConfirmDelete}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete
              <RippleButtonRipples />
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PotholeCard({ pothole, onDelete, onUpdateReporter }) {
  const { imageUrl, address, verification, status, createdAt } = pothole;
  const severityStr = verification?.severity || 'low';
  const isAIConfirmed = verification?.isPothole;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(pothole.reportedBy?.name || '');
  const [phone, setPhone] = useState(pothole.reportedBy?.phone || '');

  const handleSaveProfile = () => {
    onUpdateReporter(pothole._id, name, phone);
    setOpen(false);
  };

  // Format Date string softly
  const dateObj = new Date(createdAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col relative group">

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
            {status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-gray-800 leading-tight flex items-start gap-1">
            {address?.street || 'Unknown Street Pin'}
          </h3>
          <div className="flex flex-col items-end gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <RippleButton variant="outline" className="h-7 px-3 text-xs flex items-center gap-1 border-gray-200">
                  Edit Profile
                  <RippleButtonRipples />
                </RippleButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor={`name-${pothole._id}`} className="text-right text-sm font-medium">Name</label>
                    <input
                      id={`name-${pothole._id}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor={`phone-${pothole._id}`} className="text-right text-sm font-medium">Phone</label>
                    <input
                      id={`phone-${pothole._id}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <RippleButton onClick={handleSaveProfile} className="w-full sm:w-auto">
                    Save
                    <RippleButtonRipples />
                  </RippleButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <RippleButton 
              variant="ghost" 
              onClick={() => onDelete(pothole._id)}
              className="h-7 px-2 text-xs flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
              Delete Report
              <RippleButtonRipples />
            </RippleButton>
          </div>
        </div>

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
