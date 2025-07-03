// Enhanced Auto-Escalation System
export const autoEscalationRules = {
  // Auto-forward based on criteria
  department: {
    'Cardiology': { urgentKeywords: ['chest pain', 'heart attack', 'cardiac'], autoForward: true },
    'Emergency': { allAppointments: true, autoForward: true },
    'Neurology': { urgentKeywords: ['stroke', 'seizure', 'head injury'], autoForward: true }
  },
  
  // Time-based escalation
  timeRules: {
    pendingOver24Hours: 'autoForward',
    urgentPendingOver4Hours: 'alertSuperAdmin',
    rejectedAppointments: 'suggestAlternatives'
  },
  
  // Patient history analysis
  patientHistory: {
    multipleRejections: 'autoForward',
    vipPatients: 'priorityReview',
    emergencyHistory: 'flagForReview'
  }
};

// Smart Appointment Suggestions
export const smartSuggestions = {
  rejectedAppointments: {
    suggestAlternativeDates: true,
    suggestSimilarDepartments: true,
    suggestTeleconsultation: true
  },
  
  resourceOptimization: {
    suggestLessLoadedDays: true,
    alternateDoctors: true,
    timeSlotOptimization: true
  }
};

// Advanced Notification Intelligence
export const notificationIntelligence = {
  patientPreferences: {
    preferredChannel: 'email|sms|whatsapp',
    timeZone: 'Asia/Kolkata',
    languagePreference: 'en|hi',
    quietHours: { start: '22:00', end: '08:00' }
  },
  
  adaptiveMessaging: {
    urgentCases: 'immediateSend',
    normalCases: 'respectQuietHours',
    multiChannelFallback: true
  }
};
