import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail, emailTemplates } from "@/lib/email";
import { sendSMS, smsTemplates } from "@/lib/sms";
import { sendWhatsApp, whatsappTemplates } from "@/lib/whatsapp";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const appointmentId = resolvedParams.id;
    const { adminComment } = await request.json();

    console.log(`🔄 Admin forwarding appointment #${appointmentId} to Super Admin`);

    // Find the appointment first
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Update appointment: set as forwarded, priority to URGENT, and save admin comment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        forwardedToSuperAdmin: true,
        superAdminStatus: "PENDING",
        superAdminFeedback: null,
        priority: "URGENT", // 🚨 Change priority to URGENT
        notes: adminComment ? `Admin forwarded: ${adminComment}` : "Admin forwarded to Super Admin for review",
      },
    });

    console.log(`🚨 Priority changed to URGENT for appointment #${appointmentId}`);

    // Send notifications to patient about forwarding to Super Admin
    const userNotifications = { email: false, sms: false, whatsapp: false };
    let adminNotificationSent = false;

    try {
      // Parse patient name for templates
      const nameParts = updatedAppointment.patientName?.split(' ') || ['Patient', ''];
      const firstName = nameParts[0] || 'Patient';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const notificationData = {
        ...updatedAppointment,
        firstName: firstName,
        lastName: lastName,
        preferredDate: updatedAppointment.date.toISOString().split('T')[0],
        preferredTime: updatedAppointment.time,
        adminComment: adminComment || 'Your case requires additional review',
        date: updatedAppointment.date.toISOString()
      };

      console.log('📤 Sending forwarding notifications to patient');

      // 1. Send Email to Patient
      await sendEmail(
        updatedAppointment.email,
        emailTemplates.appointmentForwardedToSuperAdmin(notificationData)
      );
      userNotifications.email = true;
      console.log('✅ Forwarding email sent to patient');

      // 2. Send SMS to Patient
      const smsResult = await sendSMS(
        updatedAppointment.phone,
        smsTemplates.appointmentForwardedToSuperAdmin(notificationData, adminComment)
      );
      userNotifications.sms = smsResult.success;
      console.log('📱 Forwarding SMS result:', smsResult.success ? 'sent' : smsResult.error);

      // 3. Send WhatsApp to Patient
      const whatsappResult = await sendWhatsApp(
        updatedAppointment.phone,
        whatsappTemplates.appointmentForwardedToSuperAdmin(notificationData, adminComment)
      );
      userNotifications.whatsapp = whatsappResult.success;
      console.log('💬 Forwarding WhatsApp result:', whatsappResult.success ? 'sent' : whatsappResult.error);

      // 4. Send notification email to Super Admin
      if (process.env.SUPER_ADMIN_EMAIL) {
        await sendEmail(
          process.env.SUPER_ADMIN_EMAIL,
          emailTemplates.superAdminNewForwardedAppointment({
            ...notificationData,
            adminComment: adminComment
          })
        );
        adminNotificationSent = true;
        console.log('✅ Super Admin notification email sent');
      } else {
        console.log('⚠️ No SUPER_ADMIN_EMAIL configured - skipping super admin notification');
      }

    } catch (error) {
      console.error('❌ Some forwarding notifications failed:', error);
    }

    return NextResponse.json({ 
      success: true,
      message: "Appointment forwarded to Super Admin successfully",
      priorityChanged: "URGENT",
      notifications: {
        patient: userNotifications,
        superAdmin: adminNotificationSent
      },
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error("Forward error:", error);
    return NextResponse.json({ error: "Failed to forward appointment" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}