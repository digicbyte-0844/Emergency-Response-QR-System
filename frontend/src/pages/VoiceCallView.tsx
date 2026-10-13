import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { AgoraVoiceTokenData } from '../types';
import { AgoraVoiceManager, VoiceCallState } from '../services/agoraVoice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faPhoneSlash, 
  faMicrophone, 
  faMicrophoneSlash, 
  faShieldHalved, 
  faHeartPulse, 
  faTriangleExclamation,
  faCircleCheck,
  faHeadset
} from '@fortawesome/free-solid-svg-icons';

export const VoiceCallView: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<AgoraVoiceTokenData | null>(null);

  // Call state
  const [callState, setCallState] = useState<VoiceCallState>('idle');
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const voiceManagerRef = useRef<AgoraVoiceManager | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid emergency voice link');
      setLoading(false);
      return;
    }

    // Initialize Agora Voice Manager
    voiceManagerRef.current = new AgoraVoiceManager({
      onStateChange: (newState) => {
        setCallState(newState);
        if (newState === 'connected') {
          timerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        } else if (newState === 'idle' || newState === 'error') {
          if (timerRef.current) clearInterval(timerRef.current);
          setCallDuration(0);
          setRemoteConnected(false);
        }
      },
      onRemoteUserJoined: () => {
        setRemoteConnected(true);
      },
      onRemoteUserLeft: () => {
        setRemoteConnected(false);
      },
      onError: (err) => {
        setError(`Audio connection error: ${err.message}`);
      },
    });

    // Request Agora token for emergency contact
    api.getAgoraVoiceToken(token, 'contact')
      .then((data) => {
        setTokenData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Unable to join emergency voice channel.');
        setLoading(false);
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (voiceManagerRef.current) {
        voiceManagerRef.current.endCall();
      }
    };
  }, [token]);

  const handleStartCall = async () => {
    if (!tokenData || !voiceManagerRef.current) return;
    setError(null);

    try {
      await voiceManagerRef.current.startCall({
        appId: tokenData.appId,
        channelName: tokenData.channelName,
        token: tokenData.token,
        uid: tokenData.uid,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to access microphone. Please grant mic permissions.');
    }
  };

  const handleToggleMute = () => {
    if (voiceManagerRef.current) {
      const muted = voiceManagerRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleEndCall = async () => {
    if (voiceManagerRef.current) {
      await voiceManagerRef.current.endCall();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-800">Connecting to Encrypted Voice Channel...</p>
        <p className="text-xs text-slate-500 mt-1">Agora RTC Cloud Gateway</p>
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl p-6 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-lg">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Voice Channel Unavailable</h2>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
          <Link
            to="/"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      
      {/* Header Info */}
      <div className="max-w-md w-full mx-auto space-y-4 pt-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <FontAwesomeIcon icon={faHeadset} />
            </div>
            <span className="font-bold text-sm tracking-tight">ResQQR Voice Relay</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2.5 py-1 rounded-full text-[11px] font-semibold">
            <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            <span>Encrypted WebRTC</span>
          </div>
        </div>

        {/* Patient Emergency Card */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Medical Emergency Call For
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                {tokenData?.patientName}
              </h2>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                Target: {tokenData?.relationship}
              </p>
            </div>

            <div className="bg-red-950/80 border border-red-800 px-3 py-1 rounded-lg text-center">
              <span className="block text-[8px] font-bold text-red-400 uppercase">Blood</span>
              <span className="text-lg font-black text-red-400 leading-none">{tokenData?.bloodType}</span>
            </div>
          </div>

          {tokenData?.allergies && tokenData.allergies.length > 0 && (
            <div className="pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-xs">
              <span className="text-red-400 font-bold">Allergies:</span>
              <span className="text-slate-300 truncate">{tokenData.allergies.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Call Panel */}
      <div className="max-w-md w-full mx-auto my-auto text-center space-y-6 py-8">
        
        {/* Animated Avatar / Ripple Pulse */}
        <div className="relative inline-flex items-center justify-center">
          {callState === 'connected' && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping"></div>
              <div className="absolute w-28 h-28 rounded-full bg-emerald-500/30 animate-pulse"></div>
            </>
          )}

          {callState === 'connecting' && (
            <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/50 border-t-transparent animate-spin"></div>
          )}

          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all ${
              callState === 'connected'
                ? 'bg-emerald-600 text-white'
                : callState === 'connecting'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <FontAwesomeIcon icon={callState === 'connected' ? faHeartPulse : faPhone} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold">
            {callState === 'connected'
              ? (remoteConnected ? 'Bystander Connected (Speaking)' : 'Waiting for Bystander to Speak...')
              : callState === 'connecting'
              ? 'Establishing Encrypted Channel...'
              : 'Incoming Emergency Voice Call'}
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            {callState === 'connected'
              ? `Call Duration: ${formatTimer(callDuration)}`
              : 'A bystander with the patient is requesting immediate audio contact.'}
          </p>

          <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500">
            <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500 text-[10px]" />
            <span>Zero personal phone numbers are visible or exchanged.</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800/80 text-red-200 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

      </div>

      {/* Call Action Controls */}
      <div className="max-w-md w-full mx-auto pb-4">
        {callState === 'connected' ? (
          <div className="flex items-center justify-center gap-6">
            {/* Mute button */}
            <button
              onClick={handleToggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-lg transition shadow-md ${
                isMuted
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} />
            </button>

            {/* End Call button */}
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white flex items-center justify-center text-xl transition shadow-lg"
              title="Hang up call"
            >
              <FontAwesomeIcon icon={faPhoneSlash} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleStartCall}
              disabled={callState === 'connecting'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition shadow-lg cursor-pointer"
            >
              <FontAwesomeIcon icon={faPhone} />
              <span>{callState === 'connecting' ? 'Connecting Audio...' : 'Answer Emergency Call'}</span>
            </button>

            <Link
              to={`/scan/${token}`}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium text-xs flex items-center justify-center transition text-center"
            >
              View Patient Medical Profile
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};
