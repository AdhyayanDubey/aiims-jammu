// lib/notifications.ts
export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async showNotification(title: string, options: NotificationOptions = {}) {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      const notification = new Notification(title, {
        icon: '/images/aiims-logo.png',
        badge: '/images/aiims-logo.png',
        ...options
      });

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
      
      return notification;
    }
  }

  static appointmentConfirmed(appointment: any) {
    return this.showNotification(
      '✅ Appointment Confirmed - AIIMS Jammu',
      {
        body: `Your appointment for ${appointment.department} on ${new Date(appointment.preferredDate).toLocaleDateString('en-IN')} has been confirmed.`,
        tag: `appointment-${appointment.id}`,
        requireInteraction: true
      }
    );
  }

  static appointmentRejected(appointment: any) {
    return this.showNotification(
      '❌ Appointment Rejected - AIIMS Jammu',
      {
        body: `Your appointment for ${appointment.department} has been rejected. You can book a new appointment.`,
        tag: `appointment-${appointment.id}`,
        requireInteraction: true
      }
    );
  }

  static appointmentReminder(appointment: any, hoursLeft: number) {
    return this.showNotification(
      `⏰ Appointment in ${hoursLeft} hours - AIIMS Jammu`,
      {
        body: `Don't forget your ${appointment.department} appointment. Please arrive 15 minutes early.`,
        tag: `reminder-${appointment.id}`,
        requireInteraction: true
      }
    );
  }
}

// Initialize notifications on page load
export function initializeNotifications() {
  if (typeof window !== 'undefined') {
    NotificationService.requestPermission();
  }
}