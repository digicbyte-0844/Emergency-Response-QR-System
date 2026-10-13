# 💻 Complete Implementation Guide: Emergency QR System

This document provides the step-by-step terminal commands, folder structures, and critical code snippets to build the complete full-stack application.

---

## 📂 1. Master Folder Structure

Create a root folder for your project to house both the frontend and backend.

```bash
mkdir emergency-qr-system
cd emergency-qr-system
```

---

## 🛠️ 2. Backend Setup (Node.js + Express + TypeScript)

This service will handle encryption, database interactions, and Twilio calls.

### Initialization

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv firebase-admin twilio
npm install -D typescript @types/node @types/express @types/cors ts-node nodemon
npx tsc --init
```

### Critical Code: Encryption & Decryption (`backend/src/utils/crypto.ts`)
You need to encrypt the Firebase Document ID so it isn't exposed in the QR code URL.

```typescript
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!!'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16;

export function encryptId(text: string) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptId(text: string) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift() as string, 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
```

### Critical Code: Express API Routes (`backend/src/index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import { encryptId, decryptId } from './utils/crypto';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Requires serviceAccountKey.json from Firebase Console)
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Save Profile & Generate Encrypted Token
app.post('/api/profile', async (req, res) => {
    try {
        const docRef = await db.collection('users').add(req.body);
        const token = encryptId(docRef.id);
        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// 2. Fetch Profile via Encrypted Token (For the QR Scan)
app.get('/api/scan/:token', async (req, res) => {
    try {
        const userId = decryptId(req.params.token);
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) return res.status(404).json({ error: 'Not found' });
        
        // ONLY return public-safe data!
        const data = doc.data();
        res.json({
            name: data?.name,
            bloodType: data?.bloodType,
            allergies: data?.allergies
        });
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
});

app.listen(3000, () => console.log('Backend running on port 3000'));
```

---

## 🎨 3. Frontend Setup (React + Vite + Tailwind)

This is the user interface for both registration and the emergency scan screen.

### Initialization

```bash
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios qrcode.react react-leaflet leaflet lucide-react firebase
```

*Configure Tailwind:* Update `tailwind.config.js` to include `./src/**/*.{js,jsx,ts,tsx}` in the `content` array.

### Critical Code: Generating the QR Code (`frontend/src/pages/Dashboard.tsx`)

```tsx
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

export default function Dashboard() {
  const [formData, setFormData] = useState({ name: '', bloodType: '', allergies: '' });
  const [qrToken, setQrToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send to backend to save in Firebase & get encrypted token
    const res = await axios.post('http://localhost:3000/api/profile', formData);
    setQrToken(res.data.token);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Setup Medical Profile</h1>
      {/* Form inputs would go here... */}
      <button onClick={handleSubmit} className="bg-blue-600 text-white w-full py-2 rounded">
        Generate Emergency QR
      </button>

      {qrToken && (
        <div className="mt-8 p-4 border-2 border-dashed border-gray-300 text-center">
          <p className="mb-2 font-bold text-red-600">Scan for Emergency Info</p>
          <QRCodeSVG 
            value={`https://your-frontend-domain.web.app/scan/${qrToken}`} 
            size={200} 
            className="mx-auto"
          />
          <p className="mt-2 text-sm text-gray-500">Print this and keep it in your wallet.</p>
        </div>
      )}
    </div>
  );
}
```

### Critical Code: The Public Scan Screen (`frontend/src/pages/ScanView.tsx`)
*This is the mobile-first view the bystander sees.*

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { PhoneAlert } from 'lucide-react'; // Icon library

export default function ScanView() {
  const { token } = useParams();
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    // Fetch decrypted safe data from backend
    axios.get(`http://localhost:3000/api/scan/${token}`)
      .then(res => setPatientData(res.data))
      .catch(err => console.error("Error fetching data", err));
  }, [token]);

  if (!patientData) return <div className="p-10 text-center text-xl">Loading Secure Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 text-center font-bold text-xl uppercase tracking-widest">
        Emergency Medical Info
      </div>

      {/* Vitals Card */}
      <div className="p-6">
        <h2 className="text-3xl font-black text-slate-800">{patientData.name}</h2>
        <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-600">
          <p className="text-sm text-red-800 font-bold uppercase">Blood Type</p>
          <p className="text-2xl font-black text-red-600">{patientData.bloodType}</p>
        </div>
        <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500">
          <p className="text-sm text-yellow-800 font-bold uppercase">Critical Allergies</p>
          <p className="text-lg font-bold text-slate-800">{patientData.allergies}</p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="px-6 pb-6">
         <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center text-gray-500 shadow-inner">
             [Leaflet Map Component Here]
         </div>
      </div>

      {/* Sticky Footer: The 3-Second Rule Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-4 rounded-xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg">
          <PhoneAlert size={28} />
          Call Emergency Contact
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">Your phone number will be kept private.</p>
      </div>
    </div>
  );
}
```

---

## 🗺️ 4. Overpass API Map Query (Free Hospital Locator)

To find nearby hospitals without Google Maps API keys, use this frontend utility function when the page loads:

```typescript
export async function getNearbyHospitals(lat: number, lng: number) {
  // Search radius: 5000 meters
  const query = `
    [out:json];
    node(around:5000, ${lat}, ${lng})["amenity"="hospital"];
    out 10;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  const response = await fetch(url);
  const data = await response.json();
  return data.elements; // Returns array of hospital nodes with lat/lng
}
```

---

## 🚀 5. Deployment Checklist

1. **Backend (Render / Railway):**
   * Push backend folder to GitHub.
   * Connect repo to Render.com as a "Web Service".
   * Add Environment Variables: `ENCRYPTION_KEY`, `TWILIO_SID`, `TWILIO_AUTH`, and Firebase credentials.
2. **Frontend (Firebase Hosting):**
   * Change `http://localhost:3000` in your React code to your new Render backend URL.
   * Run `npm run build` in the frontend folder.
   * Run `firebase init hosting` and point the public directory to `dist`.
   * Run `firebase deploy`.