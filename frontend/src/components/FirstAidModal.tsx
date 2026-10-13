import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, Play, Square, Activity, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

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

  // CPR Metronome at 105 Beats Per Minute (AHA recommended 100-120 BPM)
  useEffect(() => {
    let interval: any = null;
    if (metronomeActive) {
      const beatIntervalMs = Math.round(60000 / 105); // ~571ms
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">First Aid Emergency Protocol</h3>
              <p className="text-xs text-slate-400">Step-by-step guidance for Good Samaritan responders</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMetronomeActive(false);
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto bg-slate-100 p-1.5 gap-1 border-b border-slate-200 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('cpr')}
            className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cpr' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            CPR Guide
          </button>
          <button
            onClick={() => setActiveTab('anaphylaxis')}
            className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'anaphylaxis' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Anaphylaxis (EpiPen)
          </button>
          <button
            onClick={() => setActiveTab('diabetic')}
            className={`px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'diabetic' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Diabetic Shock
          </button>
          <button
            onClick={() => setActiveTab('seizure')}
            className={`px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'seizure' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Seizure
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'recovery' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Recovery Position
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
          {activeTab === 'cpr' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Call 911 / 112 before starting CPR!</p>
                  <p className="mt-1 text-slate-600">
                    If the person is unresponsive and not breathing (or only gasping), begin hands-only chest compressions.
                  </p>
                </div>
              </div>

              {/* CPR Metronome Section */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 text-center relative overflow-hidden">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  CPR Compression Rhythm Metronome (105 BPM)
                </div>
                <div className="flex items-center justify-center my-3">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-100 ${
                      metronomeBeat
                        ? 'border-red-500 bg-red-600 scale-110 shadow-lg shadow-red-500/50'
                        : 'border-slate-700 bg-slate-800 scale-100'
                    }`}
                  >
                    <span className="text-2xl font-black">{metronomeActive ? metronomeCount + 1 : '105'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Match hand compressions to each pulse (Song tempo: <em>"Stayin' Alive"</em>).
                </p>
                <button
                  onClick={() => setMetronomeActive(!metronomeActive)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition ${
                    metronomeActive
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {metronomeActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {metronomeActive ? 'Stop Metronome' : 'Start Beat Metronome'}
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <p><strong>Hand Placement:</strong> Interlock fingers. Place heel of hand in center of patient chest between nipples.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <p><strong>Compression Depth:</strong> Push hard and fast — compress at least 2 inches (5 cm) deep. Allow full chest recoil between compressions.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <p><strong>Do Not Stop:</strong> Continue until paramedics arrive, an AED is ready, or the person clearly wakes up.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anaphylaxis' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                <p className="font-bold text-sm text-amber-800">Severe Allergic Reaction (Anaphylaxis)</p>
                <p className="mt-1">
                  Signs: Difficulty breathing, swollen tongue/throat, hives, vomiting, fainting. Seconds count!
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 text-sm mb-1">Step 1: Locate Epinephrine (EpiPen / Auvi-Q)</p>
                  <p>Look in patient’s backpack, purse, or jacket pockets. Check patient’s Emergency Notes on screen.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 text-sm mb-1">Step 2: Prepare the Device</p>
                  <p>Form a fist around the injector (orange/needle tip down). Pull off the blue safety cap straight up with other hand.</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-bold text-red-900 text-sm mb-1">Step 3: Inject Into Mid-Outer Thigh</p>
                  <p className="text-red-800">
                    Swing and firmly push orange tip into mid-outer thigh (through clothing is fine) at a 90° angle until it clicks. <strong>Hold firmly in place for 3 full seconds.</strong>
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 text-sm mb-1">Step 4: Massage and Call 911</p>
                  <p>Remove injector and gently massage injection site for 10 seconds. Note exact time of injection for paramedics.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diabetic' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900">
                <p className="font-bold text-sm text-blue-800">Hypoglycemia (Critically Low Blood Sugar)</p>
                <p className="mt-1">
                  Symptoms: Shaking, pale/clammy skin, slurred speech, confusion, sudden loss of consciousness.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="font-bold text-emerald-900 text-sm mb-1">If Patient is AWAKE & Able to Swallow:</p>
                  <p className="text-emerald-800">
                    Provide 15-20 grams of fast-acting sugar: 4 ounces of fruit juice, regular soda (not diet), or 4 glucose tablets. Recheck in 15 minutes.
                  </p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-bold text-red-900 text-sm mb-1">If Patient is UNCONSCIOUS or Seizing:</p>
                  <p className="text-red-800 font-semibold">
                    ⚠️ DO NOT pour liquids or food into their mouth! This causes severe airway choking.
                  </p>
                  <p className="mt-1 text-red-700">
                    Call 911 immediately. If a nasal glucagon (Baqsimi) or Glucagon kit is with the patient, administer as prescribed. Turn patient onto their side in recovery position.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seizure' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900">
                <p className="font-bold text-sm">Seizure First Aid (Stay Safe & Protect Head)</p>
                <p className="mt-1">Most seizures last 1–3 minutes. Stay calm and stay with the person.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Protect head:</strong> Place a folded jacket or soft pillow under their head.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Clear area:</strong> Move away sharp or hard objects, tables, or glass.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Turn on side:</strong> Once active jerking stops, gently roll them onto their side to keep airway open.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span><strong>NEVER restrain</strong> the person and <strong>NEVER put anything in their mouth</strong>.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recovery' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-100 rounded-xl">
                <p className="font-bold text-sm text-slate-900 mb-1">When to Use Recovery Position:</p>
                <p>For an unconscious patient who is breathing normally and has no suspected spine/neck fracture.</p>
              </div>

              <div className="space-y-2">
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>1. Arm placement:</strong> Place the arm nearest to you at a right angle to their body with palm facing up.
                </p>
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>2. Cross arm:</strong> Bring their other arm across their chest and place the back of their hand against their opposite cheek.
                </p>
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>3. Bend knee & roll:</strong> Pull up the far knee until foot is flat. Gently roll them toward you onto their side.
                </p>
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>4. Tilt head:</strong> Gently tilt their head back to ensure airway remains open and saliva or vomit can drain.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <a
            href="tel:911"
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            <AlertCircle className="w-4 h-4" />
            Dial 911 / 112
          </a>
          <button
            onClick={() => {
              setMetronomeActive(false);
              onClose();
            }}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-xs font-bold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
