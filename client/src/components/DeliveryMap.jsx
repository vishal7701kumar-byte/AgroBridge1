import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function DeliveryMap({
  pickupLocation,
  deliveryLocation,
  driverLocation,
  estimatedDistanceKm = 4.2,
  estimatedTimeMinutes = 12
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const farmLat = pickupLocation?.latitude || 23.4000;
  const farmLon = pickupLocation?.longitude || 77.4300;
  const custLat = deliveryLocation?.latitude || 23.2185;
  const custLon = deliveryLocation?.longitude || 77.4320;
  const driverLat = driverLocation?.latitude || 23.2800;
  const driverLon = driverLocation?.longitude || 77.4100;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // 1. Farmer Pickup Marker (Green)
    const farmIcon = L.divIcon({
      className: 'custom-farm-pin',
      html: `
        <div style="background:#059669; color:white; width:40px; height:40px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(5,150,105,0.7); border:2.5px solid white; font-size:18px;">
          🌾
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const farmMarker = L.marker([farmLat, farmLon], { icon: farmIcon }).addTo(map);
    farmMarker.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#059669;">🌾 Farm Origin (Pickup)</strong><br/>
        ${pickupLocation?.address || 'Patel Organic Farms, Berasia Road'}
      </div>
    `);

    // 2. Customer Delivery Marker (Teal)
    const custIcon = L.divIcon({
      className: 'custom-cust-pin',
      html: `
        <div style="background:#0d9488; color:white; width:40px; height:40px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(13,148,136,0.7); border:2.5px solid white; font-size:18px;">
          🏠
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const custMarker = L.marker([custLat, custLon], { icon: custIcon }).addTo(map);
    custMarker.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#0d9488;">🏠 Delivery Destination</strong><br/>
        ${deliveryLocation?.address || 'Arera Colony, Bhopal'}
      </div>
    `);

    // 3. Driver Live Marker (Amber)
    const driverIcon = L.divIcon({
      className: 'custom-driver-pin',
      html: `
        <div style="background:#d97706; color:white; width:44px; height:44px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(217,119,6,0.8); border:3px solid white; font-size:20px; animation:pulse 2s infinite;">
          🚚
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const driverMarker = L.marker([driverLat, driverLon], { icon: driverIcon }).addTo(map);
    driverMarker.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#d97706;">🚚 Live Driver Partner</strong><br/>
        En route with fresh produce<br/>
        <strong>ETA: ~${estimatedTimeMinutes} mins</strong> (${estimatedDistanceKm} km)
      </div>
    `);
    driverMarkerRef.current = driverMarker;

    // Polyline connecting points
    const routePoints = [
      [farmLat, farmLon],
      [driverLat, driverLon],
      [custLat, custLon]
    ];

    const polyline = L.polyline(routePoints, {
      color: '#10b981',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 6'
    }).addTo(map);
    polylineRef.current = polyline;

    // Fit bounds
    const bounds = L.latLngBounds([
      [farmLat, farmLon],
      [driverLat, driverLon],
      [custLat, custLon]
    ]);
    map.fitBounds(bounds, { padding: [45, 45] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Driver Marker Position when driverLocation changes (e.g. from polling)
  useEffect(() => {
    if (!mapInstanceRef.current || !driverMarkerRef.current) return;

    driverMarkerRef.current.setLatLng([driverLat, driverLon]);

    // Update polyline
    if (polylineRef.current) {
      polylineRef.current.setLatLngs([
        [farmLat, farmLon],
        [driverLat, driverLon],
        [custLat, custLon]
      ]);
    }
  }, [driverLat, driverLon, farmLat, farmLon, custLat, custLon]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />

      {/* Floating Legend / Attribution */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-lg">
          <span>🌾</span>
          <span>Farm Origin</span>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-[11px] font-bold text-amber-400 flex items-center gap-1.5 shadow-lg">
          <span className="animate-bounce">🚚</span>
          <span>Live Driver</span>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-[11px] font-bold text-teal-400 flex items-center gap-1.5 shadow-lg">
          <span>🏠</span>
          <span>Your Doorstep</span>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 z-[400] px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-[10px] text-slate-400 border border-slate-800">
        Estimated Delivery Route • OpenStreetMap
      </div>
    </div>
  );
}
