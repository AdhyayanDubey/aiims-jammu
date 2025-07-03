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
    const appointmentId = resolvedParams.id; // Keep as string for cuid
    const { action, feedback } = await request.json();

    // Validate feedback length
    if (feedback && feedback.length > 500) {
      return NextResponse.json(
        { error: "Feedback message is too long. Please keep it under 500 characters." },
        { status: 400 }
      );
    }

    console.log(`📧 Admin ${action} appointment #${appointmentId}`);

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    let updatedAppointment;

    if (action === "approve") {
      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "CONFIRMED", // Use enum value
          notes: feedback || null, // Updated field name
        },
      });
      console.log('✅ Admin APPROVED appointment #' + appointmentId);
    } else if (action === "reject") {
      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "CANCELLED", // Use enum value
          notes: feedback || null, // Updated field name
        },
      });
      console.log('❌ Admin REJECTED appointment #' + appointmentId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Send ALL notifications (Email, SMS, WhatsApp)
    let emailsSent = false;
    let smsResults = { success: false, error: '' };
    let whatsappResults = { success: false, error: '' };
    let adminEmailSent = false;

    try {
      console.log('📤 Sending notifications for appointment #' + appointmentId);
      console.log('🔄 Action type:', action);
      
      // Parse patient name for email templates
      const nameParts = updatedAppointment.patientName?.split(' ') || ['Patient', ''];
      const firstName = nameParts[0] || 'Patient';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prepare data for email templates
      const emailData = {
        ...updatedAppointment,
        firstName: firstName,
        lastName: lastName,
        preferredDate: updatedAppointment.date.toISOString().split('T')[0], // Format: YYYY-MM-DD
        preferredTime: updatedAppointment.time,
        feedback: feedback,
        superAdminFeedback: updatedAppointment.superAdminFeedback, // Include super admin feedback
        message: updatedAppointment.symptoms || '',
        status: action === "approve" ? "approved" : "rejected",
        isUrgent: updatedAppointment.priority === "URGENT", // Check if urgent
        wasForwarded: updatedAppointment.forwardedToSuperAdmin // Check if was forwarded
      };
      
      console.log('📧 Email data prepared:', {
        firstName,
        lastName,
        date: emailData.preferredDate,
        time: emailData.preferredTime,
        feedback: feedback || 'No feedback provided'
      });
      
      // 1. Send Email
      await sendEmail(
        updatedAppointment.email,
        action === "approve" 
          ? emailTemplates.appointmentApprovedByAdmin(emailData)
          : emailTemplates.appointmentRejectedByAdmin(emailData)
      );
      emailsSent = true;
      console.log(`✅ ${action === "approve" ? "Approval" : "Rejection"} email sent to:`, updatedAppointment.email);

      // 2. Send SMS Notification
      const smsResult = await sendSMS(
        updatedAppointment.phone,
        action === "approve" 
          ? smsTemplates.appointmentConfirmed({
              ...updatedAppointment,
              date: updatedAppointment.date.toISOString()
            })
          : smsTemplates.appointmentRejected({
              ...updatedAppointment,
              date: updatedAppointment.date.toISOString()
            }, feedback)
      );
      smsResults = { success: smsResult.success, error: smsResult.error || '' };
      console.log(`📱 ${action === "approve" ? "Approval" : "Rejection"} SMS result:`, smsResults.success ? 'sent' : smsResults.error);

      // 3. Send WhatsApp Notification
      const whatsappMessage = action === "approve" 
        ? whatsappTemplates.appointmentApproved({
            ...updatedAppointment,
            date: updatedAppointment.date.toISOString()
          }, feedback)
        : whatsappTemplates.appointmentRejected({
            ...updatedAppointment,
            date: updatedAppointment.date.toISOString()
          }, feedback);
      
      console.log(`💬 ${action === "approve" ? "Approval" : "Rejection"} WhatsApp message to send:`, whatsappMessage.substring(0, 100) + '...');
      
      const whatsappResult = await sendWhatsApp(
        updatedAppointment.phone,
        whatsappMessage
      );
      whatsappResults = { success: whatsappResult.success, error: whatsappResult.error || '' };
      console.log(`💬 ${action === "approve" ? "Approval" : "Rejection"} WhatsApp result:`, whatsappResults.success ? 'sent' : whatsappResults.error);

      // 4. Send confirmation email to admin
      if (process.env.ADMIN_EMAIL) {
        console.log(`📧 Sending ${action} confirmation email to admin:`, process.env.ADMIN_EMAIL);
        await sendEmail(
          process.env.ADMIN_EMAIL,
          emailTemplates.adminActionConfirmation(
            emailData,
            action === "approve" ? "approved" : "rejected"
          )
        );
        adminEmailSent = true;
        console.log(`✅ Admin ${action} confirmation email sent successfully`);
      } else {
        console.log('⚠️ No ADMIN_EMAIL configured - skipping admin confirmation email');
      }

      console.log(`✅ All notifications processed for appointment #${appointmentId}`);
    } catch (error) {
      console.error('❌ Some notifications failed:', error);
    }

    return NextResponse.json({
      success: true,
      message: `Appointment ${action}d successfully`,
      notifications: {
        email: emailsSent,
        sms: smsResults.success,
        whatsapp: whatsappResults.success,
        adminConfirmation: adminEmailSent
      },
      appointment: updatedAppointment,
    });

  } catch (error) {
    console.error(`❌ Admin action error:`, error);
    return NextResponse.json(
      { error: "Failed to process admin action" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect()
  }
}