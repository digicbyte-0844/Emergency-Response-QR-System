import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HospitalFacility } from '../types';
import { Navigation, Phone, MapPin, Building2, ExternalLink } from 'lucide-react';

interface HospitalMapProps {
  bystanderLat: number;
  bystanderLng: number;
  hospitals: HospitalFacility[];
  loading?: boolean;
}

// Custom Leaflet DivIcons to prevent broken image assets in Vite
const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="position:relative; width:24px; height:24px; background:#2563eb; border:3px solid white; border-radius:50%; box-shadow:0 0 10px rgba(37,99,235,0.8);"><div style="position:absolute; inset:-6px; border-radius:50%; background:#3b82f6; opacity:0.4; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const hospitalIcon = L.divIcon({
  className: 'custom-hospital-marker',
  html: `<div style="width:28px; height:28px; background:#dc2626; border:2px solid white; border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:16px; box-shadow:0 2px 6px rgba(0,0,0,0.3); cursor:pointer;">✚</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Helper component to recenter map view when coordinates change
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

export const HospitalMap: React.FC<HospitalMapProps> = ({
  bystanderLat,
  bystanderLng,
  hospitals,
  loading = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <MapContainer
          center={[bystanderLat, bystanderLng]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter lat={bystanderLat} lng={bystanderLng} />

          {/* User Location Marker */}
          <Marker position={[bystanderLat, bystanderLng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-1 text-center font-sans">
                <p className="font-bold text-xs text-blue-700">📍 Incident / Bystander Location</p>
                <p className="text-[11px] text-slate-500">
                  {bystanderLat.toFixed(4)}, {bystanderLng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Hospital Markers */}
          {hospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.lat, hospital.lng]}
              icon={hospitalIcon}
            >
              <Popup>
                <div className="p-1 font-sans max-w-xs">
                  <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{hospital.name}</span>
                  </div>
                  {hospital.distanceKm !== undefined && (
                    <p className="text-[11px] text-slate-600 font-medium">
                      Distance: <strong>{hospital.distanceKm} km</strong> away
                    </p>
                  )}
                  {hospital.address && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{hospital.address}</p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold px-2 py-1 rounded hover:bg-red-700"
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></span>
              Scanning nearby trauma & emergency clinics...
            </div>
          </div>
        )}
      </div>

      {/* Hospital List Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold text-slate-700">
            Nearby Emergency Centers ({hospitals.length})
          </span>
          <span>OpenStreetMap & Overpass</span>
        </div>

        {hospitals.length === 0 && !loading && (
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No medical facilities detected within immediate radius. Call 911 for emergency dispatch.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {hospitals.slice(0, 6).map((facility) => (
            <div
              key={facility.id}
              className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-red-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                    {facility.name}
                  </h5>
                  {facility.distanceKm !== undefined && (
                    <span className="text-[10px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {facility.distanceKm} km
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{facility.address || facility.type}</span>
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {facility.phone ? (
                  <a
                    href={`tel:${facility.phone}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-red-600"
                  >
                    <Phone className="w-3 h-3 text-red-500" />
                    <span>{facility.phone}</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400">Emergency Unit</span>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition shadow-xs"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Navigate</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
