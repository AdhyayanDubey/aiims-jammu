// lib/reminder-scheduler.ts
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from './email';
import { sendSMS, smsTemplates } from './sms';
import { sendWhatsApp, whatsappTemplates } from './whatsapp';

const prisma = new PrismaClient();

export class ReminderScheduler {
  static start() {
    console.log('🚀 Starting reminder scheduler...');
    
    // Run every hour to check for reminders
    cron.schedule('0 * * * *', async () => {
      console.log('🔔 Checking for appointment reminders at', new Date().toLocaleString());
      
      await this.send24HourReminders();
      await this.send2HourReminders();
    });

    console.log('✅ Reminder scheduler started - will check every hour');
  }

  static async send24HourReminders() {
    console.log('📅 Checking for 24-hour reminders...');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set to start and end of tomorrow
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: tomorrowStart,
            lte: tomorrowEnd
          },
          status: 'CONFIRMED',
          reminderSent: false
        }
      });

      console.log(`📅 Found ${appointments.length} appointments for 24hr reminders`);

      for (const appointment of appointments) {
        try {
          console.log(`📤 Sending 24hr reminder for appointment #${appointment.id}`);
          
          // Send Email Reminder
          await sendEmail(
            appointment.email,
            emailTemplates.appointment24hrReminder(appointment)
          );
          console.log('✅ Email reminder sent');

          // Send SMS Reminder (disabled)
          const smsResult = await sendSMS(
            appointment.phone,
            smsTemplates.appointment24hrReminder(appointment)
          );
          console.log('📱 SMS reminder result:', smsResult.success ? 'sent' : 'disabled');

          // Send WhatsApp Reminder (disabled)
          const whatsappResult = await sendWhatsApp(
            appointment.phone,
            whatsappTemplates.appointment24hrReminder(appointment)
          );
          console.log('📱 WhatsApp reminder result:', whatsappResult.success ? 'sent' : 'disabled');

          // Mark as sent
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { reminderSent: true, reminderTime: new Date() }
          });

          console.log(`✅ 24hr reminder completed for appointment #${appointment.id}`);
        } catch (error) {
          console.error(`❌ Failed to send 24hr reminder for #${appointment.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in 24hr reminder check:', error);
    }
  }

  static async send2HourReminders() {
    console.log('⏰ Checking for 2-hour reminders...');
    
    const now = new Date();
    // Create date objects for 2-3 hours from now to catch appointments in that window
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    try {
      // Get appointments for today that already had 24hr reminder but haven't had 2hr reminder yet
      const appointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: today,
            lte: endOfToday
          },
          status: 'CONFIRMED',
          reminderSent: true, // Already had 24hr reminder
          // Only send 2hr reminder if last reminder was sent more than 20 hours ago (to avoid duplicates)
          reminderTime: {
            lt: new Date(now.getTime() - 20 * 60 * 60 * 1000)
          }
        }
      });

      console.log(`⏰ Found ${appointments.length} appointments for potential 2hr reminders`);

      // Filter appointments that are actually in 2-3 hour window
      const filteredAppointments = appointments.filter(appointment => {
        // Combine date and time to get actual appointment datetime
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.time.split(':').map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);
        
        // Check if appointment is in 2-3 hour window
        return appointmentDate >= twoHoursFromNow && appointmentDate <= threeHoursFromNow;
      });

      console.log(`⏰ ${filteredAppointments.length} appointments actually need 2hr reminders`);

      for (const appointment of filteredAppointments) {
        try {
          console.log(`📤 Sending 2hr reminder for appointment #${appointment.id}`);
          
          // Send Email Reminder
          await sendEmail(
            appointment.email,
            emailTemplates.appointment2hrReminder(appointment)
          );
          console.log('✅ Email reminder sent');

          // Send SMS Reminder (disabled)
          const smsResult = await sendSMS(
            appointment.phone,
            smsTemplates.appointment2hrReminder(appointment)
          );
          console.log('📱 SMS reminder result:', smsResult.success ? 'sent' : 'disabled');

          // Send WhatsApp Reminder (disabled)
          const whatsappResult = await sendWhatsApp(
            appointment.phone,
            whatsappTemplates.appointment2hrReminder(appointment)
          );
          console.log('📱 WhatsApp reminder result:', whatsappResult.success ? 'sent' : 'disabled');

          // Update reminderTime to mark 2hr reminder as sent
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { reminderTime: new Date() }
          });

          console.log(`✅ 2hr reminder completed for appointment #${appointment.id}`);
        } catch (error) {
          console.error(`❌ Failed to send 2hr reminder for #${appointment.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in 2hr reminder check:', error);
    }
  }

  // Manual trigger function for testing
  static async triggerRemindersNow() {
    console.log('🧪 Manually triggering reminders for testing...');
    await this.send24HourReminders();
    await this.send2HourReminders();
  }
}