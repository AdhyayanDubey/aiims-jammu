import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ success: false, message: "No email provided" }, { status: 400 });
  }
  const appointments = await prisma.appointment.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
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
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
  });
  return NextResponse.json({ success: true, appointments, count: appointments.length });
}

// Handle POST requests for creating appointments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientName,
      email,
      phone,
      department,
      doctor,
      date,
      time,
      symptoms,
      userId
    } = body;

    // Validation
    if (!patientName || !email || !phone || !department || !doctor || !date || !time) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if appointment slot is already taken
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctor,
        date: new Date(date),
        time,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, message: "This time slot is already booked" },
        { status: 400 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        email,
        phone,
        department,
        doctor,
        date: new Date(date),
        time,
        symptoms: symptoms || '',
        userId: userId || null,
        status: 'PENDING',
        priority: 'NORMAL'
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
        createdAt: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Appointment booked successfully",
      appointment 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handle PUT requests for updating appointments
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Convert date string to Date object if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
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
        updatedAt: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Appointment updated successfully",
      appointment: updatedAppointment 
    });

  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handle DELETE requests for canceling appointments
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Update status to CANCELLED instead of deleting
    const cancelledAppointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        notes: 'Cancelled by user'
      },
      select: {
        id: true,
        patientName: true,
        status: true,
        date: true,
        time: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Appointment cancelled successfully",
      appointment: cancelledAppointment 
    });

  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}