import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartPulse, 
  faShieldHalved, 
  faQrcode, 
  faPhone, 
  faLocationDot, 
  faArrowRight, 
  faMobileScreenButton, 
  faPrint, 
  faCircleCheck, 
  faTriangleExclamation,
  faSuitcaseMedical,
  faHospital
} from '@fortawesome/free-solid-svg-icons';

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
      {/* Hero Section - 60% White dominant canvas */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headlines & 30% Green Accents */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-md border border-emerald-200/80">
                <FontAwesomeIcon icon={faSuitcaseMedical} className="text-emerald-600 text-xs" />
                <span>Emergency Medical ID System</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Vital medical details when seconds count
              </h1>

              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                A simple QR code for your phone lockscreen or wallet. In an emergency, first responders and bystanders instantly see your blood type, severe allergies, and emergency contacts with zero app download.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* 30% Green Primary CTA */}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-5 py-3 rounded-xl transition shadow-xs text-sm"
                >
                  <FontAwesomeIcon icon={faQrcode} className="text-sm" />
                  <span>Create Your Medical ID</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs ml-1" />
                </Link>

                {/* Clean Neutral Secondary CTA */}
                <a
                  href="#demo-scenarios"
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-3 rounded-xl transition text-sm"
                >
                  <FontAwesomeIcon icon={faMobileScreenButton} className="text-slate-600" />
                  <span>Try Demo Scan</span>
                </a>
              </div>

              {/* 30% Green Feature Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600 text-sm shrink-0" />
                  <span>AES-256 Safe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-emerald-600 text-sm shrink-0" />
                  <span>GPS Family Alert</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 text-sm shrink-0" />
                  <span>No Login Needed</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Responder Screen Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-xs bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header (30% Green Structure) */}
                <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faHeartPulse} />
                    <span>Responder Live Screen</span>
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Sample</span>
                </div>

                {/* Patient Vitals with 10% Red Alerts */}
                <div className="p-4 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">Sarah Chen</p>
                      <p className="text-xs text-slate-500">28 yrs • Female</p>
                    </div>

                    {/* 10% Red Blood Group Badge */}
                    <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-2.5 py-1 text-center">
                      <span className="text-[9px] font-bold block uppercase text-red-500">Blood</span>
                      <span className="text-xl font-black leading-none">A-</span>
                    </div>
                  </div>

                  {/* 10% Red Critical Allergy Box */}
                  <div className="bg-red-50/80 border border-red-200 rounded-lg p-2.5 text-xs">
                    <p className="text-[10px] font-bold text-red-700 uppercase flex items-center gap-1">
                      <FontAwesomeIcon icon={faTriangleExclamation} />
                      <span>Critical Allergy</span>
                    </p>
                    <p className="font-semibold text-slate-900 mt-0.5">Peanuts (Severe Anaphylaxis)</p>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Emergency Contact</p>
                    <p className="font-semibold text-slate-900 mt-0.5">David Chen (Spouse)</p>
                    <p className="text-slate-500 text-[11px]">+1 (555) 234-5678</p>
                  </div>

                  {/* 10% Red Emergency Call Button */}
                  <button
                    onClick={() => demos[0] && navigate(`/scan/${demos[0].token}`)}
                    className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <FontAwesomeIcon icon={faPhone} className="text-xs" />
                    <span>Call Emergency Contact</span>
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
            <p className="text-sm text-slate-600 mt-1">Simple medical protection in three basic steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Enter Basic Vitals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your blood group, severe allergies, medications, and primary contact phone number.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
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
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5"
            >
              <span>Create your own profile</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>

          {loadingDemos ? (
            <div className="text-center py-10 text-slate-400 text-xs">Loading demo profiles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {demos.map((persona, index) => (
                <div
                  key={persona.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-300 transition shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Profile #{index + 1}
                      </span>
                      {/* 10% Red Blood Group Badge */}
                      <span className="text-xs font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded">
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
                      <p className="font-semibold text-red-700 mt-0.5">
                        {persona.allergies && persona.allergies.length > 0
                          ? persona.allergies.join(', ')
                          : 'No known allergies'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    {/* 30% Green Action */}
                    <Link
                      to={`/scan/${persona.token}`}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition text-center shadow-xs"
                    >
                      <FontAwesomeIcon icon={faQrcode} className="text-xs" />
                      <span>Scan View</span>
                    </Link>

                    <Link
                      to={`/card/${persona.token}`}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition"
                      title="View printable wallet card"
                    >
                      <FontAwesomeIcon icon={faPrint} className="text-xs" />
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
