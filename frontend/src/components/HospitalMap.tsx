import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HospitalFacility } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLocationArrow, 
  faPhone, 
  faHospital, 
  faLocationDot 
} from '@fortawesome/free-solid-svg-icons';

interface HospitalMapProps {
  bystanderLat: number;
  bystanderLng: number;
  hospitals: HospitalFacility[];
  loading?: boolean;
}

const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="width:20px; height:20px; background:#059669; border:2.5px solid white; border-radius:50%; box-shadow:0 0 6px rgba(5,150,105,0.7);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const hospitalIcon = L.divIcon({
  className: 'custom-hospital-marker',
  html: `<div style="width:24px; height:24px; background:#dc2626; border:2px solid white; border-radius:6px; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:13px; box-shadow:0 2px 5px rgba(0,0,0,0.25);">✚</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

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
    <div className="space-y-3">
      {/* Map Box */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <MapContainer
          center={[bystanderLat, bystanderLng]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter lat={bystanderLat} lng={bystanderLng} />

          {/* User Location */}
          <Marker position={[bystanderLat, bystanderLng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-1 text-center font-sans">
                <p className="font-semibold text-xs text-emerald-800">Your Location</p>
                <p className="text-[10px] text-slate-500">
                  {bystanderLat.toFixed(4)}, {bystanderLng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Hospitals */}
          {hospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.lat, hospital.lng]}
              icon={hospitalIcon}
            >
              <Popup>
                <div className="p-1 font-sans max-w-xs">
                  <p className="font-bold text-xs text-slate-900">{hospital.name}</p>
                  {hospital.distanceKm !== undefined && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {hospital.distanceKm} km away
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded"
                  >
                    <span>Directions</span>
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 shadow-xs">
              <span className="w-3 h-3 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></span>
              Finding nearby emergency centers...
            </div>
          </div>
        )}
      </div>

      {/* Hospital List Cards */}
      <div className="space-y-2">
        {hospitals.length === 0 && !loading && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-500">
            No emergency clinics detected nearby. Use the encrypted emergency call relay to contact responders.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {hospitals.slice(0, 4).map((facility) => (
            <div
              key={facility.id}
              className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between hover:border-emerald-300 transition shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <h5 className="font-semibold text-xs text-slate-900 line-clamp-1">
                    {facility.name}
                  </h5>
                  {facility.distanceKm !== undefined && (
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {facility.distanceKm} km
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {facility.address || 'Emergency Department'}
                </p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                {facility.phone ? (
                  <a
                    href={`tel:${facility.phone}`}
                    className="text-[11px] font-medium text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faPhone} className="text-slate-400 text-xs" />
                    <span>{facility.phone}</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400">Emergency Unit</span>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-medium px-2 py-0.5 rounded transition shadow-xs"
                >
                  <FontAwesomeIcon icon={faLocationArrow} className="text-[9px]" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
