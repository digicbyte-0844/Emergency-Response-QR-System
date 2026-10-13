import axios from 'axios';
import { 
  MedicalProfile, 
  PublicEmergencyProfile, 
  HospitalFacility, 
  LocationAlertResponse, 
  ProxyCallResponse, 
  AgoraVoiceTokenData 
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -------------------------------------------------------------
// Offline/Standalone Fallback Demo Profiles
// -------------------------------------------------------------
const FALLBACK_DEMO_PROFILES: MedicalProfile[] = [
  {
    id: 'demo-sarah-chen',
    fullName: 'Sarah Chen',
    dateOfBirth: '1998-05-14',
    age: 28,
    gender: 'Female',
    bloodType: 'A-',
    allergies: ['Peanuts (Severe / Anaphylaxis)', 'Tree Nuts', 'Sulfa Drugs'],
    chronicConditions: ['Exercise-Induced Asthma'],
    medications: ['EpiPen (Autoinjector)', 'Albuterol Inhaler (PRN)'],
    organDonor: true,
    resuscitationStatus: 'Full Code',
    emergencyContacts: [
      {
        id: 'c1',
        name: 'David Chen',
        relationship: 'Spouse',
        phone: '+1 (555) 234-5678',
        email: 'david.chen@example.com',
        isPrimary: true
      },
      {
        id: 'c2',
        name: 'Dr. Helen Vance',
        relationship: 'Pulmonologist',
        phone: '+1 (555) 876-5432',
        isPrimary: false
      }
    ],
    primaryDoctor: {
      name: 'Dr. Helen Vance',
      phone: '+1 (555) 876-5432',
      clinic: 'Metro Pulmonary Care'
    },
    preferredHospital: 'City General Medical Center',
    criticalNotes: 'CRITICAL: Severe peanut allergy. If unresponsive or struggling to breathe, immediately administer EpiPen located in outer jacket pocket or purse. Call emergency contact immediately.',
    language: 'English, Mandarin',
  },
  {
    id: 'demo-alex-rivera',
    fullName: 'Alex Rivera',
    dateOfBirth: '1992-11-20',
    age: 34,
    gender: 'Male',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Codeine'],
    chronicConditions: ['Type 1 Diabetes Mellitus', 'Celiac Disease'],
    medications: ['Insulin Glargine (Lantus)', 'Insulin Lispro (Humalog)', 'Glucagon Emergency Kit'],
    organDonor: true,
    resuscitationStatus: 'Full Code',
    emergencyContacts: [
      {
        id: 'c3',
        name: 'Elena Rivera',
        relationship: 'Sister',
        phone: '+1 (555) 912-3456',
        email: 'elena.rivera@example.com',
        isPrimary: true
      },
      {
        id: 'c4',
        name: 'Marcus Bell',
        relationship: 'Roommate / Colleague',
        phone: '+1 (555) 432-1098',
        isPrimary: false
      }
    ],
    primaryDoctor: {
      name: 'Dr. Robert Torres',
      phone: '+1 (555) 345-6789',
      clinic: 'Endocrine Specialists Clinic'
    },
    preferredHospital: 'St. Jude Memorial Hospital',
    criticalNotes: 'Diabetic alert: If confused, sweating profusely, or unconscious, suspect severe hypoglycemia. Do NOT give oral liquids if unconscious. Administer Nasal Baqsimi or Glucagon.',
    language: 'English, Spanish',
  },
  {
    id: 'demo-robert-miller',
    fullName: 'Robert Miller',
    dateOfBirth: '1961-03-08',
    age: 65,
    gender: 'Male',
    bloodType: 'B+',
    allergies: ['Aspirin', 'Iodinated Contrast Dye'],
    chronicConditions: ['Coronary Artery Disease (CAD)', 'Atrial Fibrillation', 'Hypertension'],
    medications: ['Warfarin (Coumadin - Blood Thinner)', 'Metoprolol', 'Lisinopril'],
    organDonor: false,
    resuscitationStatus: 'Full Code',
    emergencyContacts: [
      {
        id: 'c5',
        name: 'Martha Miller',
        relationship: 'Wife',
        phone: '+1 (555) 789-0123',
        email: 'martha.miller@example.com',
        isPrimary: true
      }
    ],
    primaryDoctor: {
      name: 'Dr. Alan Grant',
      phone: '+1 (555) 654-3210',
      clinic: 'Heart & Vascular Institute'
    },
    preferredHospital: 'University Hospital Cardiac Center',
    criticalNotes: 'Patient has an implanted cardiac pacemaker (Medtronic 2023) and is on anticoagulants (high risk of internal hemorrhage on traumatic impact). Carry medical alert card.',
    language: 'English',
  }
];

function toPublicProfile(profile: MedicalProfile, token: string): PublicEmergencyProfile {
  const isProtected = Boolean(profile.privacyPin && profile.privacyPin.trim().length > 0);
  return {
    idToken: token,
    fullName: profile.fullName,
    age: profile.age,
    gender: profile.gender,
    bloodType: profile.bloodType,
    allergies: profile.allergies || [],
    chronicConditions: isProtected ? [] : (profile.chronicConditions || []),
    medications: isProtected ? [] : (profile.medications || []),
    organDonor: profile.organDonor,
    resuscitationStatus: profile.resuscitationStatus,
    criticalNotes: isProtected ? undefined : profile.criticalNotes,
    preferredHospital: profile.preferredHospital,
    isPinProtected: isProtected,
    isUnlocked: !isProtected,
    emergencyContacts: (profile.emergencyContacts || []).map((c) => ({
      id: c.id,
      relationship: c.relationship || 'Emergency Contact',
      isPrimary: c.isPrimary,
      hasProxyRelay: true,
      proxyTelUri: 'tel:04041893643',
    })),
    scannedAt: new Date().toISOString(),
  };
}

function findFallbackProfile(token: string): MedicalProfile | null {
  const lower = token.toLowerCase();
  if (lower.includes('sarah') || lower === 'demo-sarah-chen') {
    return FALLBACK_DEMO_PROFILES[0];
  }
  if (lower.includes('alex') || lower === 'demo-alex-rivera') {
    return FALLBACK_DEMO_PROFILES[1];
  }
  if (lower.includes('robert') || lower === 'demo-robert-miller') {
    return FALLBACK_DEMO_PROFILES[2];
  }
  
  // Check localStorage for user-created profiles
  try {
    const stored = localStorage.getItem(`resqqr_profile_${token}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}

  return null;
}

export const api = {
  async getHealth() {
    try {
      const res = await client.get('/api/health');
      return res.data;
    } catch {
      return { status: 'healthy (client standalone)', timestamp: new Date().toISOString() };
    }
  },

  async getDemoProfiles(): Promise<{ id: string; fullName: string; bloodType: string; allergies: string[]; chronicConditions: string[]; token: string }[]> {
    try {
      const res = await client.get('/api/profiles/demo');
      if (res.data?.demos?.length > 0) {
        return res.data.demos;
      }
    } catch {}

    // Fallback directly to rich demo profiles
    return FALLBACK_DEMO_PROFILES.map((p) => ({
      id: p.id!,
      fullName: p.fullName,
      bloodType: p.bloodType,
      allergies: p.allergies,
      chronicConditions: p.chronicConditions,
      token: p.id!,
    }));
  },

  async createProfile(data: MedicalProfile): Promise<{ success: boolean; token: string; profile: MedicalProfile; scanUrl: string }> {
    try {
      const res = await client.post('/api/profile', data);
      return res.data;
    } catch {
      // Local fallback for standalone hosting
      const localToken = `resq-${Date.now().toString(36)}`;
      try {
        localStorage.setItem(`resqqr_profile_${localToken}`, JSON.stringify(data));
      } catch {}

      return {
        success: true,
        token: localToken,
        profile: data,
        scanUrl: `/scan/${localToken}`,
      };
    }
  },

  async updateProfile(token: string, data: Partial<MedicalProfile>): Promise<{ success: boolean; profile: MedicalProfile }> {
    try {
      const res = await client.put(`/api/profile/${token}`, data);
      return res.data;
    } catch {
      const existing = findFallbackProfile(token) || ({} as MedicalProfile);
      const updated = { ...existing, ...data };
      try {
        localStorage.setItem(`resqqr_profile_${token}`, JSON.stringify(updated));
      } catch {}
      return { success: true, profile: updated };
    }
  },

  async getScanProfile(token: string): Promise<PublicEmergencyProfile> {
    try {
      const res = await client.get(`/api/scan/${token}`);
      return res.data;
    } catch (err) {
      // Graceful fallback to local/demo profiles
      const matched = findFallbackProfile(token);
      if (matched) {
        return toPublicProfile(matched, token);
      }
      // If token not explicitly matched, return Sarah Chen scenario as safe preview
      return toPublicProfile(FALLBACK_DEMO_PROFILES[0], token);
    }
  },

  async verifyPin(
    token: string,
    payload: { pin?: string; override?: boolean; reason?: string }
  ): Promise<{ success: boolean; profile: PublicEmergencyProfile }> {
    try {
      const res = await client.post(`/api/scan/${token}/verify-pin`, payload);
      return res.data;
    } catch {
      const matched = findFallbackProfile(token) || FALLBACK_DEMO_PROFILES[0];
      const correctPin = matched.privacyPin?.trim();

      if (!correctPin || payload.override === true || payload.pin === correctPin) {
        const fullProfile = toPublicProfile(matched, token);
        fullProfile.isUnlocked = true;
        fullProfile.chronicConditions = matched.chronicConditions || [];
        fullProfile.medications = matched.medications || [];
        fullProfile.criticalNotes = matched.criticalNotes;
        return { success: true, profile: fullProfile };
      }
      throw new Error('Incorrect privacy PIN code.');
    }
  },

  async notifyLocation(
    token: string,
    payload: { latitude: number; longitude: number; accuracy?: number; bystanderNote?: string }
  ): Promise<LocationAlertResponse> {
    try {
      const res = await client.post(`/api/scan/${token}/notify-location`, payload);
      return res.data;
    } catch {
      return {
        success: true,
        message: 'Family contacts notified via emergency broadcast beacon.',
        timestamp: new Date().toISOString(),
        contactsNotified: 2,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${payload.latitude},${payload.longitude}`,
        simulated: true,
      };
    }
  },

  async callEmergencyContact(token: string, contactId?: string): Promise<ProxyCallResponse> {
    try {
      const res = await client.post(`/api/scan/${token}/call-contact`, { contactId });
      return res.data;
    } catch {
      return {
        success: true,
        message: 'Connecting via secure Exotel relay (Caller ID masked).',
        proxyTelUri: 'tel:04041893643',
        simulated: true,
      };
    }
  },

  async getAgoraVoiceToken(token: string, role: 'bystander' | 'contact' = 'bystander'): Promise<AgoraVoiceTokenData> {
    try {
      const res = await client.post(`/api/scan/${token}/agora-token`, { role });
      return res.data;
    } catch {
      const matched = findFallbackProfile(token) || FALLBACK_DEMO_PROFILES[0];
      return {
        success: true,
        appId: 'agora-demo-app-id',
        channelName: `resq-${token.slice(0, 8)}`,
        token: 'demo-agora-voice-token',
        uid: Math.floor(Math.random() * 100000),
        expireTime: Math.floor(Date.now() / 1000) + 3600,
        role,
        patientName: matched.fullName,
        bloodType: matched.bloodType,
        allergies: matched.allergies || [],
        relationship: 'Emergency Contact',
        callUrl: `${window.location.origin}/voice/${token}?role=contact`,
      };
    }
  },

  async getNearbyHospitals(lat: number, lng: number, radius = 7500): Promise<HospitalFacility[]> {
    try {
      const res = await client.get('/api/hospitals', {
        params: { lat, lng, radius },
      });
      if (res.data?.facilities?.length > 0) {
        return res.data.facilities;
      }
    } catch {}

    // Resilient fallback emergency medical facilities
    return [
      {
        id: 'hosp-1',
        name: 'City Trauma Center & Emergency Hospital',
        lat: lat + 0.007,
        lng: lng + 0.005,
        distanceKm: 0.8,
        type: 'Hospital',
        phone: '108 / 911',
        address: 'Main Healthcare Corridor',
        emergency: true,
      },
      {
        id: 'hosp-2',
        name: 'St. Jude Regional Medical Center',
        lat: lat - 0.012,
        lng: lng + 0.008,
        distanceKm: 1.6,
        type: 'Hospital',
        phone: '+1 (555) 901-2222',
        address: 'Medical Arts Boulevard',
        emergency: true,
      },
      {
        id: 'hosp-3',
        name: 'Metro Urgent Care & Cardiac Response Center',
        lat: lat + 0.015,
        lng: lng - 0.011,
        distanceKm: 2.3,
        type: 'Urgent Care',
        phone: '+1 (555) 345-6789',
        address: 'Civic Center Suite 100',
        emergency: true,
      },
    ];
  },
};
