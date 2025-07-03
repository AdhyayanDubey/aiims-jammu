import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "signup") {
      const { firstName, lastName, email, phone, password, role } = body

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "User already exists with this email" },
          { status: 400 }
        )
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create the user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          role,
        }
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: userWithoutPassword
      })

    } else if (action === "signin") {
      const { email, password } = body

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        )
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        )
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        success: true,
        message: "Signin successful",
        user: userWithoutPassword
      })

    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Auth API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
