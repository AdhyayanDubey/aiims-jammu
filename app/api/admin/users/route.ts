import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('👥 Fetching all users for admin...')
    
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
        // Removed 'isActive' as it doesn't exist in your schema
      }
    })

    console.log(`✅ Found ${users.length} users`)

    return NextResponse.json({
      success: true,
      users: users || []
    })
  } catch (error) {
    console.error('❌ Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        users: []
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    console.log(`👤 Updating user ${id}`)

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    console.log('✅ User updated successfully')

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('❌ Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    console.log(`🗑️ Deleting user ${id}`)

    await prisma.user.delete({
      where: { id }
    })

    console.log('✅ User deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}