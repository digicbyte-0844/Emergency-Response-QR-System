# 🔥 Firebase Free-Tier Setup Guide (100% Free Forever)

This guide walks you through setting up **Firebase Cloud Firestore** and **Firebase Hosting** completely free on the **Spark Plan** (No credit card or billing required).

---

## 🎁 What Is Included for Free?

On the Firebase Spark Plan:
- **Cloud Firestore**: 1 GiB stored data, 50,000 document reads/day, 20,000 document writes/day.
- **Firebase Hosting**: 10 GB storage, 360 MB/day data transfer, global CDN, free SSL certificate.
- **Cost**: $0.00 / month.

---

## 🛠️ Step-by-Step Setup (Takes ~3 minutes)

### Step 1: Create a Free Project in Firebase Console
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/) and sign in with any Google account.
2. Click **"Add project"** (or "Create a project").
3. Name your project (e.g. `resqqr-emergency-app`).
4. (Optional) Disable Google Analytics to skip extra prompts, then click **"Create project"**.
5. Your project will be on the default **Spark Plan (Free)**.

---

### Step 2: Enable Cloud Firestore
1. In your Firebase project sidebar, click **"Build"** → **"Firestore Database"**.
2. Click **"Create database"**.
3. Choose a location closest to your users (e.g., `nam5 (us-central)` or `eur3 (europe-west)`).
4. For security rules, select **"Start in production mode"** (our backend uses the Admin SDK with `firestore.rules`).
5. Click **"Enable"**. Your database is now live!

---

### Step 3: Generate the Free Service Account Key (One-Time)
1. Click the ⚙️ **Gear icon** next to *Project Overview* in the top left, then select **"Project settings"**.
2. Go to the **"Service accounts"** tab.
3. Click the blue **"Generate new private key"** button, then confirm by clicking **"Generate key"**.
4. A JSON file will download to your computer.

---

### Step 4: Connect the Key to Your Project

You have **two simple options**:

#### Option A: File Drop (Easiest for Local Development)
Rename the downloaded JSON file to `serviceAccountKey.json` and move it into the `backend/` directory:
```
C:\projects\Emergency Response QR System\backend\serviceAccountKey.json
```

#### Option B: Environment Variable (Best for Cloud e.g. Render / Railway / Vercel)
Open `backend/.env` and paste the contents of your downloaded file into `FIREBASE_SERVICE_ACCOUNT_KEY`:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'
```

---

### Step 5: Verify the Connection

Run the automated verification script from your terminal:

```bash
npm run test:firebase
```

Expected output:
```text
🔥 Testing Firebase Cloud Firestore connection (Spark Free Tier)...
🔥 Firebase Cloud Firestore initialized successfully (Spark Free Tier).
📡 Performing Firestore read/write test...
✅ Write successful! Document saved in Firestore with ID: ping_1728800000
✅ Read successful! Retrieved: "Firebase Free Tier Test Profile" (O+)

🎉 FIREBASE CLOUD FIRESTORE CONNECTION VERIFIED & OPERATIONAL!
```

---

## 🌐 Deploying Frontend to Firebase Hosting (Free)

Deploy your React frontend to a free `.web.app` / `.firebaseapp.com` domain with global CDN:

1. Log in to the Firebase CLI:
   ```bash
   npx firebase login
   ```
2. Link your project ID:
   ```bash
   npx firebase use --add
   ```
   *(Select the project you created in Step 1)*
3. Build and deploy:
   ```bash
   npm run deploy:frontend
   ```

Your emergency app is now live with free SSL!
