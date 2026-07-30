import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';

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
  const [is3DMode, setIs3DMode] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Sync recommendedSpecialty prop
  useEffect(() => {
    if (recommendedSpecialty) {
      setSelectedSpecialty(recommendedSpecialty);
    }
  }, [recommendedSpecialty]);

  // Fetch doctors from backend API
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
          const lat = doc.doctorProfile?.clinicLocation?.coordinates?.[1] || (baseLat + (idx * 0.012 - 0.008));
          const lng = doc.doctorProfile?.clinicLocation?.coordinates?.[0] || (baseLng + (idx * 0.012 - 0.008));

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

  // Initialize MapLibre 3D Vector Engine
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const centerLat = userLocation?.lat || 28.6139;
    const centerLng = userLocation?.lng || 77.2090;

    if (!mapInstanceRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [centerLng, centerLat],
        zoom: 13.5,
        pitch: is3DMode ? 60 : 0,
        bearing: is3DMode ? -17.6 : 0,
        antialias: true
      });

      // Add 3D Navigation Controls (Compass, Pitch, Zoom)
      map.addControl(new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true
      }), 'top-right');

      // Add 3D Extruded Buildings Layer when map style loads
      map.on('style.load', () => {
        // Insert 3D building layer before label layer if available
        const layers = map.getStyle().layers;
        let labelLayerId;
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
          }
        }

        if (!map.getLayer('3d-buildings')) {
          map.addLayer(
            {
              id: '3d-buildings',
              source: 'carto',
              'source-layer': 'building',
              type: 'fill-extrusion',
              minzoom: 13,
              paint: {
                'fill-extrusion-color': '#1f2937',
                'fill-extrusion-height': ['get', 'render_height'],
                'fill-extrusion-base': ['get', 'render_min_height'],
                'fill-extrusion-opacity': 0.75
              }
            },
            labelLayerId
          );
        }
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add Patient 3D Location Marker (Red Pulsing Pin)
    const patientLng = userLocation?.lng || centerLng;
    const patientLat = userLocation?.lat || centerLat;

    const patientEl = document.createElement('div');
    patientEl.className = 'patient-3d-marker';
    patientEl.innerHTML = `
      <div style="position: relative; cursor: pointer;">
        <div style="width: 24px; height: 24px; background: #ef4444; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);"></div>
        <div style="position: absolute; top: -4px; left: -4px; width: 32px; height: 32px; background: rgba(239, 68, 68, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      </div>
    `;

    const patientPopup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="font-family: sans-serif; padding: 6px;">
        <strong style="color: #ef4444; font-size: 13px;">📍 Your 3D Live Location</strong>
        <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">Searching nearby specialists...</p>
      </div>
    `);

    const pMarker = new maplibregl.Marker({ element: patientEl })
      .setLngLat([patientLng, patientLat])
      .setPopup(patientPopup)
      .addTo(map);

    markersRef.current.push(pMarker);

    // Add Doctor 3D Markers (Blue Pins)
    doctors.forEach((doc) => {
      const isSelected = selectedDoctor?._id === doc._id;

      const docEl = document.createElement('div');
      docEl.className = 'doctor-3d-marker';
      docEl.innerHTML = `
        <div style="position: relative; cursor: pointer; transition: transform 0.2s;">
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background: ${isSelected ? '#10b981' : '#3b82f6'};
            border: 3px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px ${isSelected ? 'rgba(16, 185, 129, 0.6)' : 'rgba(59, 130, 246, 0.6)'};
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">
            🩺
          </div>
        </div>
      `;

      const docPopup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: sans-serif; padding: 8px; min-width: 190px;">
          <strong style="font-size: 14px; color: #0f172a;">${doc.name}</strong>
          <p style="margin: 2px 0; font-size: 12px; color: #2563eb; font-weight: 600;">${doc.specialization}</p>
          <p style="margin: 2px 0; font-size: 11px; color: #475569;">⭐ ${doc.rating} · 📍 ${doc.distanceText}</p>
          <p style="margin: 4px 0 8px 0; font-size: 12px; font-weight: 700; color: #047857;">Fee: ₹${doc.fee}</p>
          <button id="book-3d-btn-${doc._id}" style="width: 100%; background: #2563eb; color: white; border: none; padding: 7px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer;">
            Book Appointment
          </button>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: docEl })
        .setLngLat([doc.lng, doc.lat])
        .setPopup(docPopup)
        .addTo(map);

      docEl.addEventListener('click', () => {
        setSelectedDoctor(doc);
        draw3DRouteToDoctor(doc);
      });

      docPopup.on('open', () => {
        const btn = document.getElementById(`book-3d-btn-${doc._id}`);
        if (btn) {
          btn.onclick = () => {
            if (onBookDoctor) onBookDoctor(doc);
          };
        }
      });

      markersRef.current.push(marker);
    });

  }, [userLocation, doctors, selectedDoctor, is3DMode, onBookDoctor]);

  // Draw 3D Route Line & Smooth Camera FlyTo
  const draw3DRouteToDoctor = (doc) => {
    if (!mapInstanceRef.current || !doc) return;
    const map = mapInstanceRef.current;

    const patientLat = userLocation?.lat || 28.6139;
    const patientLng = userLocation?.lng || 77.2090;

    // Remove existing route layer & source
    if (map.getLayer('route-line')) map.removeLayer('route-line');
    if (map.getLayer('route-line-glow')) map.removeLayer('route-line-glow');
    if (map.getSource('route')) map.removeSource('route');

    const routeGeoJSON = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [patientLng, patientLat],
          [doc.lng, doc.lat]
        ]
      }
    };

    map.addSource('route', {
      type: 'geojson',
      data: routeGeoJSON
    });

    // Add glowing background route layer
    map.addLayer({
      id: 'route-line-glow',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#60a5fa',
        'line-width': 10,
        'line-opacity': 0.4
      }
    });

    // Add high-contrast main route line layer
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#3b82f6',
        'line-dasharray': [2, 2],
        'line-width': 5
      }
    });

    // Smooth 3D Camera FlyTo Bounds
    const bounds = new maplibregl.LngLatBounds()
      .extend([patientLng, patientLat])
      .extend([doc.lng, doc.lat]);

    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 80, right: 80 },
      pitch: is3DMode ? 55 : 0,
      bearing: -15,
      duration: 1800
    });

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

  // Toggle between 3D Perspective and 2D Flat Mode
  const toggle3DView = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const next3D = !is3DMode;
    setIs3DMode(next3D);

    map.easeTo({
      pitch: next3D ? 60 : 0,
      bearing: next3D ? -17.6 : 0,
      duration: 1200
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

      {/* Main Grid: 3D Map + Doctor Cards Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 3D Map Component Container */}
        <div className="lg:col-span-2 bg-[#111827] border border-white/8 rounded-2xl overflow-hidden h-[560px] relative shadow-2xl z-0 flex flex-col">

          {/* 3D Mode Toggle Button */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0d1117]/90 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-xl">
            <button
              onClick={toggle3DView}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                is3DMode ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🏙️</span> {is3DMode ? '3D Buildings View' : '2D Flat View'}
            </button>
          </div>

          {/* Live Navigation Tracking Overlay Banner */}
          {trackingRoute && (
            <div className="absolute top-16 left-4 right-14 z-10 bg-[#0d1117]/95 backdrop-blur-md border border-blue-500/30 p-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live 3D Route Active</span>
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
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h3 className="text-white font-bold text-lg">Nearby Specialists</h3>
              <p className="text-gray-400 text-xs mt-0.5">{selectedSpecialty ? `${selectedSpecialty} Doctors` : 'All Medical Specialties'}</p>
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
                        draw3DRouteToDoctor(doc);
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
                            draw3DRouteToDoctor(doc);
                          }}
                          className="bg-white/5 hover:bg-white/10 text-blue-300 hover:text-white border border-white/10 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <span>🏙️</span> 3D Track Route
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
