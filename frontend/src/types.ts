export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface MedicalProfile {
  id?: string;
  fullName: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  bloodType: BloodType;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  organDonor: boolean;
  resuscitationStatus?: 'Full Code' | 'DNR' | 'DNI' | 'Limited Intervention';
  emergencyContacts: EmergencyContact[];
  primaryDoctor?: {
    name?: string;
    phone?: string;
    clinic?: string;
  };
  preferredHospital?: string;
  criticalNotes?: string;
  language?: string;
  privacyPin?: string;
}

export interface PublicEmergencyProfile {
  idToken: string;
  fullName: string;
  age?: number;
  gender?: string;
  bloodType: BloodType;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  organDonor: boolean;
  resuscitationStatus?: string;
  criticalNotes?: string;
  preferredHospital?: string;
  isPinProtected?: boolean;
  isUnlocked?: boolean;
  emergencyContacts: {
    id: string;
    name?: string;
    phone?: string;
    relationship: string;
    isPrimary: boolean;
    hasProxyRelay?: boolean;
    proxyTelUri?: string;
  }[];
  scannedAt: string;
}

export interface ProxyCallResponse {
  success: boolean;
  message: string;
  proxyTelUri?: string;
  simulated: boolean;
}

export interface AgoraVoiceTokenData {
  success: boolean;
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  expireTime: number;
  role: 'bystander' | 'contact';
  patientName: string;
  bloodType: BloodType;
  allergies: string[];
  relationship: string;
  callUrl: string;
}

export interface HospitalFacility {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  type: string;
  phone?: string;
  address?: string;
  emergency?: boolean;
}

export interface LocationAlertResponse {
  success: boolean;
  message: string;
  timestamp: string;
  contactsNotified: number;
  googleMapsUrl: string;
  simulated: boolean;
}
