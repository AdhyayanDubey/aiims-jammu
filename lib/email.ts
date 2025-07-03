import nodemailer from 'nodemailer';

// Create transporter (using Gmail as example - you can use any SMTP)
const transporter = nodemailer.createTransport({ // ← FIXED: removed 'r' from createTransporter
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your app password
  },
});

// Email templates
export const emailTemplates = {
  // Patient: Appointment Confirmation
  appointmentConfirmation: (data: any) => ({
    subject: `Appointment Confirmation - AIIMS Jammu (#${data.id})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1>AIIMS Jammu</h1>
          <h2>Appointment Confirmation</h2>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <p>Dear <strong>${data.firstName} ${data.lastName}</strong>,</p>
          
          <p>Your appointment has been <strong>successfully booked</strong>. Here are the details:</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Appointment Details</h3>
            <p><strong>Appointment ID:</strong> #${data.id}</p>
            <p><strong>Department:</strong> ${data.department}</p>
            <p><strong>Preferred Date:</strong> ${new Date(data.preferredDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
            <p><strong>Status:</strong> <span style="color: #f59e0b;">Pending Approval</span></p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p><strong>What's Next?</strong></p>
            <p>• Your appointment is currently under review</p>
            <p>• You'll receive another email once it's approved/rejected</p>
            <p>• Please bring a valid ID and any relevant medical documents</p>
          </div>
          
          <p>Thank you for choosing AIIMS Jammu!</p>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2025 AIIMS Jammu. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  // Patient: Appointment Approved
  appointmentApproved: (data: any) => ({
    subject: `✅ Appointment Approved - AIIMS Jammu (#${data.id})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1>AIIMS Jammu</h1>
          <h2>🎉 Appointment Approved!</h2>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <p>Dear <strong>${data.firstName} ${data.lastName}</strong>,</p>
          
          <p>Great news! Your appointment has been <strong style="color: #059669;">APPROVED</strong> by our admin team.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Confirmed Appointment Details</h3>
            <p><strong>Appointment ID:</strong> #${data.id}</p>
            <p><strong>Department:</strong> ${data.department}</p>
            <p><strong>Date:</strong> ${new Date(data.preferredDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Time:</strong> ${data.preferredTime}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">CONFIRMED</span></p>
            <p><strong>Approved by:</strong> Admin</p>
            ${data.feedback ? `<p><strong>Admin Message:</strong> ${data.feedback}</p>` : ''}
          </div>
          
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
            <p><strong>Important Reminders:</strong></p>
            <p>• Arrive 15 minutes before your appointment time</p>
            <p>• Bring a valid photo ID</p>
            <p>• Carry any previous medical reports</p>
            <p>• Wear a mask and follow COVID protocols</p>
          </div>
          
          <p>We look forward to serving you at AIIMS Jammu!</p>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2025 AIIMS Jammu. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  // Admin: New Appointment Notification
  newAppointmentNotification: (data: any) => ({
    subject: `🔔 New Appointment Request - ${data.department}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1>AIIMS Jammu - Admin Panel</h1>
          <h2>New Appointment Request</h2>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <p>A new appointment request has been submitted and requires your review.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Patient Details</h3>
            <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Department:</strong> ${data.department}</p>
            <p><strong>Preferred Date:</strong> ${new Date(data.preferredDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" 
               style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Appointment
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  // 🆕 ADD THESE NEW TEMPLATES

  // Super Admin Templates
  appointmentApprovedBySuperAdmin: (appointment: any) => ({
    subject: "🎉 Your Appointment has been Approved by Super Admin - AIIMS Jammu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">All India Institute of Medical Sciences</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
            <h2 style="color: #2e7d32; margin: 0;">✅ Appointment Approved by Super Admin</h2>
          </div>
          
          <div style="margin: 25px 0;">
            <p>Dear <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
            <p>Great news! Your appointment has been <strong>approved by our Super Admin</strong>.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Appointment Details:</h3>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">CONFIRMED</span></p>
            </div>
            
            ${appointment.superAdminFeedback ? `
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1976d2;">Super Admin Message:</h4>
                <p style="margin: 0; font-style: italic;">"${appointment.superAdminFeedback}"</p>
              </div>
            ` : ''}
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Please arrive 15 minutes before your appointment time</li>
              <li>Bring a valid ID and any relevant medical documents</li>
              <li>Contact us if you need to reschedule</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0;">© 2025 AIIMS Jammu. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  }),

  appointmentRejectedBySuperAdmin: (appointment: any) => ({
    subject: "❌ Your Appointment has been Rejected by Super Admin - AIIMS Jammu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">All India Institute of Medical Sciences</p>
          </div>
          
          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; text-align: center;">
            <div style="font-size: 48px; color: #f44336; margin: 10px 0;">❌</div>
            <h2 style="color: #c62828; margin: 10px 0; font-size: 24px;">APPOINTMENT REJECTED</h2>
            <p style="color: #c62828; margin: 5px 0; font-weight: bold;">by Super Admin</p>
          </div>
          
          <div style="margin: 25px 0;">
            <p>Dear <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
            <p>We regret to inform you that your appointment has been <strong style="color: #f44336;">REJECTED</strong> by our Super Admin after careful review.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Appointment Details:</h3>
              <p style="margin: 5px 0;"><strong>Appointment ID:</strong> #${appointment.id}</p>
              <p style="margin: 5px 0;"><strong>Patient:</strong> ${appointment.patientName}</p>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
              <p style="margin: 5px 0;"><strong>Requested Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString('en-IN')}</p>
              <p style="margin: 5px 0;"><strong>Requested Time:</strong> ${appointment.preferredTime}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f44336; font-weight: bold; background: #ffebee; padding: 2px 8px; border-radius: 4px;">❌ REJECTED BY SUPER ADMIN</span></p>
            </div>
            
            ${appointment.superAdminFeedback ? `
              <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h4 style="margin: 0 0 10px 0; color: #f57c00;">📝 Super Admin's Reason:</h4>
                <p style="margin: 0; font-style: italic; color: #555;">"${appointment.superAdminFeedback}"</p>
              </div>
            ` : ''}
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h4 style="margin: 0 0 10px 0; color: #2e7d32;">💡 What can you do next?</h4>
              <ul style="margin: 5px 0; padding-left: 20px; color: #555;">
                <li>You can book a new appointment with different date/time</li>
                <li>Contact our admin team for detailed guidance</li>
                <li>Contact AIIMS Jammu: <strong>0191-2974401</strong></li>
                <li>Visit our help desk for alternative medical options</li>
              </ul>
            </div>
            
            <p>We apologize for any inconvenience caused. Thank you for your understanding and for choosing AIIMS Jammu!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0;">© 2025 AIIMS Jammu. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  }),

  // Admin Templates
  appointmentApprovedByAdmin: (appointment: any) => ({
    subject: `✅ Your Appointment has been Approved - AIIMS Jammu ${appointment.isUrgent ? '🚨 URGENT' : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">All India Institute of Medical Sciences</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; text-align: center;">
            <div style="font-size: 48px; color: #4caf50; margin: 10px 0;">✅</div>
            <h2 style="color: #2e7d32; margin: 10px 0; font-size: 24px;">APPOINTMENT APPROVED</h2>
            ${appointment.isUrgent ? `<p style="color: #ff9800; margin: 5px 0; font-weight: bold;">🚨 URGENT PRIORITY</p>` : ''}
          </div>
          
          <div style="margin: 25px 0;">
            <p>Dear <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
            <p>We are pleased to inform you that your appointment has been <strong style="color: #4caf50;">APPROVED</strong> by our medical staff!</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📋 Confirmed Appointment Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <p style="margin: 5px 0;"><strong>Appointment ID:</strong> #${appointment.id.slice(-6)}</p>
                <p style="margin: 5px 0;"><strong>Patient:</strong> ${appointment.patientName}</p>
                <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString('en-IN')}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.preferredTime}</p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> 
                  <span style="color: ${appointment.isUrgent ? '#ff9800' : '#4caf50'}; font-weight: bold; background: ${appointment.isUrgent ? '#fff3e0' : '#e8f5e8'}; padding: 2px 8px; border-radius: 4px;">
                    ${appointment.isUrgent ? '🚨 URGENT' : '✅ NORMAL'}
                  </span>
                </p>
              </div>
              <p style="margin: 10px 0 5px 0;"><strong>Status:</strong> 
                <span style="color: #4caf50; font-weight: bold; background: #e8f5e8; padding: 2px 8px; border-radius: 4px;">
                  ✅ CONFIRMED
                </span>
              </p>
            </div>
            
            ${appointment.wasForwarded && appointment.superAdminFeedback ? `
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h4 style="margin: 0 0 10px 0; color: #1565c0;">👨‍⚕️ Super Admin's Review:</h4>
                <p style="margin: 0; font-style: italic; color: #555; background: white; padding: 10px; border-radius: 4px;">
                  "${appointment.superAdminFeedback}"
                </p>
              </div>
            ` : ''}
            
            ${appointment.feedback ? `
              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h4 style="margin: 0 0 10px 0; color: #2e7d32;">💬 Admin's Note:</h4>
                <p style="margin: 0; font-style: italic; color: #555; background: white; padding: 10px; border-radius: 4px;">
                  "${appointment.feedback}"
                </p>
              </div>
            ` : ''}
            
            <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h4 style="margin: 0 0 10px 0; color: #1565c0;">📝 Important Instructions:</h4>
              <ul style="margin: 5px 0; padding-left: 20px; color: #555;">
                <li><strong>Arrive 15 minutes early</strong> for registration</li>
                <li><strong>Bring valid ID proof</strong> (Aadhaar, Passport, etc.)</li>
                <li><strong>Carry previous medical reports</strong> if any</li>
                <li><strong>Follow hospital COVID protocols</strong></li>
                ${appointment.isUrgent ? '<li><strong>Priority case</strong> - Please arrive on time</li>' : ''}
              </ul>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h4 style="margin: 0 0 10px 0; color: #2e7d32;">📞 Contact Information:</h4>
              <p style="margin: 5px 0; color: #555;">AIIMS Jammu: <strong>0191-2974401</strong></p>
              <p style="margin: 5px 0; color: #555;">Available: Monday-Saturday, 8:00 AM - 2:00 PM</p>
            </div>
            
            <p>We look forward to providing you with excellent medical care!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0;">© 2025 AIIMS Jammu. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  }),

  appointmentRejectedByAdmin: (appointment: any) => ({
    subject: "❌ Your Appointment has been Rejected - AIIMS Jammu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">All India Institute of Medical Sciences</p>
          </div>
          
          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; text-align: center;">
            <div style="font-size: 48px; color: #f44336; margin: 10px 0;">❌</div>
            <h2 style="color: #c62828; margin: 10px 0; font-size: 24px;">APPOINTMENT REJECTED</h2>
          </div>
          
          <div style="margin: 25px 0;">
            <p>Dear <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
            <p>We regret to inform you that your appointment has been <strong style="color: #f44336;">REJECTED</strong> by our medical staff.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Appointment Details:</h3>
              <p style="margin: 5px 0;"><strong>Appointment ID:</strong> #${appointment.id}</p>
              <p style="margin: 5px 0;"><strong>Patient:</strong> ${appointment.patientName}</p>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
              <p style="margin: 5px 0;"><strong>Requested Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString('en-IN')}</p>
              <p style="margin: 5px 0;"><strong>Requested Time:</strong> ${appointment.preferredTime}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f44336; font-weight: bold; background: #ffebee; padding: 2px 8px; border-radius: 4px;">❌ REJECTED</span></p>
            </div>
            
            ${appointment.feedback ? `
              <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h4 style="margin: 0 0 10px 0; color: #f57c00;">📝 Reason for Rejection:</h4>
                <p style="margin: 0; font-style: italic; color: #555;">"${appointment.feedback}"</p>
              </div>
            ` : ''}
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h4 style="margin: 0 0 10px 0; color: #2e7d32;">💡 What can you do next?</h4>
              <ul style="margin: 5px 0; padding-left: 20px; color: #555;">
                <li>You can book a new appointment with different date/time</li>
                <li>Contact AIIMS Jammu for assistance: <strong>0191-2974401</strong></li>
                <li>Visit our help desk for alternative options</li>
              </ul>
            </div>
            
            <p>We apologize for any inconvenience caused. Thank you for choosing AIIMS Jammu!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0;">© 2025 AIIMS Jammu. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  }),

  // Admin Notification Templates
  adminSuperAdminActionNotification: (appointment: any, action: 'approved' | 'rejected') => ({
    subject: `🔔 Super Admin ${action} Appointment #${appointment.id} - AIIMS Jammu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">Admin Notification</p>
          </div>
          
          <div style="background-color: ${action === 'approved' ? '#e8f5e8' : '#ffebee'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${action === 'approved' ? '#4caf50' : '#f44336'};">
            <h2 style="color: ${action === 'approved' ? '#2e7d32' : '#c62828'}; margin: 0;">
              ${action === 'approved' ? '✅ Super Admin Approved' : '❌ Super Admin Rejected'} Appointment
            </h2>
          </div>
          
          <div style="margin: 25px 0;">
            <p>Dear Admin,</p>
            <p>Super Admin has <strong>${action}</strong> the following appointment:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Appointment Details:</h3>
              <p style="margin: 5px 0;"><strong>ID:</strong> #${appointment.id}</p>
              <p style="margin: 5px 0;"><strong>Patient:</strong> ${appointment.firstName} ${appointment.lastName}</p>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString()}</p>
            </div>
            
            ${appointment.superAdminFeedback ? `
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1976d2;">Super Admin Feedback:</h4>
                <p style="margin: 0; font-style: italic;">"${appointment.superAdminFeedback}"</p>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0;">© 2025 AIIMS Jammu Admin Portal</p>
          </div>
        </div>
      </div>
    `
  }),

  adminActionConfirmation: (appointment: any, action: 'approved' | 'rejected') => ({
    subject: `${action === 'approved' ? '✅' : '❌'} Action Confirmed: You ${action} Appointment #${appointment.id.slice(-6)} - AIIMS Jammu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">Admin Portal - Action Confirmation</p>
          </div>
          
          <div style="background-color: ${action === 'approved' ? '#e8f5e8' : '#ffebee'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${action === 'approved' ? '#4caf50' : '#f44336'}; text-align: center;">
            <div style="font-size: 32px; margin: 10px 0;">${action === 'approved' ? '✅' : '❌'}</div>
            <h2 style="color: ${action === 'approved' ? '#2e7d32' : '#c62828'}; margin: 10px 0; font-size: 20px;">
              ACTION CONFIRMED: APPOINTMENT ${action.toUpperCase()}
            </h2>
            <p style="color: ${action === 'approved' ? '#2e7d32' : '#c62828'}; margin: 5px 0; font-weight: bold;">
              ID: #${appointment.id.slice(-6)}
            </p>
          </div>
          
          <div style="margin: 25px 0;">
            <p><strong>Dear Admin,</strong></p>
            <p>This confirms that you have successfully <strong style="color: ${action === 'approved' ? '#4caf50' : '#f44336'};">${action.toUpperCase()}</strong> the following appointment:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📋 Appointment Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <p style="margin: 5px 0;"><strong>Patient:</strong> ${appointment.firstName} ${appointment.lastName}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${appointment.phone}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${appointment.email}</p>
                <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString('en-IN')}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.preferredTime}</p>
              </div>
              <p style="margin: 10px 0 5px 0;"><strong>Status:</strong> 
                <span style="color: ${action === 'approved' ? '#4caf50' : '#f44336'}; font-weight: bold; background: ${action === 'approved' ? '#e8f5e8' : '#ffebee'}; padding: 2px 8px; border-radius: 4px;">
                  ${action === 'approved' ? '✅ CONFIRMED' : '❌ CANCELLED'}
                </span>
              </p>
            </div>
            
            ${appointment.feedback ? `
              <div style="background-color: ${action === 'approved' ? '#e8f5e8' : '#fff3e0'}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${action === 'approved' ? '#4caf50' : '#ff9800'};">
                <h4 style="margin: 0 0 10px 0; color: ${action === 'approved' ? '#2e7d32' : '#f57c00'};">
                  💬 Your ${action === 'approved' ? 'Note' : 'Rejection Reason'}:
                </h4>
                <p style="margin: 0; font-style: italic; color: #555; background: white; padding: 10px; border-radius: 4px;">
                  "${appointment.feedback}"
                </p>
              </div>
            ` : ''}
            
            <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h4 style="margin: 0 0 10px 0; color: #1565c0;">📬 Notifications Sent</h4>
              <p style="margin: 5px 0; color: #555;">The patient has been automatically notified via:</p>
              <ul style="margin: 5px 0; padding-left: 20px; color: #555;">
                <li>📧 <strong>Email</strong> - ${action === 'approved' ? 'Approval' : 'Rejection'} confirmation</li>
                <li>📱 <strong>SMS</strong> - Brief ${action === 'approved' ? 'approval' : 'rejection'} notification</li>
                <li>💬 <strong>WhatsApp</strong> - Detailed ${action === 'approved' ? 'approval' : 'rejection'} message</li>
              </ul>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Action performed:</strong> ${new Date().toLocaleString('en-IN')} by Admin Portal<br>
                <strong>System:</strong> AIIMS Jammu Appointment Management System
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0; font-size: 12px;">© 2025 AIIMS Jammu Admin Portal - Automated System Notification</p>
          </div>
        </div>
      </div>
    `
  }),

  // Admin Super Admin Comment Notification Template
  adminSuperAdminCommentNotification: (appointment: any) => {
    // Helper function to safely get patient name
    const getPatientName = (appointment: any) => {
      if (appointment.patientName) return appointment.patientName;
      if (appointment.firstName && appointment.lastName) return `${appointment.firstName} ${appointment.lastName}`;
      if (appointment.firstName) return appointment.firstName;
      return 'Unknown Patient';
    };

    // Helper function to safely get date
    const getFormattedDate = (appointment: any) => {
      const dateValue = appointment.preferredDate || appointment.date;
      if (!dateValue) return 'Not specified';
      try {
        return new Date(dateValue).toLocaleDateString('en-IN');
      } catch {
        return 'Invalid date';
      }
    };

    return {
      subject: `💬 Super Admin Comment on Appointment #${appointment.id?.slice(-6) || 'Unknown'} - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
              <p style="color: #666; margin: 5px 0;">Admin Notification - Action Required</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; text-align: center;">
              <div style="font-size: 32px; color: #2196f3; margin: 10px 0;">💬</div>
              <h2 style="color: #1565c0; margin: 10px 0; font-size: 20px;">SUPER ADMIN COMMENT</h2>
              <p style="color: #1565c0; margin: 5px 0; font-weight: bold;">Action Required</p>
            </div>
            
            <div style="margin: 25px 0;">
              <p><strong>Dear Admin,</strong></p>
              <p><strong>Super Admin has added a comment</strong> to the following appointment and it requires your review and action:</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📋 Appointment Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <p style="margin: 5px 0;"><strong>Appointment ID:</strong> #${appointment.id?.slice(-6) || 'Unknown'}</p>
                  <p style="margin: 5px 0;"><strong>Patient:</strong> ${getPatientName(appointment)}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${appointment.email || 'Not provided'}</p>
                  <p style="margin: 5px 0;"><strong>Phone:</strong> ${appointment.phone || 'Not provided'}</p>
                  <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department || 'Not specified'}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${getFormattedDate(appointment)}</p>
                  <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.preferredTime || appointment.time || 'Not specified'}</p>
                  <p style="margin: 5px 0;"><strong>Priority:</strong> 
                    <span style="color: ${appointment.priority === 'URGENT' ? '#ff9800' : '#666'}; font-weight: bold; background: ${appointment.priority === 'URGENT' ? '#fff3e0' : '#f5f5f5'}; padding: 2px 8px; border-radius: 4px;">
                      ${appointment.priority === 'URGENT' ? '🚨 URGENT' : appointment.priority || 'NORMAL'}
                    </span>
                  </p>
                </div>
                <p style="margin: 10px 0 5px 0;"><strong>Current Status:</strong> 
                  <span style="color: #ff9800; font-weight: bold; background: #fff3e0; padding: 2px 8px; border-radius: 4px;">
                    ⏳ PENDING YOUR ACTION
                  </span>
                </p>
              </div>              
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h4 style="margin: 0 0 10px 0; color: #1565c0;">👨‍⚕️ Super Admin's Comment:</h4>
                <div style="background: white; padding: 15px; border-radius: 4px; border-left: 3px solid #2196f3;">
                  <p style="margin: 0; font-style: italic; color: #555; font-size: 16px; line-height: 1.5;">
                    "${appointment.superAdminFeedback || 'No specific comment provided'}"
                  </p>
                </div>
              </div>
              
              <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h4 style="margin: 0 0 10px 0; color: #f57c00;">⚡ Action Required:</h4>
                <p style="margin: 5px 0; color: #555;">Please review the Super Admin's comment and take appropriate action:</p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
                  <li><strong>Approve</strong> the appointment if it meets all requirements</li>
                  <li><strong>Reject</strong> the appointment if there are valid concerns</li>
                  <li><strong>Consider the Super Admin's guidance</strong> in your decision</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <div style="background: #1976d2; color: white; padding: 12px 24px; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🔗 Please login to Admin Panel to take action
                </div>
              </div>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  <strong>Comment received:</strong> ${new Date().toLocaleString('en-IN')}<br>
                  <strong>System:</strong> AIIMS Jammu Appointment Management<br>
                  <strong>Priority:</strong> ${appointment.priority === 'URGENT' ? 'HIGH - Urgent case requires immediate attention' : 'NORMAL - Please review at earliest convenience'}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0; font-size: 12px;">© 2025 AIIMS Jammu Admin Portal - Automated System Notification</p>
            </div>
          </div>
        </div>
      `
    };
  },

  // Forward to Super Admin Templates
  appointmentForwardedToSuperAdmin: (appointment: any) => {
    // Helper function to safely get patient name
    const getPatientName = (appointment: any) => {
      if (appointment.patientName) return appointment.patientName;
      if (appointment.firstName && appointment.lastName) return `${appointment.firstName} ${appointment.lastName}`;
      if (appointment.firstName) return appointment.firstName;  
      return 'Unknown Patient';
    };

    // Helper function to safely get date
    const getFormattedDate = (appointment: any) => {
      const dateValue = appointment.preferredDate || appointment.date;
      if (!dateValue) return 'Not specified';
      try {
        return new Date(dateValue).toLocaleDateString('en-IN');
      } catch {
        return 'Invalid date';
      }
    };

    return {
      subject: `🚨 URGENT: Your Appointment forwarded to Super Admin - AIIMS Jammu`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
              <p style="color: #666; margin: 5px 0;">All India Institute of Medical Sciences</p>
            </div>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; text-align: center;">
              <div style="font-size: 32px; color: #ff9800; margin: 10px 0;">🚨</div>
              <h2 style="color: #f57c00; margin: 10px 0; font-size: 20px;">URGENT PRIORITY</h2>
              <p style="color: #f57c00; margin: 5px 0; font-weight: bold;">Forwarded to Super Admin</p>
            </div>
            
            <div style="margin: 25px 0;">
              <p>Dear <strong>${getPatientName(appointment)}</strong>,</p>
              <p>Your appointment has been <strong style="color: #ff9800;">FORWARDED TO OUR SUPER ADMIN</strong> for special attention and review.</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📋 Appointment Details</h3>
                <p style="margin: 5px 0;"><strong>Appointment ID:</strong> #${appointment.id?.slice(-6) || 'Unknown'}</p>
                <p style="margin: 5px 0;"><strong>Patient:</strong> ${getPatientName(appointment)}</p>
                <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department || 'Not specified'}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${getFormattedDate(appointment)}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.preferredTime || appointment.time || 'Not specified'}</p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> 
                  <span style="color: #ff9800; font-weight: bold; background: #fff3e0; padding: 2px 8px; border-radius: 4px;">
                    🚨 URGENT - SUPER ADMIN REVIEW
                  </span>
                </p>
              </div>
              
              ${appointment.adminComment ? `
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
                  <h4 style="margin: 0 0 10px 0; color: #1565c0;">💬 Admin's Note:</h4>
                  <p style="margin: 0; font-style: italic; color: #555; background: white; padding: 10px; border-radius: 4px;">
                    "${appointment.adminComment}"
                  </p>
                </div>
              ` : ''}
              
              <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h4 style="margin: 0 0 10px 0; color: #f57c00;">⚡ What this means for you:</h4>
                <ul style="margin: 5px 0; padding-left: 20px; color: #555;">
                  <li><strong>Your case is now URGENT priority</strong> and will receive immediate attention</li>
                  <li>Our Super Admin will review your case personally</li>
                  <li>You will be notified as soon as a decision is made</li>
                  <li>This typically indicates a complex case requiring senior expertise</li>
                </ul>
              </div>
              
              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h4 style="margin: 0 0 10px 0; color: #2e7d32;">📞 Need assistance?</h4>
                <p style="margin: 5px 0; color: #555;">Contact AIIMS Jammu: <strong>0191-2974401</strong></p>
                <p style="margin: 5px 0; color: #555;">Available: Monday-Saturday, 8:00 AM - 2:00 PM</p>
              </div>
              
              <p>Thank you for your patience. We are committed to providing you the best possible care!</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0;">© 2025 AIIMS Jammu. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    };
  },

  superAdminNewForwardedAppointment: (appointment: any) => ({
    subject: `🚨 NEW URGENT: Admin forwarded Appointment #${appointment.id.slice(-6)} - Action Required`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">Super Admin Portal - Urgent Action Required</p>
          </div>
          
          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; text-align: center;">
            <div style="font-size: 32px; color: #f44336; margin: 10px 0;">🚨</div>
            <h2 style="color: #c62828; margin: 10px 0; font-size: 20px;">NEW URGENT APPOINTMENT</h2>
            <p style="color: #c62828; margin: 5px 0; font-weight: bold;">Forwarded by Admin - Requires Your Attention</p>
          </div>
          
          <div style="margin: 25px 0;">
            <p><strong>Dear Super Admin,</strong></p>
            <p>An admin has forwarded the following appointment to you for urgent review and decision:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📋 Appointment Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <p style="margin: 5px 0;"><strong>Appointment ID:</strong> #${appointment.id.slice(-6)}</p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: #f44336; font-weight: bold;">🚨 URGENT</span></p>
                <p style="margin: 5px 0;"><strong>Patient:</strong> ${appointment.patientName}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${appointment.phone}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${appointment.email}</p>
                <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString('en-IN')}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.preferredTime}</p>
              </div>
              ${appointment.symptoms ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <p style="margin: 5px 0;"><strong>Patient Symptoms:</strong></p>
                  <p style="margin: 5px 0; background: white; padding: 8px; border-radius: 4px; font-style: italic;">${appointment.symptoms}</p>
                </div>
              ` : ''}
            </div>
            
            ${appointment.adminComment ? `
              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h4 style="margin: 0 0 10px 0; color: #1565c0;">💬 Admin's Reason for Forwarding:</h4>
                <p style="margin: 0; font-style: italic; color: #555; background: white; padding: 10px; border-radius: 4px;">
                  "${appointment.adminComment}"
                </p>
              </div>
            ` : ''}
            
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <h4 style="margin: 0 0 10px 0; color: #f57c00;">⚡ Actions Required:</h4>
              <ul style="margin: 5px 0; padding-left: 20px; color: #555;">
                <li><strong>Review the appointment details carefully</strong></li>
                <li><strong>Approve, Reject, or Comment</strong> on this appointment</li>
                <li><strong>Priority is URGENT</strong> - Patient expects quick response</li>
                <li>Patient has been notified about the forwarding</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <p style="background: #1976d2; color: white; padding: 12px 20px; border-radius: 5px; margin: 0; font-weight: bold;">
                🔗 Please login to Super Admin Portal to take action
              </p>
            </div>
            
            <p><strong>System Information:</strong></p>
            <p style="color: #666; font-size: 14px;">
              • Forwarded: ${new Date().toLocaleString('en-IN')}<br>
              • Status: Pending Super Admin Action<br>
              • Patient notified about forwarding
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0; font-size: 12px;">© 2025 AIIMS Jammu Super Admin Portal - Automated System Notification</p>
          </div>
        </div>
      </div>
    `
  }),

  // New Reminder Templates
  appointment24hrReminder: (appointment: any) => ({
    subject: "⏰ Appointment Reminder - Tomorrow at AIIMS Jammu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f8ff;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">Appointment Reminder</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h2 style="color: #856404; margin: 0;">⏰ Your Appointment is Tomorrow!</h2>
          </div>
          
          <div style="margin: 25px 0;">
            <p>Dear <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
            <p>This is a friendly reminder that your appointment is <strong>tomorrow</strong>.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📅 Appointment Details:</h3>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString('en-IN')}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.preferredTime || 'As scheduled'}</p>
            </div>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #155724;">📝 Important Reminders:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Please arrive 15 minutes before your appointment</li>
                <li>Bring a valid ID and insurance documents</li>
                <li>Carry any relevant medical reports</li>
                <li>Wear a mask and maintain social distancing</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0;">See you tomorrow at AIIMS Jammu! 🏥</p>
          </div>
        </div>
      </div>
    `
  }),

  appointment2hrReminder: (appointment: any) => ({
    subject: "🚨 URGENT: Your Appointment is in 2 Hours - AIIMS Jammu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffe6e6;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a237e; margin: 0;">AIIMS Jammu</h1>
            <p style="color: #666; margin: 5px 0;">URGENT Appointment Reminder</p>
          </div>
          
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
            <h2 style="color: #721c24; margin: 0;">🚨 Your Appointment is in 2 HOURS!</h2>
          </div>
          
          <div style="margin: 25px 0;">
            <p>Dear <strong>${appointment.firstName} ${appointment.lastName}</strong>,</p>
            <p><strong>Your appointment is in just 2 hours!</strong> Please start preparing to leave.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">📅 Appointment Details:</h3>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.department}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.preferredTime || 'As scheduled'}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> AIIMS Jammu</p>
            </div>
            
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0c5460;">🚗 Action Required:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Leave NOW</strong> to account for traffic</li>
                <li><strong>Arrive 15 minutes early</strong> for check-in</li>
                <li>Bring your ID and medical documents</li>
                <li>Contact us if you're running late</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0;">Safe travels! We'll see you soon at AIIMS Jammu 🏥</p>
          </div>
        </div>
      </div>
    `
  }),

  // ... rest of your existing templates
};


// Send email function
export async function sendEmail(to: string, template: any) {
  try {
    const mailOptions = {
      from: `"AIIMS Jammu" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}