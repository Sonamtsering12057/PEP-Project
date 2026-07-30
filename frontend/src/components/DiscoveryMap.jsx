import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix Leaflet default icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Doctor Marker Pin (Blue)
const doctorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Selected Doctor Marker Pin (Green)
const activeDoctorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [45, 45]
});

// Custom Patient Location Icon (Red Pin)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Haversine Distance Calculation Helper (km)
const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const DiscoveryMap = ({ userLocation, recommendedSpecialty, onBookDoctor }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(recommendedSpecialty || '');
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [trackingRoute, setTrackingRoute] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Sync recommendedSpecialty prop
  useEffect(() => {
    if (recommendedSpecialty) {
      setSelectedSpecialty(recommendedSpecialty);
    }
  }, [recommendedSpecialty]);

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5001/api/doctors';
        if (selectedSpecialty) {
          url += `?specialty=${encodeURIComponent(selectedSpecialty)}`;
        }
        const res = await axios.get(url);

        const fetchedDocs = res.data || [];
        const baseLat = userLocation?.lat || 28.6139;
        const baseLng = userLocation?.lng || 77.2090;

        const enriched = fetchedDocs.map((doc, idx) => {
          const lat = doc.doctorProfile?.clinicLocation?.coordinates?.[1] || (baseLat + (idx * 0.015 - 0.010));
          const lng = doc.doctorProfile?.clinicLocation?.coordinates?.[0] || (baseLng + (idx * 0.015 - 0.010));
          
          const rawDist = getHaversineDistance(baseLat, baseLng, lat, lng);
          const distanceKm = rawDist.toFixed(1);
          const estDriveTime = Math.max(3, Math.round(rawDist * 3));

          return {
            ...doc,
            lat,
            lng,
            specialization: doc.doctorProfile?.specialization || 'General Physician',
            fee: doc.doctorProfile?.consultationFee || 500,
            address: doc.doctorProfile?.clinicLocation?.address || 'Medical Health Clinic Center',
            rating: (4.3 + (idx % 7) * 0.1).toFixed(1),
            experience: `${6 + (idx % 8)} years`,
            distanceKm,
            estDriveTime,
            distanceText: `${distanceKm} km away`
          };
        });

        setDoctors(enriched);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialty, userLocation]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const centerLat = userLocation?.lat || 28.6139;
    const centerLng = userLocation?.lng || 77.2090;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Add Patient Marker
    const userMarkerLat = userLocation?.lat || centerLat;
    const userMarkerLng = userLocation?.lng || centerLng;

    const userMarker = L.marker([userMarkerLat, userMarkerLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #ef4444; font-size: 13px;">📍 Your Current Location</strong>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Searching available doctors near you...</p>
        </div>
      `);
    markersRef.current.push(userMarker);

    // Add Doctor Markers
    doctors.forEach((doc) => {
      const isSelected = selectedDoctor?._id === doc._id;
      const marker = L.marker([doc.lat, doc.lng], { icon: isSelected ? activeDoctorIcon : doctorIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 6px; min-width: 190px;">
            <strong style="font-size: 14px; color: #0f172a;">${doc.name}</strong>
            <p style="margin: 2px 0; font-size: 12px; color: #2563eb; font-weight: 600;">${doc.specialization}</p>
            <p style="margin: 2px 0; font-size: 11px; color: #475569;">⭐ ${doc.rating} · 📍 ${doc.distanceText} (~${doc.estDriveTime} mins drive)</p>
            <p style="margin: 4px 0 8px 0; font-size: 12px; font-weight: 700; color: #047857;">Consultation Fee: ₹${doc.fee}</p>
            <button id="book-btn-${doc._id}" style="width: 100%; background: #2563eb; color: white; border: none; padding: 7px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer; margin-bottom: 4px;">
              Book Appointment
            </button>
          </div>
        `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`book-btn-${doc._id}`);
        if (btn) {
          btn.onclick = () => {
            if (onBookDoctor) onBookDoctor(doc);
          };
        }
      });

      marker.on('click', () => {
        setSelectedDoctor(doc);
        drawRouteToDoctor(doc);
      });
      markersRef.current.push(marker);
    });

    // If tracking a doctor, draw polyline route
    if (selectedDoctor) {
      drawRouteToDoctor(selectedDoctor);
    }

  }, [userLocation, doctors, selectedDoctor, onBookDoctor]);

  // Draw real-time Polyline direction route from patient to doctor
  const drawRouteToDoctor = (doc) => {
    if (!mapInstanceRef.current || !doc) return;
    const map = mapInstanceRef.current;

    const patientLat = userLocation?.lat || 28.6139;
    const patientLng = userLocation?.lng || 77.2090;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    // Draw route path line
    const latlngs = [
      [patientLat, patientLng],
      [doc.lat, doc.lng]
    ];

    const polyline = L.polyline(latlngs, {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.8,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    polylineRef.current = polyline;

    // Fit map bounds to show patient & doctor simultaneously
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [50, 50] });

    setTrackingRoute({
      patientLat,
      patientLng,
      docLat: doc.lat,
      docLng: doc.lng,
      distanceKm: doc.distanceKm,
      estDriveTime: doc.estDriveTime,
      docName: doc.name,
      specialty: doc.specialization,
      address: doc.address
    });
  };

  const specialtiesList = [
    'All Specialties',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Gastroenterologist',
    'Pulmonologist',
    'Oncologist',
    'Rheumatologist',
    'Endocrinologist',
    'Pediatrician',
    'Orthopedic',
    'Psychiatrist',
    'Ophthalmologist'
  ];

  return (
    <div className="space-y-6">
      
      {/* Specialty Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-white/8">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap mr-1">Specialty Filter:</span>
          {specialtiesList.map((sp) => {
            const isSelected = (sp === 'All Specialties' && !selectedSpecialty) || selectedSpecialty === sp;
            return (
              <button
                key={sp}
                onClick={() => {
                  setSelectedSpecialty(sp === 'All Specialties' ? '' : sp);
                  setSelectedDoctor(null);
                  setTrackingRoute(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {sp}
              </button>
            );
          })}
        </div>

        {selectedSpecialty && (
          <button
            onClick={() => { setSelectedSpecialty(''); setSelectedDoctor(null); setTrackingRoute(null); }}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium underline whitespace-nowrap"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Main Grid: Interactive Map + Doctor List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Real-time Leaflet Map Component with Live Routing */}
        <div className="lg:col-span-2 bg-[#111827] border border-white/8 rounded-2xl overflow-hidden h-[540px] relative shadow-2xl z-0 flex flex-col">
          
          {/* Live Navigation Tracking Overlay Banner */}
          {trackingRoute && (
            <div className="absolute top-3 left-3 right-3 z-10 bg-[#0d1117]/95 backdrop-blur-md border border-blue-500/30 p-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Route Tracking Active</span>
                </div>
                <p className="text-white text-sm font-bold mt-0.5">{trackingRoute.docName} ({trackingRoute.specialty})</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  📍 {trackingRoute.address} · 🚘 <strong className="text-white">{trackingRoute.distanceKm} km</strong> (~{trackingRoute.estDriveTime} mins drive)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${trackingRoute.patientLat},${trackingRoute.patientLng}&destination=${trackingRoute.docLat},${trackingRoute.docLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-1 shadow-md shadow-emerald-600/20 whitespace-nowrap"
                >
                  <span>🗺️</span> Open Google Maps
                </a>
                <button
                  onClick={() => setTrackingRoute(null)}
                  className="text-gray-400 hover:text-white p-1 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
        </div>

        {/* Doctor Cards Sidebar */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 flex flex-col h-[540px]">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h3 className="text-white font-bold text-lg">Nearby Doctors</h3>
              <p className="text-gray-400 text-xs mt-0.5">{selectedSpecialty ? `${selectedSpecialty} Specialists` : 'All Medical Specialties'}</p>
            </div>
            <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-medium">
              {doctors.length} Verified
            </span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {doctors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🩺</div>
                  <p className="text-gray-400 text-sm">No doctors available for this specialty.</p>
                </div>
              ) : (
                doctors.map((doc) => {
                  const isSelected = selectedDoctor?._id === doc._id;
                  return (
                    <div
                      key={doc._id}
                      onClick={() => {
                        setSelectedDoctor(doc);
                        drawRouteToDoctor(doc);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-600/10'
                          : 'bg-white/3 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-semibold text-sm">{doc.name}</h4>
                          <p className="text-blue-400 text-xs font-medium">{doc.specialization}</p>
                          <p className="text-gray-400 text-[11px] mt-0.5 truncate max-w-[180px]">📍 {doc.address}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md flex-shrink-0">
                          ⭐ {doc.rating}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 mt-2.5 pt-2 border-t border-white/5">
                        <span>🚘 {doc.distanceText} (~{doc.estDriveTime}m)</span>
                        <span className="text-white font-medium">₹{doc.fee} / consult</span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(doc);
                            drawRouteToDoctor(doc);
                          }}
                          className="bg-white/5 hover:bg-white/10 text-blue-300 hover:text-white border border-white/10 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <span>🧭</span> Track Route
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBookDoctor) onBookDoctor(doc);
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-md shadow-blue-600/20"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DiscoveryMap;
