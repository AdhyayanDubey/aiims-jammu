import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AppointmentStatus } from "@prisma/client";
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

    let data: {
      superAdminStatus?: string;
      superAdminFeedback?: string;
      status?: "PENDING" | "CONFIRMED" | "CANCELLED";
      notes?: string;
    } = {};

    if (action === "approve") {
      data = {
        superAdminStatus: "APPROVED",
        superAdminFeedback: feedback || "Approved by Super Admin",
        status: "CONFIRMED", // Automatically approve
        notes: feedback || "Approved by Super Admin", // Updated field name
      };
    } else if (action === "reject") {
      data = {
        superAdminStatus: "REJECTED",
        superAdminFeedback: feedback || "Rejected by Super Admin",
        status: "CANCELLED", // Automatically reject
        notes: feedback || "Rejected by Super Admin", // Updated field name
      };
    } else if (action === "comment") {
      data = {
        superAdminStatus: "COMMENTED",
        superAdminFeedback: feedback || null,
        // Keep status as PENDING - send back to admin for decision
        // notes field will be updated by admin when they take action
      };
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    // Update appointment in database
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data,
    });

    // Send notifications for approve/reject actions
    if (action === "approve") {
      console.log('🔔 Super Admin APPROVED appointment #' + appointmentId);
      
      // Parse patient name for email templates
      const nameParts = updatedAppointment.patientName?.split(' ') || ['Patient', ''];
      const firstName = nameParts[0] || 'Patient';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prepare data for email templates
      const emailData = {
        ...updatedAppointment,
        firstName: firstName,
        lastName: lastName,
        preferredDate: updatedAppointment.date.toISOString().split('T')[0],
        preferredTime: updatedAppointment.time,
        superAdminFeedback: feedback,
        message: updatedAppointment.symptoms || '',
        status: "approved",
        isUrgent: updatedAppointment.priority === "URGENT",
        wasForwarded: updatedAppointment.forwardedToSuperAdmin
      };
      
      // Send approval email to user
      const userEmailResult = await sendEmail(
        updatedAppointment.email,
        emailTemplates.appointmentApprovedBySuperAdmin(emailData)
      );

      // Send notification email to admin
      if (process.env.ADMIN_EMAIL) {
        await sendEmail(
          process.env.ADMIN_EMAIL,
          emailTemplates.adminSuperAdminActionNotification(emailData, 'approved')
        );
      }

      console.log('✅ Super admin approval emails sent:', userEmailResult.success);

      // Send SMS and WhatsApp notifications
      try {
        await sendSMS(
          updatedAppointment.phone,
          smsTemplates.appointmentConfirmed({
            ...updatedAppointment,
            date: updatedAppointment.date.toISOString()
          })
        );
        
        const whatsappMessage = whatsappTemplates.appointmentApproved({
          ...updatedAppointment,
          date: updatedAppointment.date.toISOString()
        }, feedback);
        
        console.log('💬 Super admin WhatsApp message:', whatsappMessage.substring(0, 100) + '...');
        
        await sendWhatsApp(
          updatedAppointment.phone,
          whatsappMessage
        );
        
        console.log('✅ Super admin approval notifications sent');
      } catch (error) {
        console.error('❌ Super admin notification error:', error);
      }
    } 
    else if (action === "reject") {
      console.log('❌ Super Admin REJECTED appointment #' + appointmentId);
      
      // Parse patient name for email templates
      const nameParts = updatedAppointment.patientName?.split(' ') || ['Patient', ''];
      const firstName = nameParts[0] || 'Patient';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prepare data for email templates
      const emailData = {
        ...updatedAppointment,
        firstName: firstName,
        lastName: lastName,
        preferredDate: updatedAppointment.date.toISOString().split('T')[0],
        preferredTime: updatedAppointment.time,
        superAdminFeedback: feedback,
        message: updatedAppointment.symptoms || '',
        status: "rejected",
        isUrgent: updatedAppointment.priority === "URGENT",
        wasForwarded: updatedAppointment.forwardedToSuperAdmin
      };
      
      // Send rejection email to user
      const userEmailResult = await sendEmail(
        updatedAppointment.email,
        emailTemplates.appointmentRejectedBySuperAdmin(emailData)
      );

      // Send notification email to admin
      if (process.env.ADMIN_EMAIL) {
        await sendEmail(
          process.env.ADMIN_EMAIL,
          emailTemplates.adminSuperAdminActionNotification(emailData, 'rejected')
        );
      }

      console.log('✅ Super admin rejection emails sent:', userEmailResult.success);

      // Send SMS and WhatsApp notifications
      try {
        await sendSMS(
          updatedAppointment.phone,
          smsTemplates.appointmentRejected({
            ...updatedAppointment,
            date: updatedAppointment.date.toISOString()
          }, feedback)
        );
        
        await sendWhatsApp(
          updatedAppointment.phone,
          whatsappTemplates.appointmentRejected({
            ...updatedAppointment,
            date: updatedAppointment.date.toISOString()
          }, feedback)
        );
        
        console.log('✅ Super admin rejection notifications sent');
      } catch (error) {
        console.error('❌ Super admin notification error:', error);
      }
    }
    else if (action === "comment") {
      console.log('💬 Super Admin COMMENTED on appointment #' + appointmentId);
      
      // Parse patient name for email template
      const nameParts = updatedAppointment.patientName?.split(' ') || ['Patient', ''];
      const firstName = nameParts[0] || 'Patient';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Send email notification for comments
      if (process.env.ADMIN_EMAIL) {
        await sendEmail(
          process.env.ADMIN_EMAIL,
          emailTemplates.adminSuperAdminCommentNotification({
            ...updatedAppointment,
            firstName: firstName,
            lastName: lastName,
            preferredDate: updatedAppointment.date.toISOString().split('T')[0],
            preferredTime: updatedAppointment.time,
            superAdminFeedback: feedback
          })
        );
        console.log('✅ Super admin comment email sent to admin');
      }
    }

    return NextResponse.json({ 
      success: true,
      emailsSent: action !== "comment"
    });
  } catch (error) {
    console.error("Superadmin action error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update appointment" 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect()
  }
}