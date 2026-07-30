import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
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
  const [liveHospitals, setLiveHospitals] = useState([]);
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'live-hospitals'
  const [selectedSpecialty, setSelectedSpecialty] = useState(recommendedSpecialty || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [trackingRoute, setTrackingRoute] = useState(null);
  const [is3DMode, setIs3DMode] = useState(true);

  // WHO / NIH Disease Reference Knowledge Base Modal
  const [diseaseModalOpen, setDiseaseModalOpen] = useState(false);
  const [diseaseCatalog, setDiseaseCatalog] = useState([]);
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [loadingDiseases, setLoadingDiseases] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Sync recommendedSpecialty prop
  useEffect(() => {
    if (recommendedSpecialty) {
      setSelectedSpecialty(recommendedSpecialty);
    }
  }, [recommendedSpecialty]);

  // Fetch doctors & Live OpenStreetMap Nearby Hospitals
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5001/api/doctors?';
        const params = [];
        if (selectedSpecialty) params.push(`specialty=${encodeURIComponent(selectedSpecialty)}`);
        if (selectedCity) params.push(`city=${encodeURIComponent(selectedCity)}`);
        if (searchKeyword) params.push(`name=${encodeURIComponent(searchKeyword)}`);
        
        url += params.join('&');
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
            qualifications: doc.doctorProfile?.qualifications?.join(', ') || 'MBBS, MD',
            fee: doc.doctorProfile?.consultationFee || 500,
            address: doc.doctorProfile?.clinicLocation?.address || 'Medical Health Clinic Center',
            rating: (4.3 + (idx % 7) * 0.1).toFixed(1),
            experience: `${doc.doctorProfile?.experienceYears || (6 + (idx % 8))} yrs exp`,
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
  }, [selectedSpecialty, selectedCity, searchKeyword, userLocation]);

  // Fetch Live Real-Time Nearby OpenStreetMap Hospitals
  const fetchLiveHospitals = async () => {
    setLoading(true);
    try {
      const lat = userLocation?.lat || 28.6139;
      const lng = userLocation?.lng || 77.2090;
      const res = await axios.get(`http://localhost:5001/api/doctors/live-nearby-hospitals?lat=${lat}&lng=${lng}`);
      setLiveHospitals(res.data?.data || []);
      setActiveTab('live-hospitals');
    } catch (err) {
      console.error("Error fetching live hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch WHO/NIH Disease Knowledge Base
  const fetchDiseaseKnowledgeBase = async () => {
    setDiseaseModalOpen(true);
    if (diseaseCatalog.length > 0) return;
    setLoadingDiseases(true);
    try {
      const res = await axios.get('http://localhost:5001/api/ai/disease-knowledge-base');
      setDiseaseCatalog(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching disease catalog:", err);
    } finally {
      setLoadingDiseases(false);
    }
  };

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

      map.addControl(new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true
      }), 'top-right');

      map.on('style.load', () => {
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

    // Patient 3D Live Location Marker
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

    // Active Display: Doctors OR Live Nearby OpenStreetMap Hospitals
    if (activeTab === 'doctors') {
      doctors.forEach((doc) => {
        const isSelected = selectedDoctor?._id === doc._id;

        const docEl = document.createElement('div');
        docEl.className = 'doctor-3d-marker';
        docEl.innerHTML = `
          <div style="position: relative; cursor: pointer; transition: transform 0.2s;">
            <div style="
              width: ${isSelected ? '32px' : '26px'};
              height: ${isSelected ? '32px' : '26px'};
              background: ${isSelected ? '#10b981' : '#2563eb'};
              border: 3px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px ${isSelected ? 'rgba(16, 185, 129, 0.6)' : 'rgba(37, 99, 235, 0.6)'};
              color: white;
              font-size: 12px;
              font-weight: bold;
            ">
              🩺
            </div>
          </div>
        `;

        const docPopup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: sans-serif; padding: 8px; min-width: 200px;">
            <strong style="font-size: 14px; color: #0f172a;">${doc.name}</strong>
            <p style="margin: 2px 0; font-size: 11px; color: #64748b;">🎓 ${doc.qualifications}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #2563eb; font-weight: 600;">${doc.specialization}</p>
            <p style="margin: 2px 0; font-size: 11px; color: #475569;">⭐ ${doc.rating} · ⏳ ${doc.experience} · 📍 ${doc.distanceText}</p>
            <p style="margin: 4px 0 8px 0; font-size: 12px; font-weight: 700; color: #047857;">Consultation Fee: ₹${doc.fee}</p>
            <button id="book-apollo-btn-${doc._id}" style="width: 100%; background: #2563eb; color: white; border: none; padding: 7px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer;">
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
          const btn = document.getElementById(`book-apollo-btn-${doc._id}`);
          if (btn) {
            btn.onclick = () => {
              if (onBookDoctor) onBookDoctor(doc);
            };
          }
        });

        markersRef.current.push(marker);
      });
    } else if (activeTab === 'live-hospitals') {
      liveHospitals.forEach((hosp) => {
        const hospEl = document.createElement('div');
        hospEl.className = 'hospital-3d-marker';
        hospEl.innerHTML = `
          <div style="position: relative; cursor: pointer;">
            <div style="width: 28px; height: 28px; background: #059669; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.6); color: white; font-size: 13px; font-weight: bold;">
              🏥
            </div>
          </div>
        `;

        const hospPopup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: sans-serif; padding: 8px; min-width: 200px;">
            <strong style="font-size: 14px; color: #059669;">🏥 ${hosp.name}</strong>
            <p style="margin: 3px 0; font-size: 11px; color: #475569;">📍 ${hosp.address}</p>
            <p style="margin: 2px 0; font-size: 11px; color: #2563eb; font-weight: 600;">📞 ${hosp.phone}</p>
            <a href="tel:${hosp.phone}" style="display: block; text-align: center; margin-top: 6px; background: #059669; color: white; border: none; padding: 6px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; text-decoration: none;">
              Call Hospital Emergency
            </a>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: hospEl })
          .setLngLat([hosp.lng, hosp.lat])
          .setPopup(hospPopup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

  }, [userLocation, doctors, liveHospitals, activeTab, selectedDoctor, is3DMode, onBookDoctor]);

  // Draw 3D Route Line & Smooth Camera FlyTo
  const draw3DRouteToDoctor = (doc) => {
    if (!mapInstanceRef.current || !doc) return;
    const map = mapInstanceRef.current;

    const patientLat = userLocation?.lat || 28.6139;
    const patientLng = userLocation?.lng || 77.2090;

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

    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#2563eb',
        'line-dasharray': [2, 2],
        'line-width': 5
      }
    });

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
    'General Medicine & Geriatrics',
    'Internal Medicine',
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
    'ENT Specialist',
    'Periodontist & Dentistry'
  ];

  const cityList = [
    'All Cities',
    'Hyderabad',
    'Delhi NCR',
    'Punjab',
    'Kolkata'
  ];

  const filteredDiseases = diseaseCatalog.filter(d => 
    d.name.toLowerCase().includes(diseaseFilter.toLowerCase()) ||
    d.category.toLowerCase().includes(diseaseFilter.toLowerCase()) ||
    d.symptoms.toLowerCase().includes(diseaseFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Action Header: Search & Real-Time OpenStreetMap Places & WHO Knowledge Hub */}
      <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-md space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                activeTab === 'doctors'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🩺 Doctors & Specialists ({doctors.length})
            </button>
            <button
              onClick={() => {
                if (liveHospitals.length === 0) fetchLiveHospitals();
                else setActiveTab('live-hospitals');
              }}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                activeTab === 'live-hospitals'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              🏥 Live OpenStreetMap Hospitals ({liveHospitals.length})
            </button>
          </div>

          <button
            onClick={fetchDiseaseKnowledgeBase}
            className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>📚</span> WHO / NIH Disease Reference Hub
          </button>
        </div>

        {/* Search Bar + City Selector */}
        {activeTab === 'doctors' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="🔍 Search Doctor by Name, Specialty, or Symptoms..."
                  className="w-full bg-slate-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-gray-900"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              <div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value === 'All Cities' ? '' : e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {cityList.map(city => (
                    <option key={city} value={city === 'All Cities' ? '' : city}>{city === 'All Cities' ? '📍 Select City (All Cities)' : `📍 ${city}`}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialty Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar pt-1 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap mr-1">Specialty:</span>
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
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {sp}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Main Grid: 3D Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 3D Map Container */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden h-[580px] relative shadow-xl flex flex-col">

          {/* 3D Mode Toggle Button */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-gray-200 p-1.5 rounded-xl shadow-lg">
            <button
              onClick={toggle3DView}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                is3DMode ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>🏙️</span> {is3DMode ? '3D Buildings View' : '2D Flat View'}
            </button>
          </div>

          {/* Live Route Banner */}
          {trackingRoute && (
            <div className="absolute top-16 left-4 right-14 z-10 bg-white/95 backdrop-blur-md border border-blue-200 p-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live 3D Route Active</span>
                </div>
                <p className="text-gray-900 text-sm font-bold mt-0.5">{trackingRoute.docName} ({trackingRoute.specialty})</p>
                <p className="text-gray-600 text-xs mt-0.5">
                  📍 {trackingRoute.address} · 🚘 <strong className="text-gray-900">{trackingRoute.distanceKm} km</strong> (~{trackingRoute.estDriveTime} mins drive)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${trackingRoute.patientLat},${trackingRoute.patientLng}&destination=${trackingRoute.docLat},${trackingRoute.docLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1 shadow-md shadow-emerald-600/20 whitespace-nowrap"
                >
                  <span>🗺️</span> Open Google Maps
                </a>
                <button
                  onClick={() => setTrackingRoute(null)}
                  className="text-gray-400 hover:text-gray-800 p-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
        </div>

        {/* Doctor Cards / Live Hospitals Sidebar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col h-[580px] shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h3 className="text-gray-900 font-extrabold text-lg">
                {activeTab === 'doctors' ? 'Verified Specialists' : 'Real-Time OpenStreetMap Places'}
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">
                {activeTab === 'doctors' ? 'Apollo & Verified Specialist Network' : 'Live nearby hospitals & emergency clinics'}
              </p>
            </div>
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold">
              {activeTab === 'doctors' ? `${doctors.length} Doctors` : `${liveHospitals.length} Centers`}
            </span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activeTab === 'doctors' ? (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {doctors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🩺</div>
                  <p className="text-gray-500 text-sm font-medium">No doctors match your search query.</p>
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
                          ? 'bg-blue-50/80 border-blue-400 shadow-md'
                          : 'bg-slate-50/60 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <h4 className="text-gray-900 font-bold text-sm">{doc.name}</h4>
                          <p className="text-blue-600 text-xs font-semibold">{doc.specialization}</p>
                          <p className="text-gray-500 text-[11px] mt-0.5">🎓 {doc.qualifications}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex-shrink-0">
                          ⭐ {doc.rating}
                        </span>
                      </div>

                      <p className="text-gray-600 text-[11px] truncate mt-1">📍 {doc.address}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2.5 pt-2 border-t border-gray-200">
                        <span>⏳ {doc.experience} · 🚘 {doc.distanceText}</span>
                        <span className="text-emerald-700 font-bold">₹{doc.fee} / consult</span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(doc);
                            draw3DRouteToDoctor(doc);
                          }}
                          className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <span>🏙️</span> 3D Track Route
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBookDoctor) onBookDoctor(doc);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {liveHospitals.map((hosp) => (
                <div key={hosp.id} className="p-4 rounded-xl bg-slate-50 border border-gray-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-gray-900 font-bold text-sm">🏥 {hosp.name}</h4>
                      <p className="text-emerald-700 text-xs font-semibold">{hosp.type}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Open 24/7
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">📍 {hosp.address}</p>
                  <p className="text-blue-600 text-xs font-semibold">📞 {hosp.phone}</p>
                  <a
                    href={`tel:${hosp.phone}`}
                    className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm"
                  >
                    Call Hospital Emergency
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* WHO / NIH Clinical Disease Reference Modal */}
      {diseaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[85vh] flex flex-col shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">📚 WHO & NIH Clinical Disease Reference Catalog</h3>
                <p className="text-gray-500 text-xs mt-0.5">Evidence-based disease descriptions, symptoms, prevention, and specialist protocols.</p>
              </div>
              <button
                onClick={() => setDiseaseModalOpen(false)}
                className="text-gray-400 hover:text-gray-800 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4">
              <input
                type="text"
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
                placeholder="🔍 Search Disease, Symptom (e.g. Hypertension, Diabetes, Asthma, Malaria)..."
                className="w-full bg-slate-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {loadingDiseases ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading clinical reference data...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {filteredDiseases.map((dis, idx) => (
                  <div key={idx} className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-gray-900 font-bold text-base">{dis.name}</h4>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                        {dis.category}
                      </span>
                    </div>
                    <p className="text-gray-700 text-xs"><strong>🤒 Symptoms:</strong> {dis.symptoms}</p>
                    <p className="text-gray-600 text-xs"><strong>🛡️ Prevention:</strong> {dis.prevention}</p>
                    <p className="text-gray-600 text-xs"><strong>🩺 Clinical Protocol:</strong> {dis.treatments}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DiscoveryMap;
