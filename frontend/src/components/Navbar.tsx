import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, HeartPulse, QrCode, PlusCircle, AlertTriangle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  // If inside emergency scan view, render minimalist emergency header
  const isScanView = location.pathname.startsWith('/scan/');

  if (isScanView) {
    return (
      <header className="no-print bg-red-700 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-white animate-pulse" />
          <span className="font-extrabold tracking-wider uppercase text-sm sm:text-base">
            Emergency Medical Response View
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:911"
            className="flex items-center gap-1.5 bg-white text-red-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase shadow hover:bg-red-50 transition"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Call 911 / 112
          </a>
        </div>
      </header>
    );
  }

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-200 group-hover:scale-105 transition transform">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <div className="font-black text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-1.5">
              ResQ<span className="text-red-600">QR</span>
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded uppercase">Emergency ID</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Bystander Response & Medical ID</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              location.pathname === '/'
                ? 'text-red-600 bg-red-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              location.pathname === '/dashboard'
                ? 'text-red-600 bg-red-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Profile</span>
          </Link>
          <Link
            to="/dashboard?tab=demos"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            <QrCode className="h-4 w-4" />
            <span>Live Demos</span>
          </Link>
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>AES-256 Encrypted</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
