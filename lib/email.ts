#version1

<<<<<<< HEAD
// Enhanced email service for task notifications
=======
// Email service for sending task assignment notifications
>>>>>>> upstream/main
export async function sendTaskAssignmentEmail(
  assignedUser: { email: string; full_name: string },
  task: { title: string; description: string; priority: string; due_date: string },
  assignedBy: { full_name: string },
) {
  try {
<<<<<<< HEAD
    const dueDate = new Date(task.due_date)
    const emailContent = {
      to: assignedUser.email,
      subject: `🎯 New Task Assigned: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin: 0 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              🎯 New Task Assigned
            </h2>
            
            <p style="font-size: 16px; color: #374151;">Hello <strong>${assignedUser.full_name}</strong>,</p>
            
            <p style="color: #6b7280;">You have been assigned a new task by <strong>${assignedBy.full_name}</strong>:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${getPriorityColor(task.priority)};">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">${task.title}</h3>
              <p style="margin: 0 0 15px 0; color: #4b5563;"><strong>Description:</strong> ${task.description || "No description provided"}</p>
              <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <p style="margin: 0; color: #4b5563;"><strong>Priority:</strong> 
                  <span style="background: ${getPriorityColor(task.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
                    ${task.priority}
                  </span>
                </p>
                <p style="margin: 0; color: #4b5563;"><strong>Due Date:</strong> 
                  <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString()}
                  </span>
                </p>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>📅 Reminder Schedule:</strong><br>
                • 3 days before due date: First reminder<br>
                • 1 day before due date: Second reminder<br>
                • On due date: Final warning
              </p>
            </div>
            
            <p style="color: #6b7280;">Please log in to the task management system to view more details and update the task status.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Task Details
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Task Management System • Automated Notification
            </p>
          </div>
=======
    // In a real application, you would use a service like Resend, SendGrid, or similar
    // For now, we'll simulate the email sending and log it

    const emailContent = {
      to: assignedUser.email,
      subject: `New Task Assigned: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Task Assigned</h2>
          
          <p>Hello ${assignedUser.full_name},</p>
          
          <p>You have been assigned a new task by ${assignedBy.full_name}:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${task.title}</h3>
            <p style="margin: 0 0 10px 0;"><strong>Description:</strong> ${task.description || "No description provided"}</p>
            <p style="margin: 0 0 10px 0;"><strong>Priority:</strong> <span style="text-transform: capitalize; color: ${getPriorityColor(task.priority)};">${task.priority}</span></p>
            <p style="margin: 0;"><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
          </div>
          
          <p>Please log in to the task management system to view more details and update the task status.</p>
          
          <p>Best regards,<br>Task Management System</p>
>>>>>>> upstream/main
        </div>
      `,
    }

<<<<<<< HEAD
    console.log("📧 Assignment Email:", emailContent)
    alert(`📧 Assignment notification sent to ${assignedUser.full_name} (${assignedUser.email})`)
    return { success: true }
  } catch (error) {
    console.error("Error sending assignment email:", error)
    return { success: false, error }
  }
}

export async function sendTaskReminderEmail(
  assignedUser: { email: string; full_name: string },
  task: { title: string; description: string; priority: string; due_date: string; status: string },
  reminderType: "3_days_before" | "1_day_before" | "due_date",
) {
  try {
    const dueDate = new Date(task.due_date)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let subject = ""
    let urgencyColor = ""
    let urgencyIcon = ""
    let message = ""

    switch (reminderType) {
      case "3_days_before":
        subject = `⏰ Task Reminder: ${task.title} (Due in 3 days)`
        urgencyColor = "#f59e0b"
        urgencyIcon = "⏰"
        message = "This is a friendly reminder that your task is due in 3 days."
        break
      case "1_day_before":
        subject = `⚠️ Urgent: ${task.title} (Due Tomorrow!)`
        urgencyColor = "#ea580c"
        urgencyIcon = "⚠️"
        message = "URGENT: Your task is due tomorrow! Please complete it as soon as possible."
        break
      case "due_date":
        subject = `🚨 FINAL WARNING: ${task.title} (Due Today!)`
        urgencyColor = "#dc2626"
        urgencyIcon = "🚨"
        message = "FINAL WARNING: Your task is due TODAY! Immediate action required."
        break
    }

    const emailContent = {
      to: assignedUser.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: ${urgencyColor}; margin: 0 0 20px 0; border-bottom: 2px solid ${urgencyColor}; padding-bottom: 10px;">
              ${urgencyIcon} Task Reminder
            </h2>
            
            <p style="font-size: 16px; color: #374151;">Hello <strong>${assignedUser.full_name}</strong>,</p>
            
            <div style="background: ${urgencyColor}15; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
              <p style="color: ${urgencyColor}; font-weight: bold; margin: 0 0 10px 0; font-size: 16px;">
                ${message}
              </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">${task.title}</h3>
              <p style="margin: 0 0 15px 0; color: #4b5563;"><strong>Description:</strong> ${task.description || "No description provided"}</p>
              <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <p style="margin: 0; color: #4b5563;"><strong>Priority:</strong> 
                  <span style="background: ${getPriorityColor(task.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
                    ${task.priority}
                  </span>
                </p>
                <p style="margin: 0; color: #4b5563;"><strong>Current Status:</strong> 
                  <span style="background: #6b7280; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
                    ${task.status}
                  </span>
                </p>
                <p style="margin: 0; color: #4b5563;"><strong>Due Date:</strong> 
                  <span style="background: ${urgencyColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString()}
                  </span>
                </p>
              </div>
            </div>
            
            ${
              daysUntilDue <= 0
                ? `
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #dc2626; font-weight: bold;">
                  🚨 This task is overdue! Please complete it immediately and update the status.
                </p>
              </div>
            `
                : ""
            }
            
            <p style="color: #6b7280;">Please log in to the task management system to update the task status and provide any necessary updates.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Update Task Status
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Task Management System • Automated Reminder
            </p>
          </div>
        </div>
      `,
    }

    console.log(`📧 ${reminderType} Reminder Email:`, emailContent)
    alert(`📧 ${reminderType.replace("_", " ")} reminder sent to ${assignedUser.full_name} (${assignedUser.email})`)
    return { success: true }
  } catch (error) {
    console.error("Error sending reminder email:", error)
=======
    // Log the email content (in production, replace this with actual email sending)
    console.log("📧 Email would be sent:", emailContent)

    // Simulate API call to email service
    // await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(emailContent)
    // })

    // For demo purposes, show an alert
    alert(`📧 Email notification sent to ${assignedUser.full_name} (${assignedUser.email})`)

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
>>>>>>> upstream/main
    return { success: false, error }
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "#dc2626"
    case "medium":
      return "#ea580c"
    case "low":
      return "#16a34a"
    default:
      return "#6b7280"
  }
}
