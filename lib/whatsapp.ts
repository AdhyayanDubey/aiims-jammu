// Remove or keep: import fetch from 'node-fetch';

// Add interfaces here
interface TwilioResponse {
  sid: string;
  status: string;
  error_code?: string;
  error_message?: string;
}

interface WhatsAppResult {
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
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

export async function sendWhatsApp(phoneNumber: string, message: string): Promise<WhatsAppResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    console.log('📱 WhatsApp disabled - missing Twilio credentials');
    return { success: false, error: 'WhatsApp functionality requires Twilio credentials' };
  }

  try {
    console.log('📱 Attempting WhatsApp to:', phoneNumber);
    
    // Format phone number for WhatsApp
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      // For Indian numbers, add +91 country code
      formattedNumber = `+91${phoneNumber.replace(/^0+/, '')}`;
    }
    console.log('📱 Formatted number:', formattedNumber);
    
    // For Twilio Sandbox, prepend "join <sandbox-keyword>" to message
    // This helps with sandbox authentication
    const sandboxMessage = `${message}`;
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
        To: `whatsapp:${formattedNumber}`,
        Body: sandboxMessage,
      }),
    });

    if (response.ok) {
      const result = await response.json() as TwilioResponse;
      console.log('✅ WhatsApp sent successfully:', result.sid);
      return { success: true, messageId: result.sid };
    } else {
      const errorText = await response.text();
      console.log('❌ WhatsApp API error:', errorText);
      
      let errorObj;
      try {
        errorObj = JSON.parse(errorText);
      } catch {
        // If not JSON, use the text as is
      }
      
      // Handle specific WhatsApp errors
      if (errorText.includes('63016') || errorText.includes('template')) {
        console.log('ℹ️ WhatsApp sandbox may require user to join first');
        return { 
          success: false, 
          error: 'WhatsApp sandbox: User may need to send "join <sandbox-keyword>" first' 
        };
      }
      
      if (errorText.includes('63007') || errorText.includes('opt-in')) {
        console.log('ℹ️ WhatsApp user needs to opt-in to sandbox');
        return { 
          success: false, 
          error: 'WhatsApp: User needs to join sandbox by sending join message' 
        };
      }
      
      return { success: false, error: `WhatsApp API: ${errorObj?.message || errorText}` };
    }
  } catch (error) {
    console.log('❌ WhatsApp error:', error);
    return { success: false, error: String(error) };
  }
}

