import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, AlertCircle } from 'lucide-react';

export default function LocationPickerMap({
  initialLat = 23.2185,
  initialLon = 77.4320,
  initialAddress = 'Arera Colony, Bhopal, MP',
  onLocationSelect
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lon: initialLon });
  const [addressName, setAddressName] = useState(initialAddress);
  const [geoError, setGeoError] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lon],
      zoom: 14,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom HTML pin icon for customer delivery
    const customerIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="background:#0d9488; color:white; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(13,148,136,0.6); border:2px solid white; font-size:18px;">
          🏠
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    const marker = L.marker([coords.lat, coords.lon], {
      icon: customerIcon,
      draggable: true
    }).addTo(map);

    marker.bindPopup('<b>Delivery Dropoff Location</b><br>Drag pin or tap anywhere on map.').openPopup();

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const newLat = Math.round(pos.lat * 10000) / 10000;
      const newLon = Math.round(pos.lng * 10000) / 10000;
      setCoords({ lat: newLat, lon: newLon });
      if (onLocationSelect) {
        onLocationSelect({
          latitude: newLat,
          longitude: newLon,
          address: addressName
        });
      }
    });

    map.on('click', (e) => {
      const newLat = Math.round(e.latlng.lat * 10000) / 10000;
      const newLon = Math.round(e.latlng.lng * 10000) / 10000;
      marker.setLatLng([newLat, newLon]);
      setCoords({ lat: newLat, lon: newLon });
      if (onLocationSelect) {
        onLocationSelect({
          latitude: newLat,
          longitude: newLon,
          address: addressName
        });
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Use Browser Geolocation
  const handleUseCurrentLocation = () => {
    setLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please tap location on map.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        setCoords({ lat, lon });
        setLocating(false);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 16);
          markerRef.current.setLatLng([lat, lon]);
          markerRef.current.bindPopup('<b>Current Device Location</b>').openPopup();
        }

        if (onLocationSelect) {
          onLocationSelect({
            latitude: lat,
            longitude: lon,
            address: addressName
          });
        }
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        setGeoError('GPS permission unavailable. Please drag or tap on the map to set your address pin.');
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      {/* Geolocation action button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Pin Location on OpenStreetMap</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Lat: <strong className="font-mono text-emerald-300">{coords.lat}</strong>, Lon: <strong className="font-mono text-emerald-300">{coords.lon}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
        <div ref={mapContainerRef} className="w-full h-72 sm:h-80 z-0" />
        <div className="absolute bottom-2 right-2 z-[400] bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-400">
          OpenStreetMap • Free Direct Routing
        </div>
      </div>
    </div>
  );
}
