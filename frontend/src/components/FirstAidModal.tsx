import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSuitcaseMedical, 
  faXmark, 
  faPlay, 
  faStop, 
  faTriangleExclamation, 
  faCircleCheck,
  faPhone
} from '@fortawesome/free-solid-svg-icons';

interface FirstAidModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'cpr' | 'anaphylaxis' | 'diabetic' | 'seizure' | 'recovery';
}

export const FirstAidModal: React.FC<FirstAidModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'cpr',
}) => {
  const [activeTab, setActiveTab] = useState<'cpr' | 'anaphylaxis' | 'diabetic' | 'seizure' | 'recovery'>(defaultTab);
  const [metronomeActive, setMetronomeActive] = useState<boolean>(false);
  const [metronomeCount, setMetronomeCount] = useState<number>(0);
  const [metronomeBeat, setMetronomeBeat] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // CPR Metronome at 105 Beats Per Minute
  useEffect(() => {
    let interval: any = null;
    if (metronomeActive) {
      const beatIntervalMs = Math.round(60000 / 105);
      interval = setInterval(() => {
        setMetronomeBeat(true);
        setMetronomeCount((prev) => (prev + 1) % 30);
        setTimeout(() => setMetronomeBeat(false), 120);
      }, beatIntervalMs);
    } else {
      setMetronomeCount(0);
      setMetronomeBeat(false);
    }
    return () => clearInterval(interval);
  }, [metronomeActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] shadow-lg">
        
        {/* Header (60% White + 30% Green Accent) */}
        <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <FontAwesomeIcon icon={faSuitcaseMedical} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">First Aid Emergency Protocols</h3>
              <p className="text-[11px] text-slate-500">Step-by-step guidance for Good Samaritan responders</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMetronomeActive(false);
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Tab Navigation (30% Green Active Highlights) */}
        <div className="flex overflow-x-auto bg-slate-50 px-3 py-1.5 gap-1 border-b border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('cpr')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'cpr' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CPR Guide
          </button>
          <button
            onClick={() => setActiveTab('anaphylaxis')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'anaphylaxis' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anaphylaxis (EpiPen)
          </button>
          <button
            onClick={() => setActiveTab('diabetic')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'diabetic' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diabetic Alert
          </button>
          <button
            onClick={() => setActiveTab('seizure')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'seizure' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Seizure
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'recovery' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recovery Position
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          
          {/* CPR Tab */}
          {activeTab === 'cpr' && (
            <div className="space-y-3.5">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-900 flex items-start gap-2.5">
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">Alert emergency contacts immediately before starting CPR!</p>
                  <p className="mt-0.5 text-slate-600 text-[11px]">
                    If the patient is unresponsive and not breathing, begin hands-only chest compressions.
                  </p>
                </div>
              </div>

              {/* Metronome Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Compression Rhythm Metronome (105 BPM)
                </p>
                <div className="flex items-center justify-center my-2.5">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-100 ${
                      metronomeBeat
                        ? 'border-emerald-600 bg-emerald-600 text-white scale-110 shadow-xs'
                        : 'border-slate-300 bg-white text-slate-800 scale-100'
                    }`}
                  >
                    <span className="text-base font-black">{metronomeActive ? metronomeCount + 1 : '105'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setMetronomeActive(!metronomeActive)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition ${
                    metronomeActive
                      ? 'bg-slate-800 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <FontAwesomeIcon icon={metronomeActive ? faStop : faPlay} className="text-xs" />
                  <span>{metronomeActive ? 'Stop Metronome' : 'Start Metronome'}</span>
                </button>
              </div>

              <div className="space-y-2 text-slate-600">
                <p><strong>1. Hand Placement:</strong> Interlock fingers in center of patient chest between nipples.</p>
                <p><strong>2. Depth & Speed:</strong> Push hard and fast at least 2 inches (5 cm) deep. Allow full chest recoil.</p>
                <p><strong>3. Do Not Stop:</strong> Continue until emergency responders arrive or AED is attached.</p>
              </div>
            </div>
          )}

          {/* Anaphylaxis Tab */}
          {activeTab === 'anaphylaxis' && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-900">
                <p className="font-bold text-xs flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-600" />
                  <span>Severe Anaphylaxis (Epinephrine Protocol)</span>
                </p>
                <p className="text-[11px] mt-0.5 text-slate-700">Signs: Throat swelling, breathing difficulty, hives, collapse.</p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-900 mb-0.5">Step 1: Locate Auto-Injector (EpiPen)</p>
                  <p className="text-slate-600">Check patient pockets, backpack, or purse.</p>
                </div>
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-bold text-red-900 mb-0.5">Step 2: Inject Into Mid-Outer Thigh</p>
                  <p className="text-red-800">
                    Remove blue cap. Firmly push orange tip into outer thigh at 90° angle until click. <strong>Hold firmly for 3 full seconds.</strong>
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-900 mb-0.5">Step 3: Massage & Alert Emergency Contact</p>
                  <p className="text-slate-600">Massage injection area for 10 seconds. Keep patient still and warm.</p>
                </div>
              </div>
            </div>
          )}

          {/* Diabetic Tab */}
          {activeTab === 'diabetic' && (
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900">
                <p className="font-bold text-xs">Severe Hypoglycemia (Low Blood Sugar)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Symptoms: Pale skin, confusion, shaking, loss of consciousness.</p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-bold text-emerald-900 mb-0.5">If Conscious & Able to Swallow:</p>
                  <p className="text-emerald-800">Provide 15-20g fast-acting sugar (fruit juice, non-diet soda, glucose tabs).</p>
                </div>
                <div className="p-2.5 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-bold text-red-900 mb-0.5">If Unconscious:</p>
                  <p className="text-red-800 font-semibold">NEVER put liquids or food in mouth. Choking hazard.</p>
                  <p className="text-red-700 mt-0.5">Alert emergency contacts immediately. Turn patient on side in recovery position.</p>
                </div>
              </div>
            </div>
          )}

          {/* Seizure Tab */}
          {activeTab === 'seizure' && (
            <div className="space-y-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900">
                <p className="font-bold text-xs">Seizure Safety</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Most seizures stop in 1-2 minutes. Stay calm and stay with them.</p>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <p className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  • <strong>Protect head:</strong> Place a soft jacket or cushion under their head.
                </p>
                <p className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  • <strong>Clear area:</strong> Move away sharp or hard objects.
                </p>
                <p className="p-2 bg-red-50 rounded-lg border border-red-200 text-red-800 font-semibold">
                  • <strong>NEVER restrain</strong> the person or put anything in their mouth.
                </p>
              </div>
            </div>
          )}

          {/* Recovery Tab */}
          {activeTab === 'recovery' && (
            <div className="space-y-2 text-slate-700">
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                <p className="font-bold text-slate-900 mb-0.5">Recovery Position (Breathing Unconscious Patient)</p>
                <p className="text-[11px] text-slate-500">Keeps airway open and prevents choking on vomit or saliva.</p>
              </div>
              <p className="p-2 bg-white rounded-lg border border-slate-200">1. Place arm closest to you at a right angle.</p>
              <p className="p-2 bg-white rounded-lg border border-slate-200">2. Bring other arm across chest and hold hand against cheek.</p>
              <p className="p-2 bg-white rounded-lg border border-slate-200">3. Pull far knee up and gently roll patient toward you onto their side.</p>
              <p className="p-2 bg-white rounded-lg border border-slate-200">4. Tilt head gently back to keep airway clear.</p>
            </div>
          )}

        </div>

        {/* Footer (10% Red Emergency Dial Action) */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Encrypted Emergency Voice Relay Active</span>
          </div>
          <button
            onClick={() => {
              setMetronomeActive(false);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
