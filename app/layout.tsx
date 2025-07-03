import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { Toaster as HotToaster } from "react-hot-toast"
import "./globals.css"
import { Providers } from "./providers"
import { ReminderScheduler } from '@/lib/reminder-scheduler'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AIIMS Jammu",
  description: "All India Institute of Medical Sciences, Jammu",
}

// Server-side initialization
if (typeof window === 'undefined') {
  let schedulerStarted = false;
  if (!schedulerStarted) {
    try {
      ReminderScheduler.start();
      schedulerStarted = true;
      console.log('🚀 Auto-started reminder scheduler on server');
    } catch (error) {
      console.error('❌ Failed to auto-start scheduler:', error);
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
          <HotToaster position="top-right" />
        </Providers>
        
        {/* Browser notification initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                  Notification.requestPermission().then(function(permission) {
                    console.log('🔔 Browser notifications permission:', permission);
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
