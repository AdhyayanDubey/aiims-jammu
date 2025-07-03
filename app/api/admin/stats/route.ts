import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("📊 Fetching admin statistics...");

    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        status: true,
        department: true,
        createdAt: true,
      },
    });

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    });

    // Calculate stats
    const totalAppointments = appointments.length;
    const totalUsers = users.length;

    // Status counts
    const statusCounts = {
      pending: appointments.filter(
        (apt) => apt.status === "PENDING" || apt.status === "pending"
      ).length,
      confirmed: appointments.filter(
        (apt) => apt.status === "CONFIRMED" || apt.status === "confirmed"
      ).length,
      cancelled: appointments.filter(
        (apt) => apt.status === "CANCELLED" || apt.status === "cancelled"
      ).length,
      completed: appointments.filter(
        (apt) => apt.status === "COMPLETED" || apt.status === "completed"
      ).length,
    };

    // Department counts
    const departmentCounts = {};
    appointments.forEach((apt) => {
      if (apt.department) {
        departmentCounts[apt.department] = (departmentCounts[apt.department] || 0) + 1;
      }
    });

    const responseData = {
      success: true,
      totalAppointments,
      totalUsers,
      statusCounts,
      departmentCounts,

      // Today's appointments
      todayAppointments: appointments.filter((apt) => {
        const today = new Date().toISOString().split("T")[0];
        return apt.createdAt.toISOString().split("T")[0] === today;
      }).length,
    };

    console.log("✅ Stats fetched successfully:", {
      totalAppointments: responseData.totalAppointments,
      totalUsers: responseData.totalUsers,
      statusCounts: responseData.statusCounts,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Stats API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
        totalAppointments: 0,
        totalUsers: 0,
        statusCounts: {
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
        },
      },
      { status: 500 }
    );
  }
}