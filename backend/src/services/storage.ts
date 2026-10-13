import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MedicalProfile } from '../types';

export interface IStorageService {
  saveProfile(profileData: Partial<MedicalProfile>): Promise<MedicalProfile>;
  getProfileById(id: string): Promise<MedicalProfile | null>;
  updateProfile(id: string, updates: Partial<MedicalProfile>): Promise<MedicalProfile | null>;
  listProfiles(): Promise<MedicalProfile[]>;
}

// -------------------------------------------------------------
// Seed Data for Instant Realistic Demo Scenarios
// -------------------------------------------------------------
const INITIAL_DEMO_PROFILES: MedicalProfile[] = [
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// -------------------------------------------------------------
// Robust Local JSON File Storage Service
// -------------------------------------------------------------
export class LocalStorageService implements IStorageService {
  private filePath: string;
  private inMemoryCache: Map<string, MedicalProfile> = new Map();

  constructor(storageDir?: string) {
    const dir = storageDir || path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.filePath = path.join(dir, 'profiles.json');
    this.init();
  }

  private init() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const list: MedicalProfile[] = JSON.parse(raw);
        for (const item of list) {
          this.inMemoryCache.set(item.id, item);
        }
      }
      
      // If empty or first run, seed default demo profiles
      if (this.inMemoryCache.size === 0) {
        for (const demo of INITIAL_DEMO_PROFILES) {
          this.inMemoryCache.set(demo.id, demo);
        }
        this.persist();
      }
    } catch (err) {
      console.warn('⚠️ Warning reading profiles.json, re-initializing cache:', err);
      for (const demo of INITIAL_DEMO_PROFILES) {
        this.inMemoryCache.set(demo.id, demo);
      }
      this.persist();
    }
  }

  private persist() {
    try {
      const data = Array.from(this.inMemoryCache.values());
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error('❌ Failed to persist profiles to disk:', err);
    }
  }

  async saveProfile(profileData: Partial<MedicalProfile>): Promise<MedicalProfile> {
    const now = new Date().toISOString();
    const id = profileData.id || `user_${uuidv4().replace(/-/g, '').slice(0, 12)}`;

    const newProfile: MedicalProfile = {
      id,
      fullName: profileData.fullName || 'Anonymous Patient',
      dateOfBirth: profileData.dateOfBirth,
      age: profileData.age,
      gender: profileData.gender,
      bloodType: profileData.bloodType || 'Unknown',
      allergies: Array.isArray(profileData.allergies) ? profileData.allergies : [],
      chronicConditions: Array.isArray(profileData.chronicConditions) ? profileData.chronicConditions : [],
      medications: Array.isArray(profileData.medications) ? profileData.medications : [],
      organDonor: Boolean(profileData.organDonor),
      resuscitationStatus: profileData.resuscitationStatus || 'Full Code',
      emergencyContacts: Array.isArray(profileData.emergencyContacts) ? profileData.emergencyContacts : [],
      primaryDoctor: profileData.primaryDoctor,
      preferredHospital: profileData.preferredHospital,
      criticalNotes: profileData.criticalNotes || '',
      language: profileData.language || 'English',
      privacyPin: profileData.privacyPin?.trim() || undefined,
      createdAt: profileData.createdAt || now,
      updatedAt: now
    };

    this.inMemoryCache.set(id, newProfile);
    this.persist();
    return newProfile;
  }

  async getProfileById(id: string): Promise<MedicalProfile | null> {
    return this.inMemoryCache.get(id) || null;
  }

  async updateProfile(id: string, updates: Partial<MedicalProfile>): Promise<MedicalProfile | null> {
    const existing = this.inMemoryCache.get(id);
    if (!existing) return null;

    const updated: MedicalProfile = {
      ...existing,
      ...updates,
      id, // Preserve id
      updatedAt: new Date().toISOString()
    };

    this.inMemoryCache.set(id, updated);
    this.persist();
    return updated;
  }

  async listProfiles(): Promise<MedicalProfile[]> {
    return Array.from(this.inMemoryCache.values());
  }
}

