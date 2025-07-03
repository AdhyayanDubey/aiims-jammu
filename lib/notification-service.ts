// Enhanced notification service that handles WhatsApp template restrictions
import { sendSMS, smsTemplates } from './sms';
import { sendWhatsApp, whatsappTemplates } from './whatsapp';

interface NotificationResult {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  errors: string[];
}

interface AppointmentData {
  id: string;
  patientName: string;
  department: string;
  date: string;
  time: string;
}

export async function sendAppointmentNotifications(
  email: string,
  phone: string,
  appointment: AppointmentData,
  type: 'booked' | 'approved' | 'rejected',
  feedback?: string
): Promise<NotificationResult> {
  const result: NotificationResult = {
    email: false,
    sms: false,
    whatsapp: false,
    errors: []
  };

  // Always try SMS first (most reliable)
  try {
    let smsMessage = '';
    switch (type) {
      case 'booked':
        smsMessage = smsTemplates.appointmentBooked(appointment);
        break;
      case 'approved':
        smsMessage = smsTemplates.appointmentConfirmed(appointment);
        break;
      case 'rejected':
        smsMessage = smsTemplates.appointmentRejected(appointment, feedback);
        break;
    }

    const smsResult = await sendSMS(phone, smsMessage);
    result.sms = smsResult.success;
    if (!smsResult.success) {
      result.errors.push(`SMS failed: ${smsResult.error}`);
    } else {
      console.log(`✅ SMS notification sent for ${type} appointment`);
    }
  } catch (error) {
    result.errors.push(`SMS error: ${error}`);
  }

  // Try WhatsApp (may fail due to template restrictions)
  try {
    let whatsappMessage = '';
    switch (type) {
      case 'booked':
        whatsappMessage = whatsappTemplates.appointmentBooked(appointment);
        break;
      case 'approved':
        whatsappMessage = whatsappTemplates.appointmentConfirmed(appointment, feedback);
        break;
      case 'rejected':
        whatsappMessage = whatsappTemplates.appointmentRejected(appointment, feedback);
        break;
    }

    const whatsappResult = await sendWhatsApp(phone, whatsappMessage);
    result.whatsapp = whatsappResult.success;
    if (!whatsappResult.success) {
      // Don't treat WhatsApp template errors as critical failures
      if (whatsappResult.error?.includes('template')) {
        console.log('ℹ️ WhatsApp templates not configured (this is normal for new accounts)');
        result.errors.push('WhatsApp requires pre-approved templates (SMS sent instead)');
      } else {
        result.errors.push(`WhatsApp failed: ${whatsappResult.error}`);
      }
    } else {
      console.log(`✅ WhatsApp notification sent for ${type} appointment`);
    }
  } catch (error) {
    result.errors.push(`WhatsApp error: ${error}`);
  }

  return result;
}

export function getNotificationSummary(result: NotificationResult): string {
  const successful = [];
  if (result.email) successful.push('Email');
  if (result.sms) successful.push('SMS');
  if (result.whatsapp) successful.push('WhatsApp');

  if (successful.length === 0) {
    return 'No notifications sent';
  }

  const summary = `${successful.join(' + ')} sent successfully`;
  
  if (result.errors.length > 0) {
    const whatsappTemplateError = result.errors.some(error => 
      error.includes('template') || error.includes('63016')
    );
    
    if (whatsappTemplateError && result.sms) {
      return `${summary} (WhatsApp templates not configured - SMS covers all notifications)`;
    }
  }

  return summary;
}
