import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { encryptId, decryptId, isValidToken } from './utils/crypto';
import { createStorageService } from './services/storage';
import { NotificationService } from './services/notifications';
import { HospitalService } from './services/hospitals';
import { PublicEmergencyProfile } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for mobile responders and local dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Initialize services
const storage = createStorageService();
const notifications = new NotificationService();
const hospitals = new HospitalService();

// Favicon handler to prevent browser 404 console warnings
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end();
});

// -------------------------------------------------------------
// Root Status Page
// -------------------------------------------------------------
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ResQQR Emergency Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; text-align: center; }
          .card { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 20px; padding: 36px; border: 1px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .badge { display: inline-block; background: #dc2626; color: white; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .btn { display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; margin-top: 16px; transition: background 0.2s; }
          .btn:hover { background: #b91c1c; }
          .status { color: #34d399; font-weight: 600; margin-top: 20px; font-size: 13px; }
          .endpoints { text-align: left; background: #0f172a; border-radius: 12px; padding: 16px; margin-top: 20px; font-size: 12px; font-family: monospace; color: #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">API Service Active</div>
          <h1>ResQQR Emergency Backend API</h1>
          <p>The secure medical triage API is operational and serving encrypted emergency profiles.</p>
          <div class="status">● Connected to Firebase Cloud Firestore (emergency-qr-997c0)</div>
          <a class="btn" href="https://emergency-qr-997c0.web.app" target="_blank">Open Emergency Web App &rarr;</a>
          <div class="endpoints">
            <strong>Key API Endpoints:</strong><br/>
            • GET <a href="/api/health" style="color:#60a5fa">/api/health</a> - Service health check<br/>
            • GET <a href="/api/profiles/demo" style="color:#60a5fa">/api/profiles/demo</a> - Pre-seeded medical scenarios<br/>
            • POST /api/profile - Encrypt and save profile<br/>
            • GET /api/scan/:token - Decrypted emergency triage scan<br/>
            • POST /api/scan/:token/notify-location - GPS location dispatch
          </div>
        </div>
      </body>
    </html>
  `);
});

// -------------------------------------------------------------
// 1. Healthcheck Endpoint
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Emergency Response QR Backend',
    version: '1.0.0'
  });
});

// -------------------------------------------------------------
// 2. Pre-seeded Demo Profiles with Valid Tokens
// -------------------------------------------------------------
app.get('/api/profiles/demo', async (req: Request, res: Response) => {
  try {
    const list = await storage.listProfiles();
    const demoProfiles = list.map((profile) => ({
      id: profile.id,
      fullName: profile.fullName,
      bloodType: profile.bloodType,
      allergies: profile.allergies,
      chronicConditions: profile.chronicConditions,
      token: encryptId(profile.id)
    }));
    res.json({ success: true, demos: demoProfiles });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve demo profiles', details: err.message });
  }
});

// -------------------------------------------------------------
// 3. Create or Save Medical Profile & Generate Encrypted Token
// -------------------------------------------------------------
app.post('/api/profile', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || !body.fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const savedProfile = await storage.saveProfile(body);
    const token = encryptId(savedProfile.id);

    res.status(201).json({
      success: true,
      token,
      profile: savedProfile,
      scanUrl: `/scan/${token}`
    });
  } catch (err: any) {
    console.error('Error saving medical profile:', err);
    res.status(500).json({ error: 'Failed to save profile', details: err.message });
  }
});

// -------------------------------------------------------------
// 4. Update Profile
// -------------------------------------------------------------
app.put('/api/profile/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (!isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const profileId = decryptId(token);
    const updated = await storage.updateProfile(profileId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update profile', details: err.message });
  }
});

// -------------------------------------------------------------
// 5. Fetch Public-Safe Profile for QR Scan (Emergency Responder View)
// -------------------------------------------------------------
app.get('/api/scan/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (!isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid or malformed emergency QR token' });
    }

    const profileId = decryptId(token);
    const profile = await storage.getProfileById(profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Emergency medical profile not found' });
    }

    // Check if sensitive records are PIN-protected
    const isProtected = Boolean(profile.privacyPin && profile.privacyPin.trim().length > 0);

    // Sanitize and return strictly public-safe emergency data
    const publicSafeData: PublicEmergencyProfile = {
      idToken: token,
      fullName: profile.fullName,
      age: profile.age,
      gender: profile.gender,
      bloodType: profile.bloodType,
      allergies: profile.allergies || [],
      // When PIN is active, withhold sensitive conditions/medications until unlocked
      chronicConditions: isProtected ? [] : (profile.chronicConditions || []),
      medications: isProtected ? [] : (profile.medications || []),
      organDonor: profile.organDonor,
      resuscitationStatus: profile.resuscitationStatus,
      criticalNotes: isProtected ? undefined : profile.criticalNotes,
      preferredHospital: profile.preferredHospital,
      isPinProtected: isProtected,
      isUnlocked: !isProtected,
      emergencyContacts: (profile.emergencyContacts || []).map((contact) => ({
        id: contact.id,
        name: contact.name,
        relationship: contact.relationship || 'Emergency Contact',
        phone: contact.phone,
        isPrimary: contact.isPrimary,
        hasProxyRelay: true
      })),
      scannedAt: new Date().toISOString()
    };

    res.json(publicSafeData);
  } catch (err: any) {
    console.error('Error fetching scan data:', err);
    res.status(400).json({ error: 'Invalid or expired QR token', details: err.message });
  }
});

// -------------------------------------------------------------
// 5b. Verify Privacy PIN or First Responder Emergency Override
// -------------------------------------------------------------
app.post('/api/scan/:token/verify-pin', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { pin, override, reason } = req.body;

    if (!isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid or malformed emergency QR token' });
    }

    const profileId = decryptId(token);
    const profile = await storage.getProfileById(profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Emergency medical profile not found' });
    }

    const correctPin = profile.privacyPin?.trim();

    if (!correctPin || override === true || pin === correctPin) {
      if (override === true) {
        console.log(`🚨 [PARAMEDIC OVERRIDE] First responder unlocked records for ${profile.fullName} (Reason: ${reason || 'Critical Triage'})`);
      }

      const unlockedData: PublicEmergencyProfile = {
        idToken: token,
        fullName: profile.fullName,
        age: profile.age,
        gender: profile.gender,
        bloodType: profile.bloodType,
        allergies: profile.allergies || [],
        chronicConditions: profile.chronicConditions || [],
        medications: profile.medications || [],
        organDonor: profile.organDonor,
        resuscitationStatus: profile.resuscitationStatus,
        criticalNotes: profile.criticalNotes,
        preferredHospital: profile.preferredHospital,
        isPinProtected: true,
        isUnlocked: true,
        emergencyContacts: (profile.emergencyContacts || []).map((contact) => ({
          id: contact.id,
          name: contact.name,
          relationship: contact.relationship || 'Emergency Contact',
          phone: contact.phone,
          isPrimary: contact.isPrimary,
          hasProxyRelay: true
        })),
        scannedAt: new Date().toISOString()
      };

      return res.json({ success: true, profile: unlockedData });
    }

    return res.status(401).json({ error: 'Incorrect 4-digit PIN' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify PIN', details: err.message });
  }
});

// -------------------------------------------------------------
// 6. Bystander GPS Location Broadcast (Alert Family / Emergency Contacts)
// -------------------------------------------------------------
app.post('/api/scan/:token/notify-location', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { latitude, longitude, accuracy, bystanderNote } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Valid latitude and longitude coordinates are required' });
    }

    if (!isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid emergency token' });
    }

    const profileId = decryptId(token);
    const profile = await storage.getProfileById(profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Medical profile not found' });
    }

    const alertResult = await notifications.sendEmergencyLocationAlert(profile, {
      latitude,
      longitude,
      accuracy,
      bystanderNote
    });

    res.json(alertResult);
  } catch (err: any) {
    console.error('Error broadcasting emergency location:', err);
    res.status(500).json({ error: 'Failed to broadcast location alert', details: err.message });
  }
});

// -------------------------------------------------------------
// 6b. Encrypted Voice Relay (Masked Emergency Call & Caller ID Privacy)
// -------------------------------------------------------------
app.post('/api/scan/:token/call-contact', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { contactId } = req.body;

    if (!isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid emergency token' });
    }

    const profileId = decryptId(token);
    const profile = await storage.getProfileById(profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Medical profile not found' });
    }

    const result = await notifications.initiateMaskedEmergencyCall(profile, contactId);
    res.json(result);
  } catch (err: any) {
    console.error('Error initiating encrypted proxy call:', err);
    res.status(500).json({ error: 'Failed to initiate proxy call', details: err.message });
  }
});

// -------------------------------------------------------------
// 7. Nearby Hospitals & Emergency Clinics (Overpass API Proxy)
// -------------------------------------------------------------
app.get('/api/hospitals', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : 7500;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    const facilities = await hospitals.getNearbyHospitals(lat, lng, radius);
    res.json({
      success: true,
      origin: { lat, lng },
      count: facilities.length,
      facilities
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to locate hospitals', details: err.message });
  }
});

// -------------------------------------------------------------
// 8. Recent Emergency Alerts (Audit Log)
// -------------------------------------------------------------
app.get('/api/alerts', (req: Request, res: Response) => {
  res.json({
    success: true,
    alerts: notifications.getRecentAlerts()
  });
});

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`🚀 Emergency Response QR Backend running on http://localhost:${PORT}`);
  console.log(`📡 Ready to serve encrypted emergency profiles and bystander responder views.`);
});

export default app;