// -------------------------------------------------------------
// Optional Firebase Firestore Storage Service
// -------------------------------------------------------------
export class FirestoreStorageService implements IStorageService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async saveProfile(profileData: Partial<MedicalProfile>): Promise<MedicalProfile> {
    const now = new Date().toISOString();
    const id = profileData.id || `user_${uuidv4().replace(/-/g, '').slice(0, 12)}`;

    const record: MedicalProfile = {
      id,
      fullName: profileData.fullName || 'Anonymous Patient',
      dateOfBirth: profileData.dateOfBirth,
      age: profileData.age,
      gender: profileData.gender,
      bloodType: profileData.bloodType || 'Unknown',
      allergies: profileData.allergies || [],
      chronicConditions: profileData.chronicConditions || [],
      medications: profileData.medications || [],
      organDonor: Boolean(profileData.organDonor),
      resuscitationStatus: profileData.resuscitationStatus || 'Full Code',
      emergencyContacts: profileData.emergencyContacts || [],
      primaryDoctor: profileData.primaryDoctor,
      preferredHospital: profileData.preferredHospital,
      criticalNotes: profileData.criticalNotes || '',
      language: profileData.language || 'English',
      privacyPin: profileData.privacyPin?.trim() || undefined,
      createdAt: profileData.createdAt || now,
      updatedAt: now
    };

    await this.db.collection('users').doc(id).set(record);
    return record;
  }

  async getProfileById(id: string): Promise<MedicalProfile | null> {
    const doc = await this.db.collection('users').doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as MedicalProfile;
  }

  async updateProfile(id: string, updates: Partial<MedicalProfile>): Promise<MedicalProfile | null> {
    const docRef = this.db.collection('users').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const updatedData = {
      ...doc.data(),
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await docRef.set(updatedData, { merge: true });
    return updatedData as MedicalProfile;
  }

  async listProfiles(): Promise<MedicalProfile[]> {
    const snapshot = await this.db.collection('users').limit(50).get();
    if (snapshot.empty) {
      console.log('🌱 Cloud Firestore collection is empty. Seeding demo profiles...');
      for (const demo of INITIAL_DEMO_PROFILES) {
        await this.db.collection('users').doc(demo.id).set(demo);
      }
      return INITIAL_DEMO_PROFILES;
    }
    return snapshot.docs.map((doc: any) => doc.data() as MedicalProfile);
  }
}

// -------------------------------------------------------------
// Storage Factory: Auto-selects Firestore if configured, otherwise LocalStorage
// -------------------------------------------------------------
export function createStorageService(): IStorageService {
  const serviceKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
    ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(process.cwd(), 'serviceAccountKey.json');

  const hasKeyFile = fs.existsSync(serviceKeyPath);
  const hasEnvKey = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const hasEnvFields = Boolean(
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY
  );

  const useFirebase = process.env.USE_FIREBASE === 'true' || hasKeyFile || hasEnvKey || hasEnvFields;

  if (useFirebase) {
    try {
      const admin = require('firebase-admin');
      let credential: any = null;

      if (hasKeyFile) {
        const serviceAccount = require(serviceKeyPath);
        credential = admin.credential.cert(serviceAccount);
      } else if (hasEnvKey) {
        let raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!.trim();
        if (!raw.startsWith('{')) {
          // Attempt base64 decode
          raw = Buffer.from(raw, 'base64').toString('utf-8');
        }
        const serviceAccount = JSON.parse(raw);
        credential = admin.credential.cert(serviceAccount);
      } else if (hasEnvFields) {
        credential = admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        });
      }

      if (credential) {
        if (!admin.apps.length) {
          admin.initializeApp({ credential });
        }
        const db = admin.firestore();
        db.settings({ ignoreUndefinedProperties: true });
        console.log('🔥 Firebase Cloud Firestore initialized successfully (Spark Free Tier).');
        return new FirestoreStorageService(db);
      }
    } catch (err: any) {
      console.warn('⚠️ Firebase initialization failed, falling back to Local Storage:', err.message);
    }
  }

  console.log('📦 Using Local Persistent JSON Storage engine (Zero setup required).');
  return new LocalStorageService();
}
