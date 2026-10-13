import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { BloodType, MedicalProfile, EmergencyContact } from '../types';
import { 
  HeartPulse, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  Check, 
  Copy, 
  QrCode, 
  User, 
  Phone, 
  AlertCircle,
  ExternalLink,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const BLOOD_TYPES: BloodType[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'];

const ALLERGY_SUGGESTIONS = ['Peanuts', 'Tree Nuts', 'Penicillin', 'Sulfa Drugs', 'Latex', 'Aspirin', 'Shellfish', 'Bee Stings'];
const CONDITION_SUGGESTIONS = ['Asthma', 'Type 1 Diabetes', 'Type 2 Diabetes', 'Hypertension', 'Epilepsy', 'Heart Disease', 'Pacemaker'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrRef = useRef<SVGSVGElement | null>(null);

  // Basic Info
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Not specified');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [organDonor, setOrganDonor] = useState(true);
  const [resuscitationStatus, setResuscitationStatus] = useState<'Full Code' | 'DNR' | 'DNI'>('Full Code');

  // Chips
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);

  const [conditionInput, setConditionInput] = useState('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);

  const [medicationInput, setMedicationInput] = useState('');
  const [medications, setMedications] = useState<string[]>([]);

  // Emergency Contacts
  const [primaryContact, setPrimaryContact] = useState<EmergencyContact>({
    id: 'c1',
    name: '',
    relationship: 'Family',
    phone: '',
    isPrimary: true,
  });

  const [secondaryContact, setSecondaryContact] = useState<EmergencyContact>({
    id: 'c2',
    name: '',
    relationship: 'Friend',
    phone: '',
    isPrimary: false,
  });
  const [hasSecondary, setHasSecondary] = useState(false);

  // Optional Notes
  const [criticalNotes, setCriticalNotes] = useState('');
  const [preferredHospital, setPreferredHospital] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Presets
  const loadScenario = (type: 'sarah' | 'alex' | 'robert') => {
    if (type === 'sarah') {
      setFullName('Sarah Chen');
      setAge('28');
      setGender('Female');
      setBloodType('A-');
      setOrganDonor(true);
      setResuscitationStatus('Full Code');
      setAllergies(['Peanuts (Severe Anaphylaxis)', 'Tree Nuts', 'Sulfa Drugs']);
      setChronicConditions(['Exercise-Induced Asthma']);
      setMedications(['EpiPen (Autoinjector)', 'Albuterol Inhaler']);
      setPrimaryContact({
        id: 'c1',
        name: 'David Chen',
        relationship: 'Spouse',
        phone: '+1 (555) 234-5678',
        isPrimary: true,
      });
      setHasSecondary(false);
      setCriticalNotes('Severe peanut allergy. If unresponsive, administer EpiPen from jacket pocket immediately and call 911.');
      setPreferredHospital('City General Medical Center');
    } else if (type === 'alex') {
      setFullName('Alex Rivera');
      setAge('34');
      setGender('Male');
      setBloodType('O+');
      setOrganDonor(true);
      setResuscitationStatus('Full Code');
      setAllergies(['Penicillin', 'Codeine']);
      setChronicConditions(['Type 1 Diabetes Mellitus']);
      setMedications(['Insulin Glargine', 'Humalog', 'Glucagon Kit']);
      setPrimaryContact({
        id: 'c1',
        name: 'Elena Rivera',
        relationship: 'Sister',
        phone: '+1 (555) 912-3456',
        isPrimary: true,
      });
      setHasSecondary(false);
      setCriticalNotes('Diabetic alert: If confused or unresponsive, suspect severe hypoglycemia. Do NOT give oral liquids if unconscious.');
      setPreferredHospital('St. Jude Memorial Hospital');
    } else if (type === 'robert') {
      setFullName('Robert Miller');
      setAge('65');
      setGender('Male');
      setBloodType('B+');
      setOrganDonor(false);
      setResuscitationStatus('Full Code');
      setAllergies(['Aspirin', 'Contrast Dye']);
      setChronicConditions(['Coronary Artery Disease', 'Pacemaker (2023)']);
      setMedications(['Warfarin (Blood Thinner)', 'Metoprolol']);
      setPrimaryContact({
        id: 'c1',
        name: 'Martha Miller',
        relationship: 'Wife',
        phone: '+1 (555) 789-0123',
        isPrimary: true,
      });
      setHasSecondary(false);
      setCriticalNotes('Patient has an implanted cardiac pacemaker and takes anticoagulants. High risk of internal bleeding upon impact trauma.');
      setPreferredHospital('University Heart & Vascular Hospital');
    }
  };

  useEffect(() => {
    const persona = searchParams.get('persona');
    if (persona === 'sarah' || persona === 'alex' || persona === 'robert') {
      loadScenario(persona);
    }
  }, [searchParams]);

  // Helpers
  const addAllergy = (val?: string) => {
    const item = (val || allergyInput).trim();
    if (item && !allergies.includes(item)) {
      setAllergies([...allergies, item]);
      setAllergyInput('');
    }
  };

  const removeAllergy = (item: string) => {
    setAllergies(allergies.filter((a) => a !== item));
  };

  const addCondition = (val?: string) => {
    const item = (val || conditionInput).trim();
    if (item && !chronicConditions.includes(item)) {
      setChronicConditions([...chronicConditions, item]);
      setConditionInput('');
    }
  };

  const removeCondition = (item: string) => {
    setChronicConditions(chronicConditions.filter((c) => c !== item));
  };

  const addMedication = () => {
    const item = medicationInput.trim();
    if (item && !medications.includes(item)) {
      setMedications([...medications, item]);
      setMedicationInput('');
    }
  };

  const removeMedication = (item: string) => {
    setMedications(medications.filter((m) => m !== item));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!primaryContact.name.trim() || !primaryContact.phone.trim()) {
      setErrorMsg('Please provide a primary emergency contact name and phone number.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const contacts: EmergencyContact[] = [primaryContact];
      if (hasSecondary && secondaryContact.name.trim() && secondaryContact.phone.trim()) {
        contacts.push(secondaryContact);
      }

      const payload: MedicalProfile = {
        fullName: fullName.trim(),
        age: age ? parseInt(age, 10) : undefined,
        gender,
        bloodType,
        organDonor,
        resuscitationStatus,
        allergies,
        chronicConditions,
        medications,
        emergencyContacts: contacts,
        criticalNotes: criticalNotes.trim(),
        preferredHospital: preferredHospital.trim(),
      };

      const result = await api.createProfile(payload);
      setQrToken(result.token);
      setIsSubmitting(false);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.response?.data?.error || 'Failed to save emergency profile.');
    }
  };

  const scanFullUrl = qrToken ? `${window.location.origin}/scan/${qrToken}` : '';

  const handleCopyLink = () => {
    if (scanFullUrl) {
      navigator.clipboard.writeText(scanFullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const svgElement = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 20, 20, 360, 360);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `emergency-qr-${fullName.replace(/\s+/g, '-').toLowerCase() || 'id'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Medical ID
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Enter your vital medical information to generate your emergency QR code.
            </p>
          </div>

          {/* Quick preset selector */}
          <div className="flex items-center gap-1.5 self-start bg-white border border-slate-200 rounded-lg p-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium px-1.5">Sample:</span>
            <button
              type="button"
              onClick={() => loadScenario('sarah')}
              className="px-2 py-0.5 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Sarah
            </button>
            <button
              type="button"
              onClick={() => loadScenario('alex')}
              className="px-2 py-0.5 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Alex
            </button>
            <button
              type="button"
              onClick={() => loadScenario('robert')}
              className="px-2 py-0.5 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Robert
            </button>
          </div>
        </div>

        {/* QR Code Generated Success View */}
        {qrToken && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Emergency QR is Ready</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Scan this code with any phone camera to instantly view your emergency profile.
              </p>
            </div>

            {/* QR Code Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block shadow-xs">
              <QRCodeSVG
                ref={qrRef}
                value={scanFullUrl}
                size={220}
                level="M"
                includeMargin={false}
              />
              <p className="text-[11px] font-semibold text-slate-500 mt-2">
                {fullName} • Blood {bloodType}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto pt-2">
              <Link
                to={`/scan/${qrToken}`}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Scan View</span>
              </Link>

              <Link
                to={`/card/${qrToken}`}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Wallet Card</span>
              </Link>

              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Scan URL'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Image</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setQrToken(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Edit or Create Another Profile
              </button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Creation Form */}
        {!qrToken && (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Section 1: Basic Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                1. Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Chen"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>
              </div>

              {/* Blood Type Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                  {BLOOD_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBloodType(type)}
                      className={`py-1.5 text-xs font-bold rounded-md border text-center transition ${
                        bloodType === type
                          ? 'bg-red-600 border-red-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Critical Health Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                2. Critical Medical Details
              </h2>

              {/* Allergies */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Severe Allergies (e.g. Peanuts, Penicillin)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    placeholder="Type an allergy..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => addAllergy()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Suggestions:</span>
                  {ALLERGY_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => addAllergy(sug)}
                      className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                {/* Tags */}
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {allergies.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-md"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeAllergy(item)}
                          className="text-red-400 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Conditions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Medical Conditions (e.g. Asthma, Diabetes)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                    placeholder="Type a medical condition..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => addCondition()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Suggestions:</span>
                  {CONDITION_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => addCondition(sug)}
                      className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                {chronicConditions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {chronicConditions.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium px-2.5 py-1 rounded-md"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeCondition(item)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Medications */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Current Medications (e.g. EpiPen, Insulin)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                    placeholder="Type a medication..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => addMedication()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium"
                  >
                    Add
                  </button>
                </div>

                {medications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {medications.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium px-2.5 py-1 rounded-md"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeMedication(item)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Organ Donor & Resuscitation */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={organDonor}
                    onChange={(e) => setOrganDonor(e.target.checked)}
                    className="rounded text-red-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-slate-700">Organ Donor</span>
                </label>

                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Resuscitation:</span>
                  <select
                    value={resuscitationStatus}
                    onChange={(e) => setResuscitationStatus(e.target.value as any)}
                    className="text-xs px-2 py-1 border border-slate-200 rounded bg-white"
                  >
                    <option value="Full Code">Full Code</option>
                    <option value="DNR">DNR (Do Not Resuscitate)</option>
                    <option value="DNI">DNI (Do Not Intubate)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                3. Primary Emergency Contact
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryContact.name}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, name: e.target.value })}
                    placeholder="e.g. David Chen"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Relationship</label>
                  <input
                    type="text"
                    value={primaryContact.relationship}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, relationship: e.target.value })}
                    placeholder="e.g. Spouse / Parent"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={primaryContact.phone}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, phone: e.target.value })}
                    placeholder="e.g. +1 555-234-5678"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Secondary Contact Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setHasSecondary(!hasSecondary)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hasSecondary ? 'Remove Secondary Contact' : 'Add Secondary Contact (Optional)'}</span>
                </button>

                {hasSecondary && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-700">Name</label>
                      <input
                        type="text"
                        value={secondaryContact.name}
                        onChange={(e) => setSecondaryContact({ ...secondaryContact, name: e.target.value })}
                        placeholder="e.g. Dr. Vance"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-700">Relationship</label>
                      <input
                        type="text"
                        value={secondaryContact.relationship}
                        onChange={(e) => setSecondaryContact({ ...secondaryContact, relationship: e.target.value })}
                        placeholder="e.g. Doctor"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-700">Phone</label>
                      <input
                        type="tel"
                        value={secondaryContact.phone}
                        onChange={(e) => setSecondaryContact({ ...secondaryContact, phone: e.target.value })}
                        placeholder="e.g. +1 555-876-5432"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Emergency Notes (Optional) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                4. Emergency Notes (Optional)
              </h2>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Bystander Action Note
                  </label>
                  <textarea
                    rows={2}
                    value={criticalNotes}
                    onChange={(e) => setCriticalNotes(e.target.value)}
                    placeholder="e.g. EpiPen in outer backpack pocket. Administer immediately if unresponsive."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Preferred Hospital
                  </label>
                  <input
                    type="text"
                    value={preferredHospital}
                    onChange={(e) => setPreferredHospital(e.target.value)}
                    placeholder="e.g. City General Medical Center"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition shadow-xs flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Medical ID...' : 'Generate Emergency QR Code'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
