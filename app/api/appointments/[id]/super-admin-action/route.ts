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

    console.log(`🔥 Super Admin ${action} appointment #${appointmentId}`);

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    let updatedAppointment;

    if (action === "approve") {
      // Super Admin approves - automatically approve the appointment
      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "CONFIRMED",
          superAdminStatus: "APPROVED",
          superAdminFeedback: feedback || "Approved by Super Admin",
        },
      });
      console.log('✅ Super Admin APPROVED appointment #' + appointmentId);

      // Send email to user
      try {
        await sendEmail(
          appointment.email,
          emailTemplates.appointmentApprovedBySuperAdmin({
            ...appointment,
            superAdminFeedback: feedback || "Approved by Super Admin"
          })
        );
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

    } else if (action === "reject") {
      // Super Admin rejects - automatically reject the appointment
      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "CANCELLED",
          superAdminStatus: "REJECTED",
          superAdminFeedback: feedback || "Rejected by Super Admin",
        },
      });
      console.log('❌ Super Admin REJECTED appointment #' + appointmentId);

      // Send email to user
      try {
        await sendEmail(
          appointment.email,
          emailTemplates.appointmentRejectedBySuperAdmin({
            ...appointment,
            superAdminFeedback: feedback || "Rejected by Super Admin"
          })
        );
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

    } else if (action === "comment") {
      // Super Admin comments - send back to admin for decision
      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          superAdminStatus: "COMMENTED",
          superAdminFeedback: feedback,
        },
      });
      console.log('💬 Super Admin COMMENTED on appointment #' + appointmentId);
    }

    return NextResponse.json({
      success: true,
      message: `Appointment ${action}d successfully`,
      appointment: updatedAppointment,
    });

  } catch (error) {
    console.error('Super Admin action error:', error);
    return NextResponse.json(
      { error: "Failed to process super admin action" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