export const whatsappTemplates = {
  appointmentBooked: (appointment: Appointment) => 
    `🏥 *AIIMS Jammu* - Appointment Booked! ✅\n\n` +
    `📋 ID: ${appointment.id.slice(-6)}\n` +
    `👤 Patient: ${appointment.patientName}\n` +
    `🏥 Department: ${appointment.department}\n` +
    `📅 Date: ${new Date(appointment.date).toLocaleDateString('en-IN')}\n` +
    `⏰ Time: ${appointment.time}\n` +
    `📍 AIIMS Jammu\n\n` +
    `🔄 Status: PENDING REVIEW\n` +
    `We'll notify you once reviewed.\n\n` +
    `Thank you for choosing AIIMS Jammu! 🙏`,

  appointmentConfirmed: (appointment: Appointment, feedback?: string) => 
    `✅ *AIIMS Jammu* - APPROVED! 🎉\n\n` +
    `📋 ID: ${appointment.id.slice(-6)}\n` +
    `👤 Patient: ${appointment.patientName}\n` +
    `🏥 Department: ${appointment.department}\n` +
    `📅 Date: ${new Date(appointment.date).toLocaleDateString('en-IN')}\n` +
    `⏰ Time: ${appointment.time}\n` +
    `📍 AIIMS Jammu\n\n` +
    `${feedback ? `💬 Note: ${feedback}\n\n` : ''}` +
    `📝 Instructions:\n` +
    `• Arrive 15 minutes early\n` +
    `• Bring valid ID proof\n` +
    `• Carry previous reports\n\n` +
    `We look forward to serving you! 🏥`,

  appointmentApproved: (appointment: Appointment, feedback?: string) => {
    const urgentTag = appointment.priority === "URGENT" ? "🚨 URGENT - " : "";
    return `✅ *AIIMS Jammu* - ${urgentTag}APPROVED! 🎉\n\n` +
    `📋 ID: ${appointment.id.slice(-6)}\n` +
    `👤 Patient: ${appointment.patientName}\n` +
    `🏥 Department: ${appointment.department}\n` +
    `📅 Date: ${new Date(appointment.date).toLocaleDateString('en-IN')}\n` +
    `⏰ Time: ${appointment.time}\n` +
    `📍 AIIMS Jammu\n\n` +
    `${appointment.priority === "URGENT" ? `🚨 *PRIORITY: URGENT*\nYour case received special attention!\n\n` : ''}` +
    `${feedback ? `💬 Admin Note: ${feedback}\n\n` : ''}` +
    `📝 Instructions:\n` +
    `• Arrive 15 minutes early\n` +
    `• Bring valid ID proof\n` +
    `• Carry previous reports\n` +
    `${appointment.priority === "URGENT" ? '• Priority case - be punctual\n' : ''}` +
    `\nWe look forward to serving you! 🏥`;
  },

  appointmentRejected: (appointment: Appointment, reason?: string) => 
    `❌ *AIIMS Jammu* - NOT APPROVED\n\n` +
    `📋 ID: ${appointment.id.slice(-6)}\n` +
    `👤 Patient: ${appointment.patientName}\n` +
    `🏥 Department: ${appointment.department}\n` +
    `📅 Date: ${new Date(appointment.date).toLocaleDateString('en-IN')}\n\n` +
    `${reason ? `📝 Reason: ${reason}\n\n` : ''}` +
    `💡 Next Steps:\n` +
    `• You may book a new appointment\n` +
    `• Contact AIIMS Jammu for assistance\n\n` +
    `AIIMS Jammu - Committed to your health 🏥`,

  appointment24hrReminder: (appointment: Appointment) => 
    `⏰ *AIIMS Jammu* - Appointment Tomorrow!\n\n` +
    `📋 ID: ${appointment.id.slice(-6)}\n` +
    `👤 Patient: ${appointment.patientName}\n` +
    `🏥 Department: ${appointment.department}\n` +
    `📅 TOMORROW: ${new Date(appointment.date).toLocaleDateString('en-IN')}\n` +
    `⏰ Time: ${appointment.time}\n` +
    `📍 AIIMS Jammu\n\n` +
    `📝 Checklist:\n` +
    `✅ Arrive 15 minutes early\n` +
    `✅ Bring ID proof\n` +
    `✅ Carry previous reports\n\n` +
    `See you tomorrow! 🏥`,

  appointment2hrReminder: (appointment: Appointment) => 
    `🚨 *URGENT* - Appointment in 2 Hours!\n\n` +
    `📋 ID: ${appointment.id.slice(-6)}\n` +
    `👤 Patient: ${appointment.patientName}\n` +
    `🏥 Department: ${appointment.department}\n` +
    `📅 TODAY: ${new Date(appointment.date).toLocaleDateString('en-IN')}\n` +
    `⏰ Time: ${appointment.time}\n` +
    `📍 AIIMS Jammu\n\n` +
    `🚗 Action Required:\n` +
    `• Leave for hospital NOW\n` +
    `• Don't forget ID proof!\n\n` +
    `We're excited to see you! 🏥`,

  appointmentForwardedToSuperAdmin: (appointment: Appointment, adminComment?: string) => 
    `🚨 *AIIMS Jammu* - URGENT PRIORITY!\n\n` +
    `📋 ID: ${appointment.id.slice(-6)}\n` +
    `👤 Patient: ${appointment.patientName}\n` +
    `🏥 Department: ${appointment.department}\n` +
    `📅 Date: ${new Date(appointment.date).toLocaleDateString('en-IN')}\n` +
    `⏰ Time: ${appointment.time}\n\n` +
    `🚨 *STATUS: FORWARDED TO SUPER ADMIN*\n` +
    `Your case is now URGENT priority!\n\n` +
    `${adminComment ? `💬 Admin Note: ${adminComment}\n\n` : ''}` +
    `⚡ What this means:\n` +
    `• Your case needs expert review\n` +
    `• Priority changed to URGENT\n` +
    `• Super Admin will review personally\n` +
    `• Quick decision expected\n\n` +
    `📞 Questions? Call: 0191-2974401\n` +
    `AIIMS Jammu - Expert Care Always! 🏥`,
};
