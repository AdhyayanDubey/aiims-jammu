interface TwilioResponse {
  sid: string;
  status: string;
  error_code?: string;
  error_message?: string;
}

interface TextbeltResponse {
  success: boolean;
  error?: string;
  textId?: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  department: string;
  date: string;
  time: string;
  priority?: string;
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Additional SMS service credentials
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'AIIMSJM';

export async function sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
  console.log('📱 Attempting to send SMS to:', phoneNumber);

  // Try Fast2SMS first (most reliable for India)
  if (FAST2SMS_API_KEY) {
    const fast2smsResult = await sendFast2SMS(phoneNumber, message);
    if (fast2smsResult.success) {
      return fast2smsResult;
    }
    console.log('Fast2SMS failed, trying next service...');
  }

  // Try MSG91 second
  if (MSG91_AUTH_KEY) {
    const msg91Result = await sendMSG91SMS(phoneNumber, message);
    if (msg91Result.success) {
      return msg91Result;
    }
    console.log('MSG91 failed, trying next service...');
  }

  // Try Twilio third
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    const twilioResult = await sendTwilioSMS(phoneNumber, message);
    if (twilioResult.success) {
      return twilioResult;
    }
    console.log('Twilio failed, trying fallback...');
  }

  // Fallback to Textbelt (free but limited)
  return await sendTextbeltSMS(phoneNumber, message);
}

// Fast2SMS implementation for India
async function sendFast2SMS(phoneNumber: string, message: string): Promise<SMSResult> {
  try {
    console.log('📱 Sending SMS via Fast2SMS to:', phoneNumber);
    
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`,
      }),
    });

    const result = await response.json();
    
    if (result.return === true) {
      console.log('✅ Fast2SMS SMS sent successfully');
      return { success: true, messageId: result.request_id };
    } else {
      console.log('❌ Fast2SMS failed:', result.message);
      return { success: false, error: result.message || 'Fast2SMS service error' };
    }
  } catch (error) {
    console.log('❌ Fast2SMS error:', error);
    return { success: false, error: String(error) };
  }
}

// MSG91 implementation for India
async function sendMSG91SMS(phoneNumber: string, message: string): Promise<SMSResult> {
  try {
    console.log('📱 Sending SMS via MSG91 to:', phoneNumber);
    
    const cleanNumber = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    
    const response = await fetch(`https://api.msg91.com/api/v5/flow/`, {
      method: 'POST',
      headers: {
        'Authkey': MSG91_AUTH_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: MSG91_SENDER_ID,
        short_url: '0',
        mobiles: cleanNumber,
        message: message,
        route: '4', // Transactional route
      }),
    });

    const result = await response.json();
    
    if (result.type === 'success') {
      console.log('✅ MSG91 SMS sent successfully');
      return { success: true, messageId: result.request_id };
    } else {
      console.log('❌ MSG91 failed:', result.message);
      return { success: false, error: result.message || 'MSG91 service error' };
    }
  } catch (error) {
    console.log('❌ MSG91 error:', error);
    return { success: false, error: String(error) };
  }
}

// Original Twilio implementation
async function sendTwilioSMS(phoneNumber: string, message: string): Promise<SMSResult> {
  try {
    console.log('📱 Sending SMS via Twilio to:', phoneNumber);
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER!,
        To: `+91${phoneNumber}`,
        Body: message,
      }),
    });

    if (response.ok) {
      const result = await response.json() as TwilioResponse;
      console.log('✅ Twilio SMS sent successfully:', result.sid);
      return { success: true, messageId: result.sid };
    } else {
      const error = await response.text();
      console.log('❌ Twilio SMS failed:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.log('❌ Twilio SMS error:', error);
    return { success: false, error: String(error) };
  }
}

// Fallback to free Textbelt service
async function sendTextbeltSMS(phoneNumber: string, message: string): Promise<SMSResult> {
  try {
    console.log('📱 Fallback: Sending SMS via Textbelt (free) to:', phoneNumber);
    
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: `+91${phoneNumber}`,
        message: message,
        key: 'textbelt', // Free key - 1 SMS per day per IP
      }),
    });

    const result = await response.json() as TextbeltResponse;
    
    if (result.success) {
      console.log('✅ Textbelt SMS sent successfully');
      return { success: true };
    } else {
      console.log('❌ Textbelt SMS failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Textbelt SMS error:', error);
    return { success: false, error: String(error) };
  }
}

export const smsTemplates = {
  appointmentBooked: (appointment: Appointment) => 
    `AIIMS Jammu: Apt booked! ID:${appointment.id.slice(-6)} ${appointment.patientName} ${appointment.department} ${new Date(appointment.date).toLocaleDateString('en-IN')} ${appointment.time} PENDING REVIEW`,

  appointmentConfirmed: (appointment: Appointment) => 
    `AIIMS Jammu: APPROVED! ID:${appointment.id.slice(-6)} ${appointment.patientName} ${appointment.department} ${new Date(appointment.date).toLocaleDateString('en-IN')} ${appointment.time} Arrive 15min early with ID`,

  appointmentApproved: (appointment: Appointment) => {
    const urgentTag = appointment.priority === "URGENT" ? "URGENT! " : "";
    return `AIIMS Jammu: ${urgentTag}APPROVED! ID:${appointment.id.slice(-6)} ${appointment.patientName} ${appointment.department} ${new Date(appointment.date).toLocaleDateString('en-IN')} ${appointment.time} Arrive 15min early with ID`;
  },

  appointmentRejected: (appointment: Appointment, reason?: string) => {
    const baseMsg = `AIIMS Jammu: NOT APPROVED ID:${appointment.id.slice(-6)} ${appointment.patientName} ${appointment.department}`;
    const endMsg = ' Book new apt.';
    
    if (!reason) {
      return baseMsg + endMsg;
    }
    
    // Calculate remaining space for reason
    const maxReasonLength = 160 - baseMsg.length - ' Reason:'.length - endMsg.length;
    
    if (maxReasonLength <= 0) {
      return baseMsg + endMsg; // No space for reason
    }
    
    const trimmedReason = reason.length > maxReasonLength 
      ? reason.slice(0, maxReasonLength - 3) + '...' 
      : reason;
    
    return `${baseMsg} Reason:${trimmedReason}${endMsg}`;
  },

  appointment24hrReminder: (appointment: Appointment) => 
    `AIIMS Jammu: Tomorrow! ID:${appointment.id.slice(-6)} ${appointment.patientName} ${appointment.department} ${new Date(appointment.date).toLocaleDateString('en-IN')} ${appointment.time} Bring ID!`,

  appointment2hrReminder: (appointment: Appointment) => 
    `AIIMS Jammu: 2hrs! ID:${appointment.id.slice(-6)} ${appointment.patientName} ${appointment.department} TODAY ${appointment.time} Leave now! Bring ID!`,

  appointmentForwardedToSuperAdmin: (appointment: Appointment, adminComment?: string) => {
    const baseMsg = `AIIMS Jammu: URGENT! ID:${appointment.id.slice(-6)} ${appointment.patientName} forwarded to Super Admin`;
    const commentText = adminComment ? ` Note:${adminComment.slice(0, 30)}...` : '';
    const endMsg = ' Quick review expected!';
    
    // Calculate remaining space
    const maxLength = 160 - baseMsg.length - endMsg.length;
    const trimmedComment = commentText.length > maxLength 
      ? commentText.slice(0, maxLength - 3) + '...' 
      : commentText;
    
    return `${baseMsg}${trimmedComment}${endMsg}`;
  },
};