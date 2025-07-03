import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('📊 Fetching all appointments for admin...')
    
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${appointments.length} appointments`)

    return NextResponse.json({
      success: true,
      appointments: appointments || []
    })
  } catch (error) {
    console.error('❌ Error fetching appointments:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch appointments',
        appointments: []
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()
    console.log(`📝 Updating appointment ${id} to status: ${status}`)

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    console.log('✅ Appointment updated successfully')

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment
    })
  } catch (error) {
    console.error('❌ Error updating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    console.log(`🗑️ Deleting appointment ${id}`)

    await prisma.appointment.delete({
      where: { id }
    })

    console.log('✅ Appointment deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}