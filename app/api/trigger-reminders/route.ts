// app/api/trigger-reminders/route.ts
import { NextResponse } from 'next/server';
import { ReminderScheduler } from '@/lib/reminder-scheduler';

export async function POST() {
  try {
    console.log('🧪 Manual reminder trigger requested');
    await ReminderScheduler.triggerRemindersNow();
    
    return NextResponse.json({ 
      success: true,
      message: 'Reminders triggered manually' 
    });
  } catch (error) {
    console.error('❌ Failed to trigger reminders:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to trigger reminders' 
    }, { status: 500 });
  }
}