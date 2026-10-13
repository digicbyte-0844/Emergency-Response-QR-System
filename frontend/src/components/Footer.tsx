import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-white text-slate-500 py-8 border-t border-slate-200 text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
              ✚
            </div>
            <span className="font-semibold text-slate-900 text-sm">ResQQR Medical ID</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              AES-256 Encrypted
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Free & Open Emergency Utility</span>
            <span className="text-slate-300">•</span>
            <span>Zero App Install Required</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
          <p>© {new Date().getFullYear()} ResQQR System. In case of life-threatening emergency, always dial 911 or 112 first.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built for quick emergency response</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

