import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { sendEmail, emailTemplates } from "@/lib/email"
import { sendAppointmentNotifications, getNotificationSummary } from "@/lib/notification-service"

const prisma = new PrismaClient()

// Updated schema to handle null values properly
const appointmentSchema = z.object({
  // Support both old and new field structures
  firstName: z.string().min(2, "First name must be at least 2 characters").nullable().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").nullable().optional(),
  patientName: z.string().min(2, "Patient name must be at least 2 characters").nullable().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  department: z.string().min(1, "Please select a department"),
  doctor: z.string().nullable().optional(),
  // Support both date formats
  preferredDate: z.string().min(1, "Please select a date").nullable().optional(),
  date: z.string().min(1, "Please select a date").nullable().optional(),
  preferredTime: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  symptoms: z.string().nullable().optional(),
  userId: z.string().nullable().optional(), // This now accepts string, null, or undefined
}).refine(
  (data) => {
    // Ensure we have either firstName/lastName OR patientName
    return (data.firstName && data.lastName) || data.patientName;
  },
  {
    message: "Either firstName and lastName, or patientName is required",
    path: ["patientName"],
  }
).refine(
  (data) => {
    // Ensure we have either preferredDate OR date
    return data.preferredDate || data.date;
  },
  {
    message: "Date is required",
    path: ["date"],
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📨 Received appointment data:", body)

    // Validate the request body
    const validatedData = appointmentSchema.parse(body)
    console.log("✅ Validated data:", validatedData)

    // Normalize the data
    const patientName = validatedData.patientName || 
                       (validatedData.firstName && validatedData.lastName ? 
                        `${validatedData.firstName} ${validatedData.lastName}` : 
                        "Unknown Patient")
    
    const appointmentDate = validatedData.date || validatedData.preferredDate
    const appointmentTime = validatedData.time || validatedData.preferredTime || "9:00 AM"
    const symptoms = validatedData.symptoms || validatedData.message || ""
    const doctor = validatedData.doctor || "To be assigned"

    console.log("📋 Normalized data:", {
      patientName,
      appointmentDate,
      appointmentTime,
      symptoms,
      doctor
    })

    // Check if appointment slot is already taken (only if doctor is assigned)
    if (doctor !== "To be assigned" && appointmentDate) {
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctor: doctor,
          date: new Date(appointmentDate),
          time: appointmentTime,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      if (existingAppointment) {
        return NextResponse.json(
          {
            success: false,
            message: "This time slot is already booked. Please choose a different time.",
          },
          { status: 400 }
        )
      }
    }

    // Create appointment using Prisma
    const appointment = await prisma.appointment.create({
      data: {
        patientName: patientName,
        email: validatedData.email,
        phone: validatedData.phone,
        department: validatedData.department,
        doctor: doctor,
        date: appointmentDate ? new Date(appointmentDate) : new Date(),
        time: appointmentTime,
        symptoms: symptoms,
        status: 'PENDING',
        priority: 'NORMAL',
        userId: validatedData.userId || null, // Handle null properly
      },
      select: {
        id: true,
        patientName: true,
        email: true,
        phone: true,
        department: true,
        doctor: true,
        date: true,
        time: true,
        symptoms: true,
        status: true,
        priority: true,
        createdAt: true,
      }
    })

    console.log("✅ Appointment created:", appointment)

    // Send confirmation email to patient
    let emailSent = false
    try {
      console.log("📧 Sending confirmation email to:", validatedData.email)
      const patientEmailResult = await sendEmail(
        validatedData.email,
        emailTemplates.appointmentConfirmation({
          id: appointment.id,
          firstName: validatedData.firstName || patientName.split(' ')[0] || "Patient",
          lastName: validatedData.lastName || patientName.split(' ')[1] || "",
          email: validatedData.email,
          phone: validatedData.phone,
          department: validatedData.department,
          preferredDate: appointmentDate,
          preferredTime: appointmentTime,
          message: symptoms,
          status: "pending",
        }),
      )
      emailSent = patientEmailResult.success
      console.log("📧 Patient email sent:", emailSent)

      // Send notification email to admin (optional)
      if (process.env.ADMIN_EMAIL) {
        console.log("📧 Sending notification email to admin")
        await sendEmail(
          process.env.ADMIN_EMAIL,
          emailTemplates.newAppointmentNotification({
            id: appointment.id,
            firstName: validatedData.firstName || patientName.split(' ')[0] || "Patient",
            lastName: validatedData.lastName || patientName.split(' ')[1] || "",
            email: validatedData.email,
            phone: validatedData.phone,
            department: validatedData.department,
            preferredDate: appointmentDate,
            preferredTime: appointmentTime,
            message: symptoms,
            status: "pending",
          }),
        )
      }
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError)
      // Don't fail the appointment creation if email fails
    }

    // Send SMS and WhatsApp notifications using enhanced service
    console.log("📱 Sending SMS and WhatsApp notifications...")
    const notificationResult = await sendAppointmentNotifications(
      validatedData.email,
      validatedData.phone,
      {
        id: appointment.id,
        patientName: patientName,
        department: validatedData.department,
        date: appointmentDate || appointment.date.toISOString(),
        time: appointmentTime,
      },
      'booked'
    );

    const notificationSummary = getNotificationSummary(notificationResult);
    console.log("📊 Notification Summary:", notificationSummary);

    return NextResponse.json(
      {
        success: true,
        message: "Appointment booked successfully!",
        appointmentId: appointment.id,
        appointment: appointment,
        notifications: {
          email: emailSent,
          sms: notificationResult.sms,
          whatsapp: notificationResult.whatsapp,
          summary: notificationSummary,
          errors: notificationResult.errors.length > 0 ? notificationResult.errors : undefined
        }
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Appointment booking error:", error)

    if (error instanceof z.ZodError) {
      console.log("🔍 Validation errors:", error.errors)
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to book appointment. Please try again.",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET function remains the same
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        patientName: true,
        email: true,
        phone: true,
        department: true,
        doctor: true,
        date: true,
        time: true,
        symptoms: true,
        status: true,
        priority: true,
        notes: true,
        userId: true,
        reminderSent: true,
        reminderTime: true,
        superAdminStatus: true,
        superAdminFeedback: true,
        forwardedToSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      appointments,
    })
  } catch (error) {
    console.error("❌ Error fetching appointments:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch appointments",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
