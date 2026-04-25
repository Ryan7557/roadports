import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Send, MapPin, Locate } from 'lucide-react';
import { RippleButton, RippleButtonRipples } from '@/components/animate-ui/components/buttons/ripple';
import axios from 'axios';

// Fix for default Leaflet marker icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map when coordinates change
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

const createContextIcon = () => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="background-color: #6b7280; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5); opacity: 0.8;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

// Intercepts map clicks to allow user to drop a pin manually
function MapClicker({ setCoords, reverseGeocode }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoords([lat, lng]);
      reverseGeocode(lat, lng);
    }
  });
  return null;
}

export default function FormStep({ file, verificationData, user, onSubmissionSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    street: '',
    surburb: '', // user's spelling
    city: '',
    province: '',
    country: 'Zimbabwe',
    name: '',
    phone: '',
    email: ''
  });

  const [coords, setCoords] = useState([-17.8248, 31.0530]); // Default Harare, Zimbabwe
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [nearbyPotholes, setNearbyPotholes] = useState([]);

  useEffect(() => {
    // Fetch reported potholes for map context
    const fetchContextPotholes = async () => {
      try {
        const res = await axios.get('/api/potholes');
        if (res.data?.success) {
          setNearbyPotholes(res.data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch nearby potholes for map context", err);
      }
    };
    fetchContextPotholes();
  }, []);

  // Geocode address when user stops typing for a moment
  useEffect(() => {
    const timer = setTimeout(() => {
      const { street, surburb, city } = formData;
      if (street || surburb || city) {
        geocodeAddress();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.street, formData.surburb, formData.city]);

  const geocodeAddress = async () => {
    const { street, surburb, city, province, country } = formData;
    const query = [street, surburb, city, province, country].filter(Boolean).join(', ');
    
    if (!query) return;
    
    setIsLocating(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      if (res.data && res.data.length > 0) {
        setCoords([parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)]);
      }
    } catch (err) {
      console.warn("Geocoding failed", err);
    } finally {
      setIsLocating(false);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    setIsLocating(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (res.data && res.data.address) {
        const addr = res.data.address;
        setFormData(prev => ({
          ...prev,
          street: addr.road || addr.street || addr.footway || '',
          surburb: addr.suburb || addr.neighbourhood || addr.village || '',
          city: addr.city || addr.town || addr.county || '',
          province: addr.state || addr.province || '',
          country: addr.country || 'Zimbabwe'
        }));
      }
    } catch (err) {
      console.warn("Reverse Geocoding failed", err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setError("Unable to retrieve your location. Please check your browser permissions.");
        setIsLocating(false);
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const form = new FormData();
      form.append('image', file);
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) form.append(key, formData[key]);
      });

      // Append AI verification data if present
      if (verificationData) {
        form.append('isPothole', verificationData.isPothole);
        form.append('confidenceScore', verificationData.confidenceScore);
        form.append('severity', verificationData.severity);
      }

      // Append raw coordinates in GeoJSON order [lng, lat] for MongoDB
      form.append('coordinates', JSON.stringify([coords[1], coords[0]]));

      // Append userId for auth associating
      if (user) form.append('userId', user.uid);

      // Get auth token
      const token = await user?.getIdToken();

      // Submit to backend
      const response = await axios.post('/api/potholes', form, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        onSubmissionSuccess(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 p-6 animate-in fade-in duration-500 bg-black text-white rounded-2xl">
      
      {/* Left: Map Preview */}
      <div className="w-full md:w-1/2 flex flex-col rounded-xl overflow-hidden shadow-2xl border border-white/10">
        <div className="bg-zinc-900 text-white p-4 flex justify-between items-center z-10 border-b border-white/5">
          <span className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-green" /> Selected Location</span>
          <div className="flex items-center gap-3">
            {isLocating && <span className="text-[10px] bg-green/20 text-green px-2 py-1 rounded-full animate-pulse uppercase font-black">Locating...</span>}
            <button type="button" onClick={handleLocateMe} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all">
              <Locate className="w-3.5 h-3.5" /> Locate Me
            </button>
          </div>
        </div>
        <div className="h-[400px] w-full z-0">
          <MapContainer center={coords} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Background Potholes */}
            {nearbyPotholes.map(p => {
               if(p.location?.coordinates?.length === 2 && p.status !== 'rejected' && p.status !== 'repaired') {
                 const pos = [p.location.coordinates[1], p.location.coordinates[0]];
                 return <Marker key={p._id} position={pos} icon={createContextIcon()} interactive={false} />
               }
               return null;
            })}

            {/* Currently Selected Pothole */}
            <Marker position={coords} zIndexOffset={1000} />
            
            <MapUpdater center={coords} />
            <MapClicker setCoords={setCoords} reverseGeocode={reverseGeocode} />
          </MapContainer>
        </div>
      </div>

      {/* Right: Address Form */}
      <div className="w-full md:w-1/2 flex flex-col">
          <h3 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase">Location Details</h3>
          <p className="text-gray-400 text-sm mb-6">Confirm the exact address where the road anomaly is located.</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Street *</label>
                <input 
                  required type="text" name="street" value={formData.street} onChange={handleChange}
                  className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green focus:border-green outline-none transition-all placeholder:text-zinc-600"
                  placeholder="123 Main Rd"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Suburb / City *</label>
                <input 
                  required type="text" name="city" value={formData.city} onChange={handleChange}
                  className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green focus:border-green outline-none transition-all placeholder:text-zinc-600"
                  placeholder="Sandton"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Province *</label>
                  <input 
                    required type="text" name="province" value={formData.province} onChange={handleChange}
                    className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green focus:border-green outline-none transition-all placeholder:text-zinc-600"
                    placeholder="Harare Province"
                  />
               </div>
               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Country</label>
                  <select 
                    name="country" 
                    value={formData.country} 
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value === 'South Africa') {
                        setCoords([-26.2041, 28.0473]); // Johannesburg
                      } else {
                        setCoords([-17.8248, 31.0530]); // Harare
                      }
                    }}
                    className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-green transition-all"
                  >
                    <option value="Zimbabwe">Zimbabwe</option>
                    <option value="South Africa">South Africa</option>
                  </select>
               </div>
            </div>

            <hr className="my-2 border-white/10" />
            
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Optional Contact Info</h4>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-green placeholder:text-zinc-600"
                  placeholder="Your Name"
                />
               </div>
               <div>
                <input 
                  type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-green placeholder:text-zinc-600"
                  placeholder="Phone Number"
                />
               </div>
               <div className="col-span-2">
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-green placeholder:text-zinc-600"
                  placeholder="Email Address (for status updates)"
                />
               </div>
            </div>

            <div className="flex gap-4 mt-6">
               <RippleButton 
                 type="button"
                 onClick={onCancel}
                 className="flex-1 py-6 px-4 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-xl transition-colors"
               >
                  <RippleButtonRipples />   
                  Cancel
               </RippleButton>
               <RippleButton 
                 disabled={isSubmitting}
                 type="submit"
                 className="flex-[2] py-6 px-4 bg-green text-white hover:bg-green/80 font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                  <RippleButtonRipples /> 
                  {isSubmitting ? (
                    <span className="animate-pulse">Saving Pothole...</span>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" /> Save Pothole</>
                  )}
               </RippleButton>
            </div>
            
          </form>
      </div>

    </div>
  );
}
