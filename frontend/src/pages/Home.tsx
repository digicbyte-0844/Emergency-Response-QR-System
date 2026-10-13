import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { 
  HeartPulse, 
  ShieldCheck, 
  QrCode, 
  PhoneCall, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  Sparkles,
  Smartphone,
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [demos, setDemos] = useState<{ id: string; fullName: string; bloodType: string; allergies: string[]; chronicConditions: string[]; token: string }[]>([]);
  const [loadingDemos, setLoadingDemos] = useState<boolean>(true);

  useEffect(() => {
    api.getDemoProfiles()
      .then((data) => {
        setDemos(data);
        setLoadingDemos(false);
      })
      .catch((err) => {
        console.warn('Could not load demo profiles:', err);
        setLoadingDemos(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-white to-slate-50 pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 text-xs font-black uppercase px-3 py-1.5 rounded-full border border-red-200 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                The 3-Second Life Saving Rule
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Instant Medical ID For <span className="text-red-600 underline decoration-red-300">First Responders</span> & Bystanders
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                When seconds matter, bystanders and paramedics shouldn't guess your blood type, severe allergies, or emergency contacts. ResQQR encodes life-critical data into secure, AES-256 encrypted QR codes with automated GPS family dispatch.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-red-600/25 transition transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Create Your Medical QR</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#demo-scenarios"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 rounded-2xl border border-slate-300 shadow-xs transition text-sm sm:text-base"
                >
                  <Smartphone className="w-5 h-5 text-red-600" />
                  <span>Simulate QR Scan</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AES-256 Token Cipher</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Auto GPS Beacon</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Zero-Login Triage</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
                {/* Mock Phone Frame Header */}
                <div className="bg-red-600 text-white p-4 text-center">
                  <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-2"></div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span>🚨 Emergency Responder Screen</span>
                    <span className="bg-red-800 px-2 py-0.5 rounded text-[10px]">Live Scan</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Sarah Chen</h3>
                      <p className="text-xs text-slate-500">Age 28 • Female</p>
                    </div>
                    <div className="bg-red-100 border-2 border-red-600 rounded-xl px-3 py-1.5 text-center shadow-xs">
                      <span className="block text-[10px] font-bold text-red-700 uppercase">Blood</span>
                      <span className="text-2xl font-black text-red-600 leading-none">A-</span>
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-r-xl">
                    <span className="text-[10px] font-black text-red-700 uppercase block tracking-wider">
                      ⚠️ Critical Allergies
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      Peanuts (Severe / Anaphylaxis), Tree Nuts
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
                    <span className="text-[10px] font-black text-amber-800 uppercase block tracking-wider">
                      Emergency Action Note
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Administer EpiPen in outer jacket pocket immediately if unresponsive.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => demos[0] && navigate(`/scan/${demos[0].token}`)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Call Emergency Contact (David)
                    </button>
                    <button
                      onClick={() => demos[0] && navigate(`/scan/${demos[0].token}`)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <MapPin className="w-4 h-4 text-red-400" />
                      Send Live GPS Location to Family
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 text-center border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                  Scan simulated • Ready to inspect in browser
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Scan Simulator Section */}
      <section id="demo-scenarios" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Interactive Emergency Scan Simulator
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Select any pre-configured medical persona below to see exactly what first responders and Good Samaritan bystanders see when scanning a ResQQR code.
            </p>
          </div>

          {loadingDemos ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading simulated profiles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {demos.map((persona, index) => (
                <div
                  key={persona.id}
                  className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-red-400 hover:shadow-lg transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-slate-200 text-slate-700">
                        Scenario #{index + 1}
                      </span>
                      <span className="text-base font-black bg-red-100 text-red-700 px-3 py-1 rounded-xl">
                        {persona.bloodType}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition">
                      {persona.fullName}
                    </h3>

                    <div className="mt-4 space-y-2">
                      <div className="text-xs">
                        <span className="text-slate-500 block font-semibold mb-1">Key Emergency Condition:</span>
                        <div className="flex flex-wrap gap-1">
                          {persona.chronicConditions && persona.chronicConditions.length > 0 ? (
                            persona.chronicConditions.map((cond, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                                {cond}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs pt-1">
                        <span className="text-slate-500 block font-semibold mb-1">Allergies:</span>
                        <div className="flex flex-wrap gap-1">
                          {persona.allergies && persona.allergies.length > 0 ? (
                            persona.allergies.map((all, i) => (
                              <span key={i} className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                                {all}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">No known allergies</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                    <Link
                      to={`/scan/${persona.token}`}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Open Responder Scan View</span>
                    </Link>

                    <Link
                      to={`/card/${persona.token}`}
                      className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View Printable Wallet Card</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-red-600 font-bold text-xs uppercase tracking-widest">Simple & Lifesaving</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              How The Emergency QR System Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-black">
                1
              </div>
              <h3 className="font-bold text-lg text-slate-900">Setup Medical Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add blood type, severe allergies, medications, chronic illnesses, and primary emergency contacts. Encrypted with AES-256 cipher.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-xl font-black">
                2
              </div>
              <h3 className="font-bold text-lg text-slate-900">Print Card or Set Lockscreen</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Print your credit-card-sized medical ID card for your wallet, helmet, or backpack, or set it as your smartphone's emergency lockscreen.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-black">
                3
              </div>
              <h3 className="font-bold text-lg text-slate-900">Bystander Scans & Acts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No app installation required. Any smartphone camera instantly reveals vital info, provides nearby hospital routing, and dispatches GPS location.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl shadow-md transition"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Create Your Emergency ID Profile Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
