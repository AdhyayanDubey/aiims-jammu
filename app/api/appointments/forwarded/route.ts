import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        forwardedToSuperAdmin: true,
        superAdminStatus: "PENDING",
      },
      select: {
        id: true,
        patientName: true, // Updated field name
        email: true,
        phone: true,
        department: true,
        doctor: true,
        date: true, // Updated field name
        time: true, // Updated field name
        symptoms: true, // Updated field name
        status: true,
        priority: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        superAdminFeedback: true,
        forwardedToSuperAdmin: true,
        superAdminStatus: true,
        // Include user relation
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length,
    });
  } catch (error) {
    console.error("Error fetching forwarded appointments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch forwarded appointments",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}