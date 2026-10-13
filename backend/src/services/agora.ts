import { RtcTokenBuilder, RtcRole } from 'agora-token';
import dotenv from 'dotenv';

dotenv.config();

export interface AgoraTokenResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  expireTime: number;
  role: 'bystander' | 'contact';
}

export class AgoraVoiceService {
  private appId: string;
  private appCertificate: string;

  constructor() {
    this.appId = process.env.AGORA_APP_ID || 'e92a39a21d364dd1991cc82fae3c3e58';
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE || '6d3e806e184d46c99726451659b13dc3';

    if (this.appId && this.appCertificate) {
      console.log('🎙️ Agora Encrypted RTC Voice Service active.');
    } else {
      console.warn('⚠️ Agora credentials not fully set.');
    }
  }

  getAppId(): string {
    return this.appId;
  }

  /**
   * Generates a 2-hour encrypted voice token for the emergency channel
   */
  generateVoiceToken(
    profileId: string,
    role: 'bystander' | 'contact' = 'bystander'
  ): AgoraTokenResponse {
    // Standardize channel name from profileId
    const sanitizedId = profileId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
    const channelName = `resqqr_${sanitizedId}`;

    // Deterministic ranges: Bystanders get 1000-4999, Contacts get 5000-9999
    const uid = role === 'bystander'
      ? Math.floor(1000 + Math.random() * 4000)
      : Math.floor(5000 + Math.random() * 4000);

    const privilegeExpireTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours

    let token = '';
    if (this.appCertificate) {
      token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        privilegeExpireTime,
        privilegeExpireTime
      );
    }

    return {
      appId: this.appId,
      channelName,
      token,
      uid,
      expireTime: privilegeExpireTime,
      role
    };
  }
}
