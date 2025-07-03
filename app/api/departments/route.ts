import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Use Prisma instead of executeQuery for consistency
    const departments = await prisma.department.findMany({
      where: {
        isActive: true, // Only get active departments
      },
      select: {
        id: true,
        name: true,
        description: true,
        headDoctor: true,
        availableDays: true,
        availableHours: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      departments,
    })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch departments",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Add POST method to create new departments
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, headDoctor, availableDays, availableHours } = body

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Department name is required" },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name,
        description: description || null,
        headDoctor: headDoctor || null,
        availableDays: availableDays || "Monday-Saturday",
        availableHours: availableHours || "8:00 AM - 2:00 PM",
        isActive: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: "Department created successfully",
      department,
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating department:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create department",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
