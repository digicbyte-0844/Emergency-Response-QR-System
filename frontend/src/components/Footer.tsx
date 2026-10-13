import React from 'react';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              ResQ<span className="text-red-500">QR</span> Medical ID
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Designed for critical 3-second triage response. Provides first responders and Good Samaritan
              bystanders with instant access to blood type, severe allergies, and emergency contacts.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Privacy & Security</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Zero unencrypted database keys in QR codes
              </p>
              <p className="text-slate-400">
                Data is encrypted using AES-256-CBC cipher with unique initialization vectors. Only vital emergency
                rescue information is exposed during scans.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Emergency Protocol</h4>
            <ul className="space-y-1.5 text-xs">
              <li>• Always call local emergency services (911/112) first.</li>
              <li>• Administer CPR only if trained or guided by emergency dispatch.</li>
              <li>• Epinephrine autoinjectors should be administered promptly for anaphylaxis.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ResQQR Emergency Response System. Free & Open Medical Utility.</p>
          <div className="flex items-center gap-1">
            <span>Engineered for saving lives</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
};
