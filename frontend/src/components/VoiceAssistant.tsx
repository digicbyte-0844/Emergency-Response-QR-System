import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { PublicEmergencyProfile } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

interface VoiceAssistantProps {
  profile: PublicEmergencyProfile;
  language?: SupportedLanguage;
}

const LANG_BCP47: Record<SupportedLanguage, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  zh: 'zh-CN',
  hi: 'hi-IN',
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ profile, language = 'en' }) => {
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleSpeak = () => {
    if (!supported) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const primaryContact = profile.emergencyContacts.find((c) => c.isPrimary) || profile.emergencyContacts[0];
    
    let textToSpeak = '';
    const bcp47 = LANG_BCP47[language] || 'en-US';

    if (language === 'es') {
      const allergyText = profile.allergies && profile.allergies.length > 0
        ? `Alergias graves: ${profile.allergies.join(', ')}.`
        : 'Sin alergias conocidas.';
      const condText = profile.chronicConditions && profile.chronicConditions.length > 0
        ? `Condiciones médicas: ${profile.chronicConditions.join(', ')}.`
        : '';
      const notesText = profile.criticalNotes ? `Nota de emergencia: ${profile.criticalNotes}` : '';
      const contactText = primaryContact ? 'Contacto de emergencia registrado y disponible a través del relé seguro.' : '';

      textToSpeak = `Informe médico de emergencia para ${profile.fullName}. Grupo sanguíneo: ${profile.bloodType}. ${allergyText} ${condText} ${notesText} ${contactText}`;
    } else if (language === 'fr') {
      const allergyText = profile.allergies && profile.allergies.length > 0
        ? `Allergies sévères: ${profile.allergies.join(', ')}.`
        : 'Aucune allergie connue.';
      const condText = profile.chronicConditions && profile.chronicConditions.length > 0
        ? `Affections chroniques: ${profile.chronicConditions.join(', ')}.`
        : '';
      const notesText = profile.criticalNotes ? `Consigne d'urgence: ${profile.criticalNotes}` : '';
      const contactText = primaryContact ? 'Contact d\'urgence enregistré disponible par relais vocal sécurisé.' : '';

      textToSpeak = `Rapport médical d'urgence pour ${profile.fullName}. Groupe sanguin: ${profile.bloodType}. ${allergyText} ${condText} ${notesText} ${contactText}`;
    } else if (language === 'zh') {
      const allergyText = profile.allergies && profile.allergies.length > 0
        ? `严重过敏: ${profile.allergies.join(', ')}。`
        : '无已知过敏。';
      const condText = profile.chronicConditions && profile.chronicConditions.length > 0
        ? `慢性疾病: ${profile.chronicConditions.join(', ')}。`
        : '';
      const notesText = profile.criticalNotes ? `急救说明: ${profile.criticalNotes}` : '';
      const contactText = primaryContact ? '紧急联系人已配置，可通过隐私加密通话联系。' : '';

      textToSpeak = `患者 ${profile.fullName} 的紧急医疗信息。血型：${profile.bloodType}。${allergyText} ${condText} ${notesText} ${contactText}`;
    } else if (language === 'hi') {
      const allergyText = profile.allergies && profile.allergies.length > 0
        ? `गंभीर एलर्जी: ${profile.allergies.join(', ')}.`
        : 'कोई ज्ञात एलर्जी नहीं.';
      const contactText = primaryContact ? 'आपातकालीन संपर्क सुरक्षित एन्क्रिप्टेड रिले के माध्यम से उपलब्ध है।' : '';

      textToSpeak = `रोगी ${profile.fullName} के लिए आपातकालीन रिपोर्ट। रक्त समूह: ${profile.bloodType}। ${allergyText} ${contactText}`;
    } else {
      // Default English
      const allergyText = profile.allergies && profile.allergies.length > 0
        ? `Severe allergies: ${profile.allergies.join(', ')}.`
        : 'No known allergies listed.';
      const condText = profile.chronicConditions && profile.chronicConditions.length > 0
        ? `Medical conditions: ${profile.chronicConditions.join(', ')}.`
        : '';
      const notesText = profile.criticalNotes ? `Emergency notes: ${profile.criticalNotes}` : '';
      const contactText = primaryContact ? 'Emergency contact is registered and protected via encrypted voice relay.' : '';

      textToSpeak = `Emergency medical report for ${profile.fullName}. Blood type: ${profile.bloodType}. ${allergyText} ${condText} ${notesText} ${contactText}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = bcp47;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (!supported) return null;

  return (
    <button
      onClick={handleSpeak}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
        speaking
          ? 'bg-red-600 text-white shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
      }`}
      title="Audio voice readout of emergency vitals"
    >
      <FontAwesomeIcon icon={speaking ? faVolumeXmark : faVolumeHigh} className="text-xs" />
      <span>{speaking ? t.voiceStop : t.voiceReadout}</span>
    </button>
  );
};
