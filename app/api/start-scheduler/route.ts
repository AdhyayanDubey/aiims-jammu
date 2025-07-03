// app/api/start-scheduler/route.ts
import { NextResponse } from 'next/server';
import { ReminderScheduler } from '@/lib/reminder-scheduler';

let schedulerStarted = false;

export async function GET() {
  try {
    if (!schedulerStarted) {
      ReminderScheduler.start();
      schedulerStarted = true;
      return NextResponse.json({ 
        success: true,
        message: 'Reminder scheduler started successfully' 
      });
    }
    return NextResponse.json({ 
      success: true,
      message: 'Scheduler already running' 
    });
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to start reminder scheduler' 
    }, { status: 500 });
  }
}