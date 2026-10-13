import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { 
  HeartPulse, 
  ShieldCheck, 
  QrCode, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Smartphone, 
  Printer, 
  CheckCircle2, 
  AlertCircle 
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
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Core Message */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                Emergency Medical ID System
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Vital medical details when seconds count
              </h1>

              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                A simple QR code for your phone lockscreen or wallet. In an emergency, first responders and bystanders instantly see your blood type, severe allergies, and primary contact with zero app installation.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-5 py-3 rounded-xl transition shadow-xs text-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Create Your Medical ID</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <a
                  href="#demo-scenarios"
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-3 rounded-xl transition text-sm"
                >
                  <Smartphone className="w-4 h-4 text-slate-600" />
                  <span>Try Demo Scan</span>
                </a>
              </div>

              {/* Simple Feature Points */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>AES-256 Safe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>GPS Family Alert</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>No Login Needed</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Sample Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-xs bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5" />
                    Responder View
                  </span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Sample</span>
                </div>

                {/* Patient Vitals */}
                <div className="p-4 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">Sarah Chen</p>
                      <p className="text-xs text-slate-500">28 yrs • Female</p>
                    </div>
                    <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-2.5 py-1 text-center">
                      <span className="text-[9px] font-bold block uppercase text-red-500">Blood</span>
                      <span className="text-lg font-black leading-none">A-</span>
                    </div>
                  </div>

                  <div className="bg-red-50/70 border border-red-200 rounded-lg p-2.5 text-xs">
                    <p className="text-[10px] font-bold text-red-700 uppercase">Critical Allergy</p>
                    <p className="font-semibold text-slate-900 mt-0.5">Peanuts (Severe Anaphylaxis)</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Emergency Contact</p>
                    <p className="font-medium text-slate-900 mt-0.5">David Chen (Spouse)</p>
                    <p className="text-slate-500 text-[11px]">+1 (555) 234-5678</p>
                  </div>

                  <button
                    onClick={() => demos[0] && navigate(`/scan/${demos[0].token}`)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Emergency Contact
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
            <p className="text-sm text-slate-600 mt-1">Three simple steps to setup your emergency protection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Enter Basic Vitals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your blood group, severe allergies, medications, and primary contact phone number.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Save or Print</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Save the QR to your phone lockscreen or print a credit-card-sized wallet card with single-click print.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Instant Help on Scan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Any smartphone camera scans your card to immediately see lifesaving vitals and call your family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Profiles Section */}
      <section id="demo-scenarios" className="py-12 bg-white flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Try sample profiles</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Click any profile to test the responder scan view or print wallet card.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
            >
              Create your own profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingDemos ? (
            <div className="text-center py-10 text-slate-400 text-xs">Loading demo profiles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {demos.map((persona, index) => (
                <div
                  key={persona.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Profile #{index + 1}
                      </span>
                      <span className="text-xs font-bold bg-white text-slate-900 border border-slate-200 px-2 py-0.5 rounded">
                        Blood: {persona.bloodType}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {persona.fullName}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {persona.chronicConditions && persona.chronicConditions.length > 0 
                          ? persona.chronicConditions.join(', ')
                          : 'General emergency profile'}
                      </p>
                    </div>

                    <div className="text-xs pt-1">
                      <span className="text-slate-500 block text-[11px] font-medium">Allergies:</span>
                      <p className="font-medium text-red-700 mt-0.5">
                        {persona.allergies && persona.allergies.length > 0
                          ? persona.allergies.join(', ')
                          : 'No known allergies'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center gap-2">
                    <Link
                      to={`/scan/${persona.token}`}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan View</span>
                    </Link>

                    <Link
                      to={`/card/${persona.token}`}
                      className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition"
                      title="View printable wallet card"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

