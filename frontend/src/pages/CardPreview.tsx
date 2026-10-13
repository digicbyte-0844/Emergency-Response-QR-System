import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api';
import { PublicEmergencyProfile } from '../types';
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  HeartPulse, 
  Download, 
  Smartphone, 
  Check,
  Phone,
  AlertTriangle
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
      .catch((err) => {
        setError('Failed to load card profile');
        setLoading(false);
      });
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Preparing high-resolution printable card...</div>;
  }

  if (error || !patient || !token) {
    return (
      <div className="p-12 text-center text-red-600">
        Medical card not found. <Link to="/dashboard" className="underline font-bold">Return to dashboard</Link>
      </div>
    );
  }

  const scanUrl = `${window.location.origin}/scan/${token}`;
  const primaryContact = patient.emergencyContacts.find((c) => c.isPrimary) || patient.emergencyContacts[0];
  const secondaryContact = patient.emergencyContacts.find((c) => !c.isPrimary);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Controls - Hidden during print */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Printable Emergency Wallet Card & Badge
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard ISO/IEC 7810 ID-1 card dimensions (85.6mm x 54mm) ready for wallet, lanyard, or backpack.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition text-xs uppercase tracking-wider"
            >
              <Printer className="w-4 h-4" />
              <span>Print Wallet Card (A4/Letter)</span>
            </button>
          </div>
        </div>

        {/* Printable Card Preview Container */}
        <div className="print-card-container space-y-8">
          <div className="text-center no-print">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Cut along dotted lines after printing
            </span>
          </div>

          {/* Cards Flex Container (Front and Back side-by-side or stacked) */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            
            {/* FRONT OF CARD */}
            <div className="w-[340px] h-[214px] bg-white rounded-2xl border-2 border-dashed border-slate-400 p-4 shadow-lg flex flex-col justify-between relative overflow-hidden select-none">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-red-500 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center font-black text-sm">
                    ✚
                  </div>
                  <span className="font-black text-xs text-red-600 tracking-wider uppercase">
                    EMERGENCY MEDICAL ID
                  </span>
                </div>
                <div className="bg-red-100 text-red-700 font-black text-xs px-2 py-0.5 rounded">
                  {patient.bloodType}
                </div>
              </div>

              {/* Patient Core Info */}
              <div className="my-auto space-y-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-black text-base text-slate-900 leading-tight">
                    {patient.fullName}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {patient.age ? `${patient.age} yrs` : ''} {patient.gender ? `• ${patient.gender}` : ''}
                  </span>
                </div>

                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="text-[11px] bg-red-50 text-red-800 p-1.5 rounded border border-red-200">
                    <span className="font-black uppercase text-[9px] block text-red-600">Allergies:</span>
                    <span className="font-bold truncate block">{patient.allergies.join(', ')}</span>
                  </div>
                )}

                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <div className="text-[10px] text-slate-600 font-semibold truncate">
                    <strong>Conditions:</strong> {patient.chronicConditions.join(', ')}
                  </div>
                )}
              </div>

              {/* Bottom Emergency Contact */}
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[10px]">
                {primaryContact ? (
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[9px] block">Emergency Contact:</span>
                    <span className="font-black text-slate-900">{primaryContact.name} ({primaryContact.relationship})</span>
                    <span className="font-bold text-red-600 block">{primaryContact.phone}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Call 911 / 112</span>
                )}
                <span className="text-[9px] font-bold text-slate-400 uppercase">FRONT</span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="w-[340px] h-[214px] bg-white rounded-2xl border-2 border-dashed border-slate-400 p-4 shadow-lg flex flex-col justify-between relative overflow-hidden select-none">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
                  SCAN FOR RESCUE PROTOCOL
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">BACK</span>
              </div>

              {/* QR and Instructions */}
              <div className="my-auto flex items-center gap-3">
                <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
                  <QRCodeSVG
                    value={scanUrl}
                    size={90}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="space-y-1 text-[10px] text-slate-600 leading-tight">
                  <p className="font-bold text-red-600 uppercase text-[10px]">
                    SCAN WITH ANY PHONE CAMERA
                  </p>
                  <p>
                    Reveals full medical history, active medications, doctor contact, and automatically alerts emergency contacts.
                  </p>
                  {secondaryContact && (
                    <p className="pt-1 text-[9px] text-slate-500">
                      <strong>Secondary:</strong> {secondaryContact.name} ({secondaryContact.phone})
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                <span>ResQQR Medical Protocol</span>
                <span>Encrypted • AES-256</span>
              </div>
            </div>

          </div>

          {/* Wallet / Phone Lockscreen Guide - Hidden during print */}
          <div className="no-print bg-white p-6 rounded-3xl border border-slate-200 text-xs text-slate-600 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-600" />
              Ways to carry your Emergency QR:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800 mb-1">1. Wallet Card</p>
                <p className="text-[11px] text-slate-500">
                  Print on heavy cardstock or laminate, cut along the borders, and place behind your ID.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800 mb-1">2. Clear Phone Case</p>
                <p className="text-[11px] text-slate-500">
                  Slip the printed QR code behind your clear smartphone case so it's always visible even if the phone battery dies.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800 mb-1">3. Helmet / Backpack Sticker</p>
                <p className="text-[11px] text-slate-500">
                  Essential for cyclists, runners, motorcyclists, hikers, and children.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
