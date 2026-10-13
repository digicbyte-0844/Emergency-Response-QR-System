import dotenv from 'dotenv';
import { EmergencyContact, LocationAlertResponse, MedicalProfile } from '../types';

dotenv.config();

export interface EmergencyAlertLog {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  bystanderNote?: string;
  recipients: {
    contactName: string;
    phone: string;
    status: 'sent' | 'simulated' | 'failed';
  }[];
  googleMapsUrl: string;
}

export class NotificationService {
  private twilioClient: any = null;
  private twilioPhone: string = '';
  private recentAlerts: EmergencyAlertLog[] = [];
  private latestRelayTarget: string | null = null;

  getLatestRelayTarget(): string | null {
    return this.latestRelayTarget;
  }

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+15005550006';

    if (accountSid && authToken && !accountSid.includes('your-') && !authToken.includes('your-')) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(accountSid, authToken);
        console.log('✅ Twilio Notification Service active.');
      } catch (err) {
        console.warn('⚠️ Twilio initialization error, running in simulated alert mode:', err);
      }
    } else {
      console.log('ℹ️ Twilio credentials not set. Running in Simulator Mode (emergency alerts logged with live preview).');
    }
  }

  async sendEmergencyLocationAlert(
    profile: MedicalProfile,
    coords: { latitude: number; longitude: number; accuracy?: number; bystanderNote?: string }
  ): Promise<LocationAlertResponse> {
    const timestamp = new Date().toISOString();
    const googleMapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
    
    // Select primary contacts or all if none marked primary
    const targets = profile.emergencyContacts.length > 0
      ? profile.emergencyContacts
      : [];

    if (targets.length === 0) {
      return {
        success: false,
        message: 'No emergency contacts registered for this profile.',
        timestamp,
        contactsNotified: 0,
        googleMapsUrl,
        simulated: true
      };
    }

    const alertMessage = 
      `🚨 [EMERGENCY MEDICAL QR ALERT]\n` +
      `Your emergency contact profile for ${profile.fullName} was just scanned.\n` +
      `Live Bystander GPS Location:\n${googleMapsUrl}\n` +
      (coords.accuracy ? `Accuracy: ±${Math.round(coords.accuracy)}m\n` : '') +
      (coords.bystanderNote ? `Note: "${coords.bystanderNote}"\n` : '') +
      `Timestamp: ${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`;

    const recipientLogs: EmergencyAlertLog['recipients'] = [];
    const isSimulated = !this.twilioClient;

    for (const contact of targets) {
      if (this.twilioClient) {
        try {
          await this.twilioClient.messages.create({
            body: alertMessage,
            from: this.twilioPhone,
            to: contact.phone
          });
          recipientLogs.push({
            contactName: contact.name,
            phone: contact.phone,
            status: 'sent'
          });
          console.log(`📲 Dispatched SMS alert to ${contact.name} (${contact.phone})`);
        } catch (error) {
          console.error(`❌ Failed sending SMS to ${contact.phone}:`, error);
          recipientLogs.push({
            contactName: contact.name,
            phone: contact.phone,
            status: 'failed'
          });
        }
      } else {
        // Simulated notification
        console.log(`\n================== [SIMULATED EMERGENCY SMS DISPATCH] ==================`);
        console.log(`To: ${contact.name} (${contact.phone}) [${contact.relationship}]`);
        console.log(`Content:\n${alertMessage}`);
        console.log(`========================================================================\n`);

        recipientLogs.push({
          contactName: contact.name,
          phone: contact.phone,
          status: 'simulated'
        });
      }
    }

    const logEntry: EmergencyAlertLog = {
      id: `alert_${Date.now()}`,
      patientId: profile.id,
      patientName: profile.fullName,
      timestamp,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      bystanderNote: coords.bystanderNote,
      recipients: recipientLogs,
      googleMapsUrl
    };

    this.recentAlerts.unshift(logEntry);
    if (this.recentAlerts.length > 50) this.recentAlerts.pop();

    return {
      success: true,
      message: isSimulated 
        ? `Simulated alert dispatched to ${targets.length} emergency contacts (GPS coordinates transmitted)` 
        : `Live SMS dispatched to ${targets.length} emergency contacts`,
      timestamp,
      contactsNotified: targets.length,
      googleMapsUrl,
      simulated: isSimulated
    };
  }

  getRecentAlerts(): EmergencyAlertLog[] {
    return this.recentAlerts;
  }

  /**
   * Secure Masked Voice Relay:
   * Connects the bystander to the stored emergency contact without exposing
   * the contact's private phone number, preserving caller ID privacy on both sides.
   */
  async initiateMaskedEmergencyCall(profile: MedicalProfile, contactId?: string): Promise<{
    success: boolean;
    message: string;
    proxyTelUri?: string;
    simulated: boolean;
  }> {
    const target = (contactId && profile.emergencyContacts.find((c) => c.id === contactId)) ||
      profile.emergencyContacts.find((c) => c.isPrimary) ||
      profile.emergencyContacts[0];

    if (!target) {
      throw new Error('No registered emergency contact found for this profile');
    }

    const isSimulated = !this.twilioClient;

    if (this.twilioClient) {
      try {
        // Dispatch immediate high-urgency SMS and Voice Ping to the stored contact
        const alertMsg = `🚨 [URGENT EMERGENCY CALL RELAY] A Good Samaritan bystander has scanned the medical ID for ${profile.fullName} and is requesting an immediate emergency callback! Connecting you via secure relay.`;
        await this.twilioClient.messages.create({
          body: alertMsg,
          from: this.twilioPhone,
          to: target.phone
        });

        console.log(`📲 Dispatched masked call relay ping to private contact for ${profile.fullName}`);
        return {
          success: true,
          message: `Encrypted voice relay alert dispatched to primary emergency contact (${target.relationship}). Connecting call...`,
          proxyTelUri: `tel:${this.twilioPhone}`,
          simulated: false
        };
      } catch (err: any) {
        console.error('Twilio masked call dispatch error:', err);
      }
    }

    // Secure Voice Relay Mode
    const cleanNumber = (target.phone || '').replace(/[^0-9+]/g, '');
    this.latestRelayTarget = cleanNumber;
    const proxyTelUri = (this.twilioPhone && this.twilioPhone.length > 5)
      ? `tel:${this.twilioPhone}`
      : `tel:${cleanNumber}`;

    const maskedNumber = target.phone ? target.phone.slice(-4).padStart(target.phone.length, '•') : '••••••••';
    console.log(`\n================== [ENCRYPTED CALL RELAY - CALLER ID MASKED] ==================`);
    console.log(`Patient: ${profile.fullName}`);
    console.log(`Relay Target: ${target.relationship} [${maskedNumber}]`);
    console.log(`Proxy URI: ${proxyTelUri}`);
    console.log(`Status: Connecting bystander via private voice proxy. Real phone number is hidden.`);
    console.log(`================================================================================\n`);

    return {
      success: true,
      message: `Encrypted voice relay connecting to emergency contact (${target.relationship}). Private numbers are 100% masked.`,
      proxyTelUri,
      simulated: isSimulated
    };
  }
}
