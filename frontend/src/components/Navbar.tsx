import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, PlusCircle, AlertCircle, Phone } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isScanView = location.pathname.startsWith('/scan/');

  if (isScanView) {
    return (
      <header className="no-print bg-red-600 text-white px-4 py-3 sticky top-0 z-50 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center font-bold">
              <HeartPulse className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight leading-none">Emergency Medical View</p>
              <p className="text-[11px] text-red-100 opacity-90 mt-0.5">Bystander / Responder Access</p>
            </div>
          </div>
          <a
            href="tel:911"
            className="inline-flex items-center gap-1.5 bg-white text-red-700 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg text-xs transition"
          >
            <Phone className="h-3.5 w-3.5" />
            Call 911 / 112
          </a>
        </div>
      </header>
    );
  }

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
            ✚
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            ResQ<span className="text-red-600">QR</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              location.pathname === '/'
                ? 'text-slate-900 bg-slate-100 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/#demo-scenarios"
            className="px-3 py-1.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            Demo Profiles
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-3.5 py-1.5 rounded-lg transition shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Medical ID</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

