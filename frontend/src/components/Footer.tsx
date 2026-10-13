import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldHalved, 
  faSuitcaseMedical, 
  faHeartPulse, 
  faTriangleExclamation 
} from '@fortawesome/free-solid-svg-icons';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-white text-slate-500 py-8 border-t border-slate-200 text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <FontAwesomeIcon icon={faSuitcaseMedical} />
            </div>
            <span className="font-bold text-slate-900 text-sm">ResQQR Medical ID</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
              AES-256 Encrypted
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>Free Emergency Service</span>
            <span className="text-slate-300">•</span>
            <span>Zero App Install Needed</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
          <p className="flex items-center gap-1">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500" />
            <span>In life-threatening situations, prioritize immediate emergency medical response.</span>
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>© {new Date().getFullYear()} ResQQR System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
