import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password, role } = await req.json();
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }
    
    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Validate and set role
    const validRoles = ['USER', 'ADMIN', 'SUPER_ADMIN'];
    let userRole = 'USER'; // Default role
    
    if (role && validRoles.includes(role.toUpperCase())) {
      userRole = role.toUpperCase();
    }

    // Create user
    const user = await prisma.user.create({
      data: { 
        firstName,
        lastName,
        name: `${firstName} ${lastName}`, // For backward compatibility
        email, 
        phone,
        password: hashed, 
        role: userRole 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ 
      message: `${userRole} account created successfully`,
      user 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}