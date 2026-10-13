import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartPulse, 
  faPlus, 
  faPhone, 
  faSuitcaseMedical, 
  faShieldHalved,
  faQrcode
} from '@fortawesome/free-solid-svg-icons';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isScanView = location.pathname.startsWith('/scan/');

  if (isScanView) {
    return (
      <header className="no-print bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <FontAwesomeIcon icon={faHeartPulse} />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 tracking-tight leading-none">
                Emergency Medical ID
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                First Responder & Bystander Access
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs">
            <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600 text-xs" />
            <span>Caller ID Masked & Encrypted</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo - 30% Green Accent */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            <FontAwesomeIcon icon={faSuitcaseMedical} />
          </div>
          <div className="leading-none">
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              ResQ<span className="text-emerald-600">QR</span>
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">Medical ID Platform</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-3 text-sm">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              location.pathname === '/'
                ? 'text-emerald-800 bg-emerald-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <a
            href="/#demo-scenarios"
            className="px-3 py-1.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            Demo Profiles
          </a>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-1.5 rounded-lg transition shadow-xs text-xs sm:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span>Create Medical ID</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
