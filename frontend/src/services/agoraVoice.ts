import AgoraRTC, { 
  IAgoraRTCClient, 
  IMicrophoneAudioTrack, 
  IAgoraRTCRemoteUser 
} from 'agora-rtc-sdk-ng';

export type VoiceCallState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface AgoraVoiceCallCallbacks {
  onStateChange: (state: VoiceCallState) => void;
  onRemoteUserJoined?: (user: IAgoraRTCRemoteUser) => void;
  onRemoteUserLeft?: (user: IAgoraRTCRemoteUser) => void;
  onError?: (err: Error) => void;
}

export class AgoraVoiceManager {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private isMuted: boolean = false;
  private state: VoiceCallState = 'idle';

  constructor(private callbacks: AgoraVoiceCallCallbacks) {}

  private setState(newState: VoiceCallState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  async startCall(params: {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
  }): Promise<void> {
    try {
      this.setState('connecting');

      // Initialize Agora WebRTC RTC client
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Handle remote audio stream publishing
      this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType) => {
        if (!this.client) return;
        await this.client.subscribe(user, mediaType);
        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
        }
        if (this.callbacks.onRemoteUserJoined) {
          this.callbacks.onRemoteUserJoined(user);
        }
      });

      this.client.on('user-left', (user: IAgoraRTCRemoteUser) => {
        if (this.callbacks.onRemoteUserLeft) {
          this.callbacks.onRemoteUserLeft(user);
        }
      });

      // Join the encrypted channel
      await this.client.join(
        params.appId,
        params.channelName,
        params.token || null,
        params.uid
      );

      // Create and publish local microphone audio track
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'speech_standard',
        AEC: true, // Acoustic Echo Cancellation
        ANS: true, // Automatic Noise Suppression
        AGC: true, // Automatic Gain Control
      });

      await this.client.publish([this.localAudioTrack]);
      this.setState('connected');
    } catch (err: any) {
      console.error('Agora voice call failed to connect:', err);
      this.setState('error');
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      await this.endCall();
      throw err;
    }
  }

  toggleMute(): boolean {
    if (this.localAudioTrack) {
      this.isMuted = !this.isMuted;
      this.localAudioTrack.setEnabled(!this.isMuted);
      return this.isMuted;
    }
    return false;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  getState(): VoiceCallState {
    return this.state;
  }

  async endCall(): Promise<void> {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      if (this.client) {
        await this.client.leave();
        this.client.removeAllListeners();
        this.client = null;
      }
    } catch (e) {
      console.warn('Error during Agora call cleanup:', e);
    } finally {
      this.setState('idle');
      this.isMuted = false;
    }
  }
}
