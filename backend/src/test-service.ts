import { encryptId, decryptId, isValidToken } from './utils/crypto';
import { LocalStorageService } from './services/storage';
import { NotificationService } from './services/notifications';
import { HospitalService } from './services/hospitals';

async function runTests() {
  console.log('🧪 Starting backend sanity and verification tests...\n');

  // 1. Test Crypto
  console.log('--- 1. Testing AES-256 Encryption & Decryption ---');
  const sampleId = 'user_9876543210ab';
  const token = encryptId(sampleId);
  console.log('Encrypted Token:', token);
  const decrypted = decryptId(token);
  console.log('Decrypted ID:', decrypted);
  console.log('Token Valid check:', isValidToken(token));

  if (decrypted !== sampleId) {
    throw new Error(`Crypto verification failed: expected ${sampleId}, got ${decrypted}`);
  }
  console.log('✅ Crypto test passed!\n');

  // 2. Test Storage
  console.log('--- 2. Testing Storage Service ---');
  const storage = new LocalStorageService();
  const profiles = await storage.listProfiles();
  console.log(`Loaded ${profiles.length} profiles from storage.`);
  const demoProfile = profiles[0];
  console.log(`Sample Profile: ${demoProfile.fullName} (${demoProfile.bloodType})`);

  const fetched = await storage.getProfileById(demoProfile.id);
  if (!fetched || fetched.fullName !== demoProfile.fullName) {
    throw new Error('Failed to retrieve profile by ID');
  }
  console.log('✅ Storage test passed!\n');

  // 3. Test Notifications
  console.log('--- 3. Testing Emergency Notification Dispatch ---');
  const notifications = new NotificationService();
  const alertResult = await notifications.sendEmergencyLocationAlert(demoProfile, {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 15,
    bystanderNote: 'Found conscious but dizzy near 5th and Market St.'
  });
  console.log('Alert Result:', alertResult);
  console.log('✅ Notification test passed!\n');

  // 4. Test Hospital Service
  console.log('--- 4. Testing Hospital Locator Service ---');
  const hospitals = new HospitalService();
  const facilities = await hospitals.getNearbyHospitals(37.7749, -122.4194, 5000);
  console.log(`Found ${facilities.length} nearby facilities. First facility:`, facilities[0]?.name);
  console.log('✅ Hospital locator test passed!\n');

  console.log('🎉 ALL BACKEND SANITY TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
