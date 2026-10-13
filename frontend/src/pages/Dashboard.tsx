import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { BloodType, MedicalProfile, EmergencyContact } from '../types';
import { 
  HeartPulse, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Download, 
  ExternalLink, 
  Printer, 
  Check, 
  Copy, 
  Sparkles,
  QrCode,
  User,
  Heart,
  Phone,
  AlertOctagon,
  FileText
} from 'lucide-react';

const BLOOD_TYPES: BloodType[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('Not specified');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [organDonor, setOrganDonor] = useState(true);
  const [resuscitationStatus, setResuscitationStatus] = useState<'Full Code' | 'DNR' | 'DNI'>('Full Code');

  // Chip Inputs
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

  // Notes & Preferred Hospital
  const [criticalNotes, setCriticalNotes] = useState('');
  const [preferredHospital, setPreferredHospital] = useState('');

  // Privacy PIN
  const [privacyPin, setPrivacyPin] = useState('');
  const [enablePin, setEnablePin] = useState(false);

  // Submission & Result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load pre-configured sample personas for quick testing
  const loadScenario = (type: 'sarah' | 'alex' | 'robert') => {
    if (type === 'sarah') {
      setFullName('Sarah Chen');
      setAge('28');
      setGender('Female');
      setBloodType('A-');
      setOrganDonor(true);
      setResuscitationStatus('Full Code');
      setAllergies(['Peanuts (Severe / Anaphylaxis)', 'Tree Nuts', 'Sulfa Drugs']);
      setChronicConditions(['Exercise-Induced Asthma']);
      setMedications(['EpiPen (Autoinjector)', 'Albuterol Inhaler']);
      setPrimaryContact({
        id: 'c1',
        name: 'David Chen',
        relationship: 'Spouse',
        phone: '+1 (555) 234-5678',
        isPrimary: true,
      });
      setHasSecondary(true);
      setSecondaryContact({
        id: 'c2',
        name: 'Dr. Helen Vance',
        relationship: 'Pulmonologist',
        phone: '+1 (555) 876-5432',
        isPrimary: false,
      });
      setCriticalNotes('CRITICAL: Severe peanut allergy. If unresponsive, administer EpiPen from outer jacket pocket or purse immediately. Call 911.');
      setPreferredHospital('City General Medical Center');
    } else if (type === 'alex') {
      setFullName('Alex Rivera');
      setAge('34');
      setGender('Male');
      setBloodType('O+');
      setOrganDonor(true);
      setResuscitationStatus('Full Code');
      setAllergies(['Penicillin', 'Codeine']);
      setChronicConditions(['Type 1 Diabetes Mellitus', 'Celiac Disease']);
      setMedications(['Insulin Glargine', 'Humalog', 'Glucagon Kit']);
      setPrimaryContact({
        id: 'c1',
        name: 'Elena Rivera',
        relationship: 'Sister',
        phone: '+1 (555) 912-3456',
        isPrimary: true,
      });
      setHasSecondary(false);
      setCriticalNotes('Diabetic alert: If confused, sweating profusely or unconscious, suspect severe hypoglycemia. Do NOT give oral liquids if unconscious. Call 911.');
      setPreferredHospital('St. Jude Memorial Hospital');
    } else if (type === 'robert') {
      setFullName('Robert Miller');
      setAge('65');
      setGender('Male');
      setBloodType('B+');
      setOrganDonor(false);
      setResuscitationStatus('Full Code');
      setAllergies(['Aspirin', 'Iodinated Contrast']);
      setChronicConditions(['Coronary Artery Disease', 'Pacemaker Installed (2023)', 'Atrial Fibrillation']);
      setMedications(['Warfarin (Blood Thinner)', 'Metoprolol', 'Lisinopril']);
      setPrimaryContact({
        id: 'c1',
        name: 'Martha Miller',
        relationship: 'Wife',
        phone: '+1 (555) 789-0123',
        isPrimary: true,
      });
      setHasSecondary(false);
      setCriticalNotes('Patient has an implanted cardiac pacemaker and takes anticoagulants (Warfarin). High risk of internal bleeding upon impact trauma.');
      setPreferredHospital('University Heart & Vascular Hospital');
    }
  };

  // Check URL params if user requested pre-fill
  useEffect(() => {
    const persona = searchParams.get('persona');
    if (persona === 'sarah' || persona === 'alex' || persona === 'robert') {
      loadScenario(persona);
    }
  }, [searchParams]);

  // Helper chip additions
  const addAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const addCondition = () => {
    if (conditionInput.trim() && !chronicConditions.includes(conditionInput.trim())) {
      setChronicConditions([...chronicConditions, conditionInput.trim()]);
      setConditionInput('');
    }
  };

  const addMedication = () => {
    if (medicationInput.trim() && !medications.includes(medicationInput.trim())) {
      setMedications([...medications, medicationInput.trim()]);
      setMedicationInput('');
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!primaryContact.name.trim() || !primaryContact.phone.trim()) {
      setErrorMsg('Primary Emergency Contact name and phone number are required.');
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
        privacyPin: enablePin && privacyPin.trim() ? privacyPin.trim() : undefined,
      };

      const result = await api.createProfile(payload);
      setQrToken(result.token);
      setIsSubmitting(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.response?.data?.error || 'Failed to save emergency profile. Please verify backend connection.');
    }
  };

  const scanFullUrl = qrToken ? `${window.location.origin}/scan/${qrToken}` : '';

  const handleCopyLink = () => {
    if (scanFullUrl) {
      navigator.clipboard.writeText(scanFullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <HeartPulse className="w-8 h-8 text-red-600" />
              Emergency Medical Profile Setup
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Configure the exact life-saving vitals, allergies, and contacts displayed when your QR code is scanned.
            </p>
          </div>

          {/* Quick-load scenario presets */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 self-start">
            <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Fill Demo:</span>
            <button
              type="button"
              onClick={() => loadScenario('sarah')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
            >
              Sarah (Allergy)
            </button>
            <button
              type="button"
              onClick={() => loadScenario('alex')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            >
              Alex (Diabetic)
            </button>
            <button
              type="button"
              onClick={() => loadScenario('robert')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
            >
              Robert (Cardiac)
            </button>
          </div>
        </div>

        {/* QR Code Success Banner */}
        {qrToken && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-500 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Emergency Medical QR Generated!</h3>
                <p className="text-xs text-slate-600">
                  AES-256 encrypted payload created. Your internal ID is protected from web crawlers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <QRCodeSVG
                  id="emergency-qr-code"
                  value={scanFullUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
                <span className="text-[11px] font-bold text-red-600 mt-2 uppercase tracking-wider">
                  Scan With Any Phone Camera
                </span>
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Emergency Scan URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={scanFullUrl}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <Link
                    to={`/scan/${qrToken}`}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Test Scan Screen</span>
                  </Link>

                  <Link
                    to={`/card/${qrToken}`}
                    className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <Printer className="w-4 h-4 text-red-600" />
                    <span>Print Wallet Card</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          
          {/* Section 1: Personal Demographics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-slate-900 text-base">1. Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 29"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Critical Vitals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Heart className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-slate-900 text-base">2. Critical Medical Vitals</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Blood Type *</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value as BloodType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Resuscitation Status</label>
                <select
                  value={resuscitationStatus}
                  onChange={(e) => setResuscitationStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Full Code">Full Code (Standard CPR & Defibrillation)</option>
                  <option value="DNR">DNR (Do Not Resuscitate)</option>
                  <option value="DNI">DNI (Do Not Intubate)</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-xs font-bold text-slate-700">Organ Donor</label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={organDonor}
                      onChange={(e) => setOrganDonor(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span>Yes, Registered Organ Donor</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Allergies & Medications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-slate-900 text-base">3. Allergies & Medications</h3>
            </div>

            {/* Allergies Chip Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Critical Allergies</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Penicillin, Bee stings..."
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allergies.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-lg"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => setAllergies(allergies.filter((_, i) => i !== idx))}
                      className="hover:text-red-950"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {allergies.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No allergies added yet.</span>
                )}
              </div>
            </div>

            {/* Chronic Conditions Chip Input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700">Chronic Medical Conditions</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Asthma, Type 1 Diabetes, Epilepsy..."
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={addCondition}
                  className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {chronicConditions.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => setChronicConditions(chronicConditions.filter((_, i) => i !== idx))}
                      className="hover:text-blue-950"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {chronicConditions.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No chronic conditions listed.</span>
                )}
              </div>
            </div>

            {/* Current Medications Chip Input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700">Daily / Emergency Medications</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Insulin, EpiPen 0.3mg, Warfarin..."
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={addMedication}
                  className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {medications.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => setMedications(medications.filter((_, i) => i !== idx))}
                      className="hover:text-purple-950"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {medications.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No medications listed.</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contacts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-slate-900 text-base">4. Emergency Contacts</h3>
            </div>

            {/* Primary Contact */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black uppercase text-red-600 tracking-wider">
                Primary Contact (Called First by Bystanders) *
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Chen"
                    value={primaryContact.name}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Relationship *</label>
                  <input
                    type="text"
                    placeholder="e.g. Spouse / Parent"
                    value={primaryContact.relationship}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, relationship: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 (555) 234-5678"
                    value={primaryContact.phone}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, phone: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Contact Toggle */}
            {!hasSecondary ? (
              <button
                type="button"
                onClick={() => setHasSecondary(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Secondary Emergency Contact</span>
              </button>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-600">
                    Secondary Contact
                  </span>
                  <button
                    type="button"
                    onClick={() => setHasSecondary(false)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Helen Vance"
                      value={secondaryContact.name}
                      onChange={(e) => setSecondaryContact({ ...secondaryContact, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Physician / Sibling"
                      value={secondaryContact.relationship}
                      onChange={(e) => setSecondaryContact({ ...secondaryContact, relationship: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 876-5432"
                      value={secondaryContact.phone}
                      onChange={(e) => setSecondaryContact({ ...secondaryContact, phone: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Notes & Hospital Preference */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-slate-900 text-base">5. Critical Notes & Hospital Preference</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Preferred Hospital / Trauma Center</label>
                <input
                  type="text"
                  placeholder="e.g. City General Medical Center"
                  value={preferredHospital}
                  onChange={(e) => setPreferredHospital(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Special First Aid Instructions / Critical Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Carries EpiPen in right backpack pocket. Speaks English and Spanish. Has cardiac stent."
                  value={criticalNotes}
                  onChange={(e) => setCriticalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Privacy PIN Protection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">6. Privacy PIN Protection (Optional)</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Privacy Guard
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePin}
                  onChange={(e) => setEnablePin(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span>Gate sensitive conditions & medications behind a 4-digit PIN</span>
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Critical rescue info (Blood Type, Severe Allergies, Primary Contact) is always visible in under 3 seconds. Private medical details require this PIN or paramedic emergency override.
              </p>

              {enablePin && (
                <div className="max-w-xs pt-1">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Set 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="e.g. 1234"
                    value={privacyPin}
                    onChange={(e) => setPrivacyPin(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              * Required fields. All stored data is encrypted and safe.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Encrypting & Generating QR...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  <span>Generate Emergency QR Code</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
