import { type NextRequest, NextResponse } from "next/server"
import { sendSMS, smsTemplates } from "@/lib/sms"
import { sendWhatsApp, whatsappTemplates } from "@/lib/whatsapp"

// Test endpoint to check SMS and WhatsApp functionality
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, testMessage } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      )
    }

    const message = testMessage || "🏥 Test message from AIIMS Jammu - SMS/WhatsApp service is working! ✅"

    console.log("🧪 Testing SMS and WhatsApp for:", phoneNumber)

    // Test SMS
    const smsResult = await sendSMS(phoneNumber, message)
    console.log("📱 SMS Test Result:", smsResult)

    // Test WhatsApp
    const whatsappResult = await sendWhatsApp(phoneNumber, message)
    console.log("📱 WhatsApp Test Result:", whatsappResult)

    return NextResponse.json({
      success: true,
      message: "Test completed",
      results: {
        sms: smsResult,
        whatsapp: whatsappResult
      }
    })

  } catch (error) {
    console.error("❌ Test messaging error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Test failed",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check service configuration status
export async function GET() {
  // Debug: Log actual environment variable values
  console.log('🔍 Environment Variables Debug:')
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID)
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '[HIDDEN]' : 'undefined')
  console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER)
  console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER)

  const config = {
    sms: {
      fast2sms: !!process.env.FAST2SMS_API_KEY,
      msg91: !!process.env.MSG91_AUTH_KEY,
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
    },
    whatsapp: {
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER)
    }
  }

  const hasAnySMSService = Object.values(config.sms).some(Boolean)
  const hasWhatsAppService = config.whatsapp.twilio

  return NextResponse.json({
    success: true,
    configuration: config,
    status: {
      smsEnabled: hasAnySMSService,
      whatsappEnabled: hasWhatsAppService,
      servicesConfigured: hasAnySMSService || hasWhatsAppService
    },
    debug: {
      twilioConfigured: {
        accountSid: !!process.env.TWILIO_ACCOUNT_SID,
        authToken: !!process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
        whatsappNumber: !!process.env.TWILIO_WHATSAPP_NUMBER
      }
    }
  })
}
