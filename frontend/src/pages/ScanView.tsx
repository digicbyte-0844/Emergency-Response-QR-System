import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { PublicEmergencyProfile, HospitalFacility } from '../types';
import { HospitalMap } from '../components/HospitalMap';
import { FirstAidModal } from '../components/FirstAidModal';
import { VoiceAssistant } from '../components/VoiceAssistant';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { 
  HeartPulse, 
  PhoneCall, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ExternalLink, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Share2,
  Navigation,
  RefreshCw,
  Info,
  Lock,
  Unlock,
  Globe,
  WifiOff
} from 'lucide-react';

export const ScanView: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [patient, setPatient] = useState<PublicEmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-Language State
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Privacy PIN State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // Network Online / Offline State
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Bystander GPS Location State
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [alertSending, setAlertSending] = useState(false);
  const [alertResult, setAlertResult] = useState<{ success: boolean; message: string; mapsUrl?: string; simulated?: boolean } | null>(null);
  const [bystanderNote, setBystanderNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Hospitals state
  const [hospitals, setHospitals] = useState<HospitalFacility[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  // First Aid Modal
  const [firstAidOpen, setFirstAidOpen] = useState(false);
  const [firstAidTopic, setFirstAidTopic] = useState<'cpr' | 'anaphylaxis' | 'diabetic' | 'seizure' | 'recovery'>('cpr');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Listen to network status for PWA offline resilience
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Flush any queued offline beacon
      const queued = localStorage.getItem('queued_emergency_beacon');
      if (queued && token) {
        try {
          const payload = JSON.parse(queued);
          api.notifyLocation(token, payload).then(() => {
            localStorage.removeItem('queued_emergency_beacon');
            setAlertResult({
              success: true,
              message: 'Cellular restored! Queued GPS beacon was successfully dispatched to family.',
            });
          });
        } catch {}
      }
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);

  // Load Patient Profile by Token
  useEffect(() => {
    if (!token) {
      setError('Invalid emergency QR link');
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getScanProfile(token)
      .then((data) => {
        setPatient(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Scan profile fetch error:', err);
        setError(err.response?.data?.error || 'Unable to decrypt emergency profile. Token may be expired or corrupt.');
        setLoading(false);
      });
  }, [token]);

  // Request browser geolocation once on load for hospital proximity and emergency beacon
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          fetchHospitals(lat, lng);
        },
        (err) => {
          console.warn('Geolocation access not granted, using fallback coordinates:', err.message);
          const defaultLat = 37.7749;
          const defaultLng = -122.4194;
          setCoords({ lat: defaultLat, lng: defaultLng });
          fetchHospitals(defaultLat, defaultLng);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      const defaultLat = 37.7749;
      const defaultLng = -122.4194;
      setCoords({ lat: defaultLat, lng: defaultLng });
      fetchHospitals(defaultLat, defaultLng);
    }
  }, []);

  const fetchHospitals = (lat: number, lng: number) => {
    setHospitalsLoading(true);
    api.getNearbyHospitals(lat, lng, 7500)
      .then((facilities) => {
        setHospitals(facilities);
        setHospitalsLoading(false);
      })
      .catch((err) => {
        console.warn('Error fetching hospitals:', err);
        setHospitalsLoading(false);
      });
  };

  // Broadcast GPS location to family / emergency contacts
  const handleSendLocationAlert = async () => {
    if (!token) return;

    if (!coords) {
      alert('Locating GPS position. Please ensure location permissions are enabled.');
      return;
    }

    const payload = {
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: 10,
      bystanderNote: bystanderNote.trim() || undefined,
    };

    if (isOffline) {
      // Offline PWA Queue
      localStorage.setItem('queued_emergency_beacon', JSON.stringify(payload));
      setAlertResult({
        success: true,
        message: 'No cellular connection. GPS beacon queued locally and will auto-dispatch the moment signal restores!',
      });
      setShowNoteInput(false);
      return;
    }

    setAlertSending(true);
    try {
      const result = await api.notifyLocation(token, payload);
      setAlertResult({
        success: true,
        message: result.message,
        mapsUrl: result.googleMapsUrl,
        simulated: result.simulated,
      });
      setAlertSending(false);
      setShowNoteInput(false);
    } catch (err: any) {
      setAlertSending(false);
      setAlertResult({
        success: false,
        message: err.response?.data?.error || 'Failed to dispatch location alert. Try calling directly.',
      });
    }
  };

  // Unlock Sensitive PIN-Gated Data
  const handleUnlockPin = async (override = false) => {
    if (!token) return;
    if (!override && !pinInput.trim()) {
      setPinError('Please enter the 4-digit PIN');
      return;
    }

    if (override && !window.confirm('First Responder Emergency Access: Certify that you are responding to an immediate medical emergency to view complete sensitive medical history.')) {
      return;
    }

    setUnlocking(true);
    setPinError(null);

    try {
      const res = await api.verifyPin(token, {
        pin: override ? undefined : pinInput.trim(),
        override,
        reason: override ? 'First Responder Direct Override' : undefined,
      });

      setPatient(res.profile);
      setUnlocking(false);
      setPinInput('');
    } catch (err: any) {
      setUnlocking(false);
      setPinError(err.response?.data?.error || 'Incorrect 4-digit PIN');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin mb-4"></div>
        <h2 className="text-xl font-bold">Decrypting Emergency Medical Data...</h2>
        <p className="text-xs text-slate-400 mt-2">Connecting to secure medical vault</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">QR Record Not Found</h2>
          <p className="text-xs text-slate-600">{error || 'Unable to decrypt emergency profile.'}</p>
          <div className="pt-4 space-y-2">
            <a
              href="tel:911"
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Call 911 / 112 Immediately
            </a>
            <Link
              to="/"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryContact = patient.emergencyContacts.find((c) => c.isPrimary) || patient.emergencyContacts[0];
  const secondaryContact = patient.emergencyContacts.find((c) => !c.isPrimary);

  return (
    <div className="min-h-screen bg-slate-100 pb-36">
      
      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode Active: Emergency vitals cached. GPS alerts will queue until cellular connection restores.</span>
        </div>
      )}

      {/* 3-Second Triage Red Emergency Header */}
      <div className="bg-red-600 text-white px-4 py-4 shadow-md">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-6 h-6 animate-pulse" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-red-800 px-2 py-0.5 rounded">
                  {t.verifiedId}
                </span>
                <h1 className="text-base font-black leading-tight tracking-tight mt-0.5">
                  {t.emergencyHeader}
                </h1>
              </div>
            </div>
            <VoiceAssistant profile={patient} language={language} />
          </div>

          {/* Quick Multi-Language Switcher */}
          <div className="flex items-center justify-between pt-1 border-t border-red-500/50 text-xs">
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-100">
              <Globe className="w-3.5 h-3.5" /> Language:
            </span>
            <div className="flex items-center gap-1">
              {(['en', 'es', 'fr', 'zh', 'hi'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase transition ${
                    language === lang
                      ? 'bg-white text-red-700 shadow-xs'
                      : 'bg-red-700/60 text-white hover:bg-red-700'
                  }`}
                >
                  {lang === 'en' ? 'EN 🇺🇸' : lang === 'es' ? 'ES 🇪🇸' : lang === 'fr' ? 'FR 🇫🇷' : lang === 'zh' ? '中文 🇨🇳' : 'HI 🇮🇳'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        
        {/* Patient Identity & Blood Type Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t.patientIdentity}
              </span>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {patient.fullName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                {patient.age && <span>{patient.age} yrs old</span>}
                {patient.gender && <span>• {patient.gender}</span>}
                {patient.organDonor && (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    {t.organDonor}
                  </span>
                )}
              </div>
            </div>

            {/* Blood Type Badge */}
            <div className="bg-red-600 text-white rounded-2xl px-4 py-2.5 text-center shadow-md min-w-[76px] shrink-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider opacity-90">{t.bloodType}</span>
              <span className="text-3xl font-black tracking-tight leading-none">{patient.bloodType}</span>
            </div>
          </div>

          {patient.resuscitationStatus && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">{t.resuscitationStatus}:</span>
              <span className="font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {patient.resuscitationStatus}
              </span>
            </div>
          )}
        </div>

        {/* High-Impact Allergy Warning Banner */}
        {patient.allergies && patient.allergies.length > 0 ? (
          <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">
                {t.criticalAllergies}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-xl shadow-xs"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t.noAllergies}</span>
          </div>
        )}

        {/* Privacy Gate: If PIN Protected and Not Yet Unlocked */}
        {patient.isPinProtected && !patient.isUnlocked ? (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Lock className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                  {t.privacyLocked}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t.privacyUnlock}
                </p>
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-xl border border-red-200">
                {pinError}
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                placeholder="PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-24 text-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono tracking-widest focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <button
                onClick={() => handleUnlockPin(false)}
                disabled={unlocking}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition"
              >
                {unlocking ? 'Verifying...' : t.unlock}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => handleUnlockPin(true)}
                className="w-full text-center text-[11px] font-bold text-red-600 hover:text-red-700 py-1"
              >
                🚨 {t.privacyOverride}
              </button>
            </div>
          </div>
        ) : (
          /* Chronic Conditions & Medications (Visible when unlocked or not PIN-gated) */
          <>
            {((patient.chronicConditions && patient.chronicConditions.length > 0) ||
              (patient.medications && patient.medications.length > 0)) && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                {patient.isPinProtected && patient.isUnlocked && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 w-fit">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlocked with PIN / Emergency Override</span>
                  </div>
                )}

                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      {t.chronicConditions}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.chronicConditions.map((cond, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-800 border border-blue-200 font-bold text-xs px-2.5 py-1 rounded-xl"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {patient.medications && patient.medications.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      {t.medications}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.medications.map((med, i) => (
                        <span
                          key={i}
                          className="bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs px-2.5 py-1 rounded-xl"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Critical Instructions & Notes */}
        {patient.criticalNotes && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
              {t.actionNote}
            </span>
            <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed">
              {patient.criticalNotes}
            </p>
          </div>
        )}

        {/* Preferred Hospital */}
        {patient.preferredHospital && (
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              {t.preferredHospital}:
            </span>
            <span className="font-bold text-slate-900">{patient.preferredHospital}</span>
          </div>
        )}

        {/* GPS Location Beacon Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                {t.locationBeacon}
              </h3>
            </div>
            {coords && (
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {t.gpsReady}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {t.locationDescription}
          </p>

          {showNoteInput && (
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-600">Bystander note (optional):</label>
              <input
                type="text"
                placeholder="e.g. Conscious, sitting on sidewalk near main library"
                value={bystanderNote}
                onChange={(e) => setBystanderNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSendLocationAlert}
              disabled={alertSending}
              className="flex-1 bg-slate-900 hover:bg-slate-800 active:bg-black disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              {alertSending ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>{t.gpsTransmitting}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-red-400" />
                  <span>{t.sendGps}</span>
                </>
              )}
            </button>

            {!showNoteInput && (
              <button
                onClick={() => setShowNoteInput(true)}
                className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
                title="Add a note"
              >
                {t.addNote}
              </button>
            )}
          </div>

          {alertResult && (
            <div
              className={`p-3 rounded-xl text-xs ${
                alertResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border border-red-200 text-red-900'
              }`}
            >
              <p className="font-bold">{alertResult.message}</p>
              {alertResult.mapsUrl && (
                <a
                  href={alertResult.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 underline"
                >
                  View dispatched GPS pin <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* First Aid Guidance Drawer Trigger */}
        <button
          onClick={() => {
            if (patient.allergies && patient.allergies.length > 0) {
              setFirstAidTopic('anaphylaxis');
            } else if (patient.chronicConditions.some((c) => c.toLowerCase().includes('diabet'))) {
              setFirstAidTopic('diabetic');
            } else {
              setFirstAidTopic('cpr');
            }
            setFirstAidOpen(true);
          }}
          className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl p-4 flex items-center justify-between text-left shadow-xs transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">{t.firstAidBtn}</span>
              <span className="text-[11px] text-slate-500">
                {t.firstAidSubtitle}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
            {t.openGuide}
          </span>
        </button>

        {/* Nearby Hospitals & Emergency Centers */}
        {coords && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  {t.nearbyHospitals}
                </h3>
              </div>
              <button
                onClick={() => coords && fetchHospitals(coords.lat, coords.lng)}
                className="text-[10px] text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <HospitalMap
              bystanderLat={coords.lat}
              bystanderLng={coords.lng}
              hospitals={hospitals}
              loading={hospitalsLoading}
            />
          </div>
        )}

      </div>

      {/* Sticky Bottom Emergency Bar (The 3-Second Action Rule) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-2xl z-40 max-w-md mx-auto">
        <div className="space-y-2">
          {primaryContact && (
            <a
              href={`tel:${primaryContact.phone}`}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3.5 px-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 transition transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <span>{t.callPrimary}: {primaryContact.name} ({primaryContact.relationship})</span>
            </a>
          )}

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
            {secondaryContact ? (
              <a href={`tel:${secondaryContact.phone}`} className="text-red-600 hover:underline font-bold">
                Secondary: {secondaryContact.name} ({secondaryContact.phone})
              </a>
            ) : (
              <span>Direct caller connection</span>
            )}

            <a href="tel:911" className="text-slate-700 hover:text-red-600 font-bold underline">
              {t.callEmergencyServices}
            </a>
          </div>
        </div>
      </div>

      {/* First Aid Modal */}
      <FirstAidModal
        isOpen={firstAidOpen}
        onClose={() => setFirstAidOpen(false)}
        defaultTab={firstAidTopic}
      />
    </div>
  );
};
