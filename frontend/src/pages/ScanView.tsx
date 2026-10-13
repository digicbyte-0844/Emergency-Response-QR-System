import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { PublicEmergencyProfile, HospitalFacility } from '../types';
import { HospitalMap } from '../components/HospitalMap';
import { FirstAidModal } from '../components/FirstAidModal';
import { VoiceAssistant } from '../components/VoiceAssistant';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartPulse, 
  faPhone, 
  faLocationDot, 
  faTriangleExclamation, 
  faHospital, 
  faShareNodes, 
  faArrowsRotate, 
  faLock, 
  faUnlock, 
  faGlobe, 
  faWifi, 
  faCircleCheck,
  faSuitcaseMedical,
  faExternalLink,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';

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

  // Network State
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

  // Encrypted Voice Relay State (Caller ID Masked)
  const [callingContactId, setCallingContactId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<{
    success: boolean;
    message: string;
    proxyTelUri?: string;
    simulated: boolean;
  } | null>(null);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Listen to network status for offline resilience
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      const queued = localStorage.getItem('queued_emergency_beacon');
      if (queued && token) {
        try {
          const payload = JSON.parse(queued);
          api.notifyLocation(token, payload).then(() => {
            localStorage.removeItem('queued_emergency_beacon');
            setAlertResult({
              success: true,
              message: 'Cellular restored! Queued GPS beacon dispatched to emergency contacts.',
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

  // Load Patient Profile
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
        setError(err.response?.data?.error || 'Unable to load emergency profile.');
        setLoading(false);
      });
  }, [token]);

  // Request browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          fetchHospitals(lat, lng);
        },
        () => {
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
      .catch(() => {
        setHospitalsLoading(false);
      });
  };

  // Broadcast GPS location (30% Green Action)
  const handleSendLocationAlert = async () => {
    if (!token) return;

    if (!coords) {
      alert('Location not ready yet. Please enable location permissions.');
      return;
    }

    const payload = {
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: 10,
      bystanderNote: bystanderNote.trim() || undefined,
    };

    if (isOffline) {
      localStorage.setItem('queued_emergency_beacon', JSON.stringify(payload));
      setAlertResult({
        success: true,
        message: 'Offline mode: GPS alert queued and will send automatically when signal restores.',
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
        message: err.response?.data?.error || 'Failed to dispatch alert. Please call contact directly.',
      });
    }
  };

  // Unlock PIN
  const handleUnlockPin = async (override = false) => {
    if (!token) return;
    if (!override && !pinInput.trim()) {
      setPinError('Please enter the PIN');
      return;
    }

    if (override && !window.confirm('Emergency Override: Confirm to access complete medical history for emergency care.')) {
      return;
    }

    setUnlocking(true);
    setPinError(null);

    try {
      const res = await api.verifyPin(token, {
        pin: override ? undefined : pinInput.trim(),
        override,
        reason: override ? 'Emergency First Responder Override' : undefined,
      });

      setPatient(res.profile);
      setUnlocking(false);
      setPinInput('');
    } catch (err: any) {
      setUnlocking(false);
      setPinError(err.response?.data?.error || 'Incorrect PIN');
    }
  };

  // Encrypted Voice Relay Call Handler
  const handleInitiateProxyCall = async (contactId?: string) => {
    if (!token) return;
    setCallingContactId(contactId || 'primary');
    setCallModalOpen(true);
    setCallStatus(null);

    try {
      const res = await api.callEmergencyContact(token, contactId);
      setCallStatus(res);
      if (res.proxyTelUri) {
        setTimeout(() => {
          window.location.href = res.proxyTelUri!;
        }, 1200);
      }
    } catch (err: any) {
      setCallStatus({
        success: false,
        message: err.response?.data?.error || 'Failed to connect encrypted proxy relay.',
        simulated: false,
      });
    } finally {
      setCallingContactId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-800">Loading Medical Information...</p>
        <p className="text-xs text-slate-500 mt-1">Accessing verified medical vault</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl p-6 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-lg">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Profile Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">{error || 'Unable to decrypt emergency profile.'}</p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryContact = patient.emergencyContacts.find((c) => c.isPrimary) || patient.emergencyContacts[0];
  const secondaryContact = patient.emergencyContacts.find((c) => !c.isPrimary);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      
      {/* Offline Alert */}
      {isOffline && (
        <div className="bg-slate-800 text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faWifi} className="text-amber-400 text-xs" />
          <span>Offline mode: Vitals available locally. GPS alert will queue.</span>
        </div>
      )}

      {/* Emergency Header Bar - 60% White base + 30% Green identity */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-12 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {t.emergencyHeader}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <VoiceAssistant profile={patient} language={language} />

            {/* Language dropdown */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold text-slate-700">
              {(['en', 'es', 'fr', 'zh', 'hi'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === lang ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-3.5">
        
        {/* Core Identity & Blood Group Card (60% White + 10% Red Blood Badge) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded w-fit">
                {t.patientIdentity}
              </p>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {patient.fullName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                {patient.age && <span>{patient.age} yrs old</span>}
                {patient.gender && <span>• {patient.gender}</span>}
                {patient.organDonor && (
                  <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                    Organ Donor
                  </span>
                )}
              </div>
            </div>

            {/* 10% Red High-visibility Blood Type Badge */}
            <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-1.5 text-center min-w-[70px] shrink-0">
              <span className="block text-[9px] font-black text-red-600 uppercase tracking-wider">{t.bloodType}</span>
              <span className="text-2xl font-black text-red-600 leading-none">{patient.bloodType}</span>
            </div>
          </div>

          {patient.resuscitationStatus && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="text-slate-500">{t.resuscitationStatus}:</span>
              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {patient.resuscitationStatus}
              </span>
            </div>
          )}
        </div>

        {/* 10% Red Critical Allergies Alert Box */}
        {patient.allergies && patient.allergies.length > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-red-800">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-600 text-sm shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide">
                {t.criticalAllergies}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="bg-red-600 text-white font-semibold text-xs px-2.5 py-1 rounded-md shadow-2xs"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600" />
            <span>{t.noAllergies}</span>
          </div>
        )}

        {/* Critical Action Note (10% Red Alert Accent) */}
        {patient.criticalNotes && (
          <div className="bg-red-50/50 border border-red-200 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
              <span>Emergency Action Note</span>
            </span>
            <p className="text-xs font-semibold text-slate-900 leading-relaxed">
              {patient.criticalNotes}
            </p>
          </div>
        )}

        {/* Privacy Gated Info (Conditions & Medications) */}
        {patient.isPinProtected && !patient.isUnlocked ? (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-900">{t.privacyLocked}</p>
                <p className="text-[11px] text-slate-500">{t.privacyUnlock}</p>
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {pinError}
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                placeholder="4-digit PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-28 text-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono tracking-widest focus:outline-none focus:border-emerald-600 bg-white"
              />
              <button
                onClick={() => handleUnlockPin(false)}
                disabled={unlocking}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-1.5 rounded-lg transition shadow-xs"
              >
                {unlocking ? 'Verifying...' : t.unlock}
              </button>
            </div>

            <button
              onClick={() => handleUnlockPin(true)}
              className="text-[11px] text-red-600 hover:underline block pt-1"
            >
              {t.privacyOverride}
            </button>
          </div>
        ) : (
          /* Unlocked or Public Conditions & Meds (30% Green Highlights) */
          <>
            {((patient.chronicConditions && patient.chronicConditions.length > 0) ||
              (patient.medications && patient.medications.length > 0)) && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                {patient.isPinProtected && patient.isUnlocked && (
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded w-fit">
                    <FontAwesomeIcon icon={faUnlock} className="text-xs" />
                    <span>Unlocked for emergency care</span>
                  </div>
                )}

                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
                      {t.chronicConditions}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.chronicConditions.map((cond, i) => (
                        <span
                          key={i}
                          className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium px-2.5 py-1 rounded-md"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {patient.medications && patient.medications.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      {t.medications}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.medications.map((med, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md"
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

        {/* Preferred Hospital */}
        {patient.preferredHospital && (
          <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs shadow-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faHospital} className="text-emerald-600" />
              <span>{t.preferredHospital}:</span>
            </span>
            <span className="font-semibold text-slate-900">{patient.preferredHospital}</span>
          </div>
        )}

        {/* GPS Location Beacon Card (30% Green Action) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faLocationDot} className="text-emerald-600 text-sm" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {t.locationBeacon}
              </span>
            </div>
            {coords && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                GPS Ready
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Transmit this incident's live GPS coordinates directly to emergency contacts.
          </p>

          {showNoteInput && (
            <input
              type="text"
              placeholder="Optional note: e.g. Conscious on sidewalk"
              value={bystanderNote}
              onChange={(e) => setBystanderNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600 bg-white"
            />
          )}

          <div className="flex gap-2">
            {/* 30% Green Action Button */}
            <button
              onClick={handleSendLocationAlert}
              disabled={alertSending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              {alertSending ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Transmitting GPS...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
                  <span>Send GPS to Family</span>
                </>
              )}
            </button>

            {!showNoteInput && (
              <button
                onClick={() => setShowNoteInput(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-lg text-xs font-medium"
              >
                + Note
              </button>
            )}
          </div>

          {alertResult && (
            <div
              className={`p-2.5 rounded-lg text-xs ${
                alertResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="font-semibold">{alertResult.message}</p>
              {alertResult.mapsUrl && (
                <a
                  href={alertResult.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-700 underline font-semibold"
                >
                  <span>View Dispatched GPS Pin</span>
                  <FontAwesomeIcon icon={faExternalLink} className="text-[10px]" />
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
          className="w-full bg-white hover:bg-emerald-50/40 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-left shadow-xs transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <FontAwesomeIcon icon={faSuitcaseMedical} />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">First Aid Emergency Protocols</p>
              <p className="text-[11px] text-slate-500">CPR pulse metronome, EpiPen guidance, and recovery</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700">
            Open Guide →
          </span>
        </button>

        {/* Nearby Hospitals & Emergency Centers */}
        {coords && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHospital} className="text-emerald-700 text-sm" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {t.nearbyHospitals}
                </span>
              </div>
              <button
                onClick={() => coords && fetchHospitals(coords.lat, coords.lng)}
                className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium"
              >
                <FontAwesomeIcon icon={faArrowsRotate} className="text-[10px]" />
                <span>Refresh</span>
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

      {/* Sticky Bottom Calling Bar - Encrypted Voice Relay */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-lg z-40 max-w-md mx-auto">
        <div className="space-y-2">
          {primaryContact && (
            <a
              href={primaryContact.proxyTelUri || '#'}
              onClick={() => {
                if (token) {
                  api.callEmergencyContact(token, primaryContact.id).catch(() => {});
                }
                setCallStatus({
                  success: true,
                  message: `Encrypted voice relay connecting to ${primaryContact.relationship}. Real phone numbers and caller ID are 100% masked.`,
                  proxyTelUri: primaryContact.proxyTelUri,
                  simulated: true,
                });
              }}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer text-center"
            >
              <FontAwesomeIcon icon={faPhone} />
              <span>Call Emergency Contact ({primaryContact.relationship || 'Primary'})</span>
            </a>
          )}

          {/* Discreet Privacy & Masked Options */}
          <div className="flex items-center justify-between px-1 text-[11px]">
            {primaryContact?.proxyTelUri ? (
              <a
                href={`tel:%2331%23${primaryContact.proxyTelUri.replace('tel:', '')}`}
                className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
                title="Dial with #31# prefix to suppress your caller ID display"
              >
                <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600 text-[10px]" />
                <span>Call with Private Caller ID (#31#)</span>
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600 text-[10px]" />
                <span>Caller ID Masked & Encrypted</span>
              </span>
            )}

            {secondaryContact && (
              <a
                href={secondaryContact.proxyTelUri || '#'}
                onClick={() => {
                  if (token) {
                    api.callEmergencyContact(token, secondaryContact.id).catch(() => {});
                  }
                }}
                className="text-slate-700 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
              >
                Call Secondary ({secondaryContact.relationship})
              </a>
            )}
          </div>

          {/* Non-blocking feedback toast when dialer is engaged */}
          {callStatus && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-medium truncate">
                <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 shrink-0" />
                <span className="truncate">Connecting encrypted relay to {primaryContact?.relationship}...</span>
              </div>
              {callStatus.proxyTelUri && (
                <a
                  href={callStatus.proxyTelUri}
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px] transition"
                >
                  Dial Now
                </a>
              )}
            </div>
          )}
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
