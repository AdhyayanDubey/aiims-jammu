import { NextResponse } from 'next/server'
import { ReminderScheduler } from '@/lib/reminder-scheduler'

export async function GET() {
  try {
    // Initialize server-side services
    ReminderScheduler.start()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Initialization error:', error)
    return NextResponse.json({ error: 'Initialization failed' }, { status: 500 })
  }
}