import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api';
import { PublicEmergencyProfile } from '../types';
import { 
  Printer, 
  ArrowLeft, 
  Smartphone, 
  ShieldCheck 
} from 'lucide-react';

export const CardPreview: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [patient, setPatient] = useState<PublicEmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.getScanProfile(token)
      .then((data) => {
        setPatient(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load card profile');
        setLoading(false);
      });
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 text-xs">Preparing printable medical card...</div>;
  }

  if (error || !patient || !token) {
    return (
      <div className="p-12 text-center text-red-600 text-xs">
        Medical card not found. <Link to="/dashboard" className="underline font-semibold">Return to dashboard</Link>
      </div>
    );
  }

  const scanUrl = `${window.location.origin}/scan/${token}`;
  const primaryContact = patient.emergencyContacts.find((c) => c.isPrimary) || patient.emergencyContacts[0];
  const secondaryContact = patient.emergencyContacts.find((c) => !c.isPrimary);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header - Hidden during print */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Printable Medical ID Card
            </h1>
            <p className="text-xs text-slate-500">
              Standard wallet card size (85.6mm × 54mm). Cut along the dotted line after printing.
            </p>
          </div>

          <div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg transition text-xs shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Wallet Card</span>
            </button>
          </div>
        </div>

        {/* Printable Card Container */}
        <div className="print-card-container space-y-6">
          <div className="text-center no-print">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Front & Back Card Preview
            </span>
          </div>

          {/* Cards Front & Back */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            
            {/* FRONT OF CARD */}
            <div className="w-[340px] h-[214px] bg-white rounded-xl border border-dashed border-slate-300 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden select-none">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-red-500 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                    ✚
                  </div>
                  <span className="font-bold text-xs text-red-600 tracking-wide uppercase">
                    EMERGENCY MEDICAL ID
                  </span>
                </div>
                <div className="bg-red-50 text-red-700 border border-red-200 font-bold text-xs px-2 py-0.5 rounded">
                  Blood {patient.bloodType}
                </div>
              </div>

              {/* Core Information */}
              <div className="my-auto space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    {patient.fullName}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {patient.age ? `${patient.age} yrs` : ''} {patient.gender ? `• ${patient.gender}` : ''}
                  </span>
                </div>

                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="text-[11px] bg-red-50 text-red-800 p-1.5 rounded border border-red-200">
                    <span className="font-bold uppercase text-[9px] block text-red-700">Allergies:</span>
                    <span className="font-semibold truncate block">{patient.allergies.join(', ')}</span>
                  </div>
                )}

                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <div className="text-[10px] text-slate-600 font-medium truncate">
                    <strong>Conditions:</strong> {patient.chronicConditions.join(', ')}
                  </div>
                )}
              </div>

              {/* Contact Footer */}
              <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between text-[10px]">
                {primaryContact ? (
                  <div>
                    <span className="font-semibold text-slate-500 uppercase text-[9px] block">Emergency Contact:</span>
                    <span className="font-bold text-slate-900">{primaryContact.name} ({primaryContact.relationship})</span>
                    <span className="font-semibold text-red-600 block">{primaryContact.phone}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Call 911 / 112</span>
                )}
                <span className="text-[9px] font-semibold text-slate-400 uppercase">FRONT</span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="w-[340px] h-[214px] bg-white rounded-xl border border-dashed border-slate-300 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden select-none">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-semibold text-[10px] uppercase tracking-wide text-slate-600">
                  SCAN FOR MEDICAL DETAILS
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase">BACK</span>
              </div>

              {/* QR and Instructions */}
              <div className="my-auto flex items-center gap-3">
                <div className="bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                  <QRCodeSVG
                    value={scanUrl}
                    size={84}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="space-y-1 text-[10px] text-slate-600 leading-tight">
                  <p className="font-bold text-red-600 uppercase text-[10px]">
                    SCAN WITH ANY SMARTPHONE CAMERA
                  </p>
                  <p>
                    Instant access to complete vitals, active medications, doctor info, and location beacon.
                  </p>
                  {secondaryContact && (
                    <p className="pt-0.5 text-[9px] text-slate-500">
                      <strong>Secondary:</strong> {secondaryContact.name} ({secondaryContact.phone})
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                <span>ResQQR Medical Protocol</span>
                <span>Encrypted • AES-256</span>
              </div>
            </div>

          </div>

          {/* Tips - Hidden during print */}
          <div className="no-print bg-white p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2.5 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
              Usage Tips:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-800 mb-0.5">1. Wallet Card</p>
                <p className="text-[11px] text-slate-500">
                  Print on standard paper or cardstock, cut along lines, and place in wallet.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-800 mb-0.5">2. Clear Phone Case</p>
                <p className="text-[11px] text-slate-500">
                  Slip behind a clear phone case so it's always accessible even if battery dies.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-800 mb-0.5">3. Backpack / Gear</p>
                <p className="text-[11px] text-slate-500">
                  Great for running belts, cycling helmets, gym bags, and school backpacks.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
