export type SupportedLanguage = 'en' | 'es' | 'fr' | 'zh' | 'hi';

export interface TranslationDictionary {
  emergencyHeader: string;
  verifiedId: string;
  patientIdentity: string;
  bloodType: string;
  resuscitationStatus: string;
  organDonor: string;
  criticalAllergies: string;
  noAllergies: string;
  chronicConditions: string;
  medications: string;
  actionNote: string;
  preferredHospital: string;
  locationBeacon: string;
  locationDescription: string;
  gpsReady: string;
  sendGps: string;
  gpsTransmitting: string;
  addNote: string;
  nearbyHospitals: string;
  firstAidBtn: string;
  firstAidSubtitle: string;
  openGuide: string;
  callPrimary: string;
  callEmergencyServices: string;
  voiceReadout: string;
  voiceStop: string;
  privacyLocked: string;
  privacyUnlock: string;
  privacyOverride: string;
  enterPin: string;
  unlock: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    emergencyHeader: 'EMERGENCY MEDICAL PROFILE',
    verifiedId: 'VERIFIED MEDICAL ID',
    patientIdentity: 'Patient Identity',
    bloodType: 'Blood',
    resuscitationStatus: 'Resuscitation Status',
    organDonor: 'Organ Donor',
    criticalAllergies: 'Critical Allergies (Severe Warning)',
    noAllergies: 'No known drug or food allergies on record',
    chronicConditions: 'Chronic Conditions',
    medications: 'Current Medications',
    actionNote: 'Emergency Action Note',
    preferredHospital: 'Preferred Hospital',
    locationBeacon: 'Emergency Location Beacon',
    locationDescription: 'Transmit this incident\'s exact GPS coordinates to emergency contacts.',
    gpsReady: 'GPS Ready',
    sendGps: 'Send My GPS Location to Family',
    gpsTransmitting: 'Transmitting GPS Beacon...',
    addNote: '+ Note',
    nearbyHospitals: 'Nearby Emergency Rooms',
    firstAidBtn: 'First Aid Protocols & CPR Metronome',
    firstAidSubtitle: 'Step-by-step guidance for life-threatening situations',
    openGuide: 'Open Guide',
    callPrimary: 'Call Emergency Contact',
    callEmergencyServices: 'Encrypted Voice Relay (Caller ID Masked)',
    voiceReadout: 'Audio Vitals Voice',
    voiceStop: 'Stop Voice Readout',
    privacyLocked: 'Sensitive Records Protected',
    privacyUnlock: 'Enter 4-Digit PIN to View Extended History',
    privacyOverride: 'First Responder Override (Unlock All)',
    enterPin: 'Enter PIN',
    unlock: 'Unlock',
  },
  es: {
    emergencyHeader: 'PERFIL MÉDICO DE EMERGENCIA',
    verifiedId: 'ID MÉDICO VERIFICADO',
    patientIdentity: 'Identidad del Paciente',
    bloodType: 'Sangre',
    resuscitationStatus: 'Estado de Reanimación',
    organDonor: 'Donante de Órganos',
    criticalAllergies: 'Alergias Críticas (Alerta Severa)',
    noAllergies: 'Sin alergias conocidas a medicamentos o alimentos',
    chronicConditions: 'Condiciones Crónicas',
    medications: 'Medicamentos Actuales',
    actionNote: 'Nota de Acción de Emergencia',
    preferredHospital: 'Hospital de Preferencia',
    locationBeacon: 'Baliza de Ubicación de Emergencia',
    locationDescription: 'Transmita las coordenadas GPS exactas a los contactos de emergencia.',
    gpsReady: 'GPS Listo',
    sendGps: 'Enviar Mi Ubicación GPS a la Familia',
    gpsTransmitting: 'Transmitiendo Baliza GPS...',
    addNote: '+ Nota',
    nearbyHospitals: 'Salas de Emergencia Cercanas',
    firstAidBtn: 'Protocolos de Primeros Auxilios y Metrónomo RCP',
    firstAidSubtitle: 'Guía paso a paso para situaciones de riesgo vital',
    openGuide: 'Abrir Guía',
    callPrimary: 'Llamar al Contacto de Emergencia',
    callEmergencyServices: 'Relé de Voz Cifrado (Llamada Privada)',
    voiceReadout: 'Voz de Signos Vitales',
    voiceStop: 'Detener Voz',
    privacyLocked: 'Registros Sensibles Protegidos',
    privacyUnlock: 'Ingrese el PIN de 4 dígitos para ver el historial',
    privacyOverride: 'Anulación para Socorristas (Desbloquear Todo)',
    enterPin: 'Ingresar PIN',
    unlock: 'Desbloquear',
  },
  fr: {
    emergencyHeader: 'PROFIL MÉDICAL D\'URGENCE',
    verifiedId: 'ID MÉDICAL VÉRIFIÉ',
    patientIdentity: 'Identité du Patient',
    bloodType: 'Groupe',
    resuscitationStatus: 'Statut de Réanimation',
    organDonor: 'Donneur d\'Organes',
    criticalAllergies: 'Allergies Critiques (Alerte Sévère)',
    noAllergies: 'Aucune allergie connue enregistrée',
    chronicConditions: 'Maladies Chroniques',
    medications: 'Médicaments Actuels',
    actionNote: 'Consigne d\'Urgence Immédiate',
    preferredHospital: 'Hôpital Préféré',
    locationBeacon: 'Balise de Localisation d\'Urgence',
    locationDescription: 'Transmettez les coordonnées GPS exactes aux proches par SMS.',
    gpsReady: 'GPS Prêt',
    sendGps: 'Envoyer ma position GPS aux proches',
    gpsTransmitting: 'Transmission GPS en cours...',
    addNote: '+ Note',
    nearbyHospitals: 'Urgences Hospitalières Proches',
    firstAidBtn: 'Premiers Secours & Métronome RCP',
    firstAidSubtitle: 'Protocoles vitaux étape par étape',
    openGuide: 'Ouvrir le Guide',
    callPrimary: 'Appeler le Contact d\'Urgence',
    callEmergencyServices: 'Relais Vocal Chiffré (Appel Masqué)',
    voiceReadout: 'Lecture Vocale des Signes',
    voiceStop: 'Arrêter la Lecture',
    privacyLocked: 'Dossier Médical Étendu Protégé',
    privacyUnlock: 'Entrez le code PIN à 4 chiffres',
    privacyOverride: 'Accès Secouriste / SAMU (Déverrouiller Tout)',
    enterPin: 'Code PIN',
    unlock: 'Déverrouiller',
  },
  zh: {
    emergencyHeader: '紧急医疗档案',
    verifiedId: '已认证的紧急医疗 ID',
    patientIdentity: '患者身份',
    bloodType: '血型',
    resuscitationStatus: '抢救状态',
    organDonor: '器官捐献者',
    criticalAllergies: '严重过敏警告 (特级警报)',
    noAllergies: '无已知药物或食物过敏史',
    chronicConditions: '慢性病史',
    medications: '正在服用的药物',
    actionNote: '急救指导说明',
    preferredHospital: '首选医院',
    locationBeacon: '紧急 GPS 位置信标',
    locationDescription: '将事发现场精确 GPS 定位发送给紧急联系人。',
    gpsReady: 'GPS 已就绪',
    sendGps: '发送我的现场 GPS 位置给家属',
    gpsTransmitting: '正在发送 GPS 信标...',
    addNote: '+ 备注',
    nearbyHospitals: '附近急诊医院',
    firstAidBtn: '急救操作指南与心肺复苏节拍器',
    firstAidSubtitle: '危急情况下的逐步指导',
    openGuide: '打开指南',
    callPrimary: '致电紧急联系人',
    callEmergencyServices: '加密语音中继 (保护双方来电显示)',
    voiceReadout: '语音朗读生命体征',
    voiceStop: '停止语音',
    privacyLocked: '敏感健康记录已受保护',
    privacyUnlock: '输入4位数字 PIN 码查看完整病历',
    privacyOverride: '急救人员强制解锁 (显示全部)',
    enterPin: '输入 PIN',
    unlock: '解锁',
  },
  hi: {
    emergencyHeader: 'आपातकालीन चिकित्सा प्रोफ़ाइल',
    verifiedId: 'सत्यापित आपातकालीन मेडिकल आईडी',
    patientIdentity: 'रोगी की पहचान',
    bloodType: 'रक्त समूह',
    resuscitationStatus: 'पुनर्जीवन स्थिति (CPR)',
    organDonor: 'अंग दाता',
    criticalAllergies: 'गंभीर एलर्जी चेतावनी',
    noAllergies: 'कोई ज्ञात एलर्जी दर्ज नहीं है',
    chronicConditions: 'पुरानी बीमारियाँ',
    medications: 'वर्तमान दवाएं',
    actionNote: 'आपातकालीन निर्देश',
    preferredHospital: 'पसंदीदा अस्पताल',
    locationBeacon: 'आपातकालीन जीपीएस स्थान बीकन',
    locationDescription: 'इस घटना का सटीक जीपीएस स्थान आपातकालीन संपर्कों को भेजें।',
    gpsReady: 'जीपीएस तैयार',
    sendGps: 'परिवार को मेरा जीपीएस स्थान भेजें',
    gpsTransmitting: 'जीपीएस भेजा जा रहा है...',
    addNote: '+ टिप्पणी',
    nearbyHospitals: 'निकटतम आपातकालीन अस्पताल',
    firstAidBtn: 'प्राथमिक उपचार एवं सीपीआर मेट्रोनोम',
    firstAidSubtitle: 'जीवन रक्षक चरण-दर-चरण मार्गदर्शन',
    openGuide: 'गाइड खोलें',
    callPrimary: 'आपातकालीन संपर्क को कॉल करें',
    callEmergencyServices: 'एन्क्रिप्टेड वॉयस रिले (कॉलर आईडी सुरक्षित)',
    voiceReadout: 'ऑडियो वाइटल वॉयस',
    voiceStop: 'आवाज रोकें',
    privacyLocked: 'संवेदनशील मेडिकल रिकॉर्ड सुरक्षित हैं',
    privacyUnlock: 'विस्तृत इतिहास देखने के लिए 4-अंकीय पिन दर्ज करें',
    privacyOverride: 'प्राथमिक उत्तरदाता ओवरराइड (सभी अनलॉक करें)',
    enterPin: 'पिन दर्ज करें',
    unlock: 'अनलॉक',
  },
};
