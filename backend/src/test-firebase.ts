import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createStorageService, FirestoreStorageService } from './services/storage';

dotenv.config();

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Cloud Firestore connection (Spark Free Tier)...\n');

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
    ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(process.cwd(), 'serviceAccountKey.json');

  const hasFile = fs.existsSync(keyPath);
  const hasEnvKey = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const hasEnvFields = Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

  if (!hasFile && !hasEnvKey && !hasEnvFields) {
    console.log('ℹ️ No Firebase credentials detected yet.');
    console.log('To connect Firebase for free:');
    console.log('1. Follow the steps in FIREBASE_FREE_SETUP_GUIDE.md');
    console.log('2. Place serviceAccountKey.json in the backend/ folder OR set FIREBASE_SERVICE_ACCOUNT_KEY in backend/.env');
    console.log('3. Run "npm run test:firebase" to verify your connection.\n');
    console.log('✅ The system continues to run smoothly with zero setup on Local Storage.');
    return;
  }

  try {
    const storage = createStorageService();

    if (!(storage instanceof FirestoreStorageService)) {
      throw new Error('Storage service initialized as LocalStorage instead of FirestoreStorageService.');
    }

    console.log('📡 Performing Firestore read/write test...');
    const testId = `ping_${Date.now()}`;
    const testProfile = await storage.saveProfile({
      id: testId,
      fullName: 'Firebase Free Tier Test Profile',
      bloodType: 'O+',
      allergies: ['None'],
      emergencyContacts: [
        { id: 'c1', name: 'Test Contact', relationship: 'Test', phone: '+15550000000', isPrimary: true }
      ]
    });

    console.log(`✅ Write successful! Document saved in Firestore with ID: ${testProfile.id}`);

    const retrieved = await storage.getProfileById(testId);
    if (!retrieved || retrieved.fullName !== testProfile.fullName) {
      throw new Error('Failed to retrieve test document from Firestore.');
    }
    console.log(`✅ Read successful! Retrieved: "${retrieved.fullName}" (${retrieved.bloodType})`);

    console.log('\n🎉 FIREBASE CLOUD FIRESTORE CONNECTION VERIFIED & OPERATIONAL!');
  } catch (err: any) {
    console.error('❌ Firebase connection test failed:', err.message);
    process.exit(1);
  }
}

testFirebaseConnection().catch(console.error);
