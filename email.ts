// Email service for sending task assignment notifications
export async function sendTaskAssignmentEmail(
  assignedUser: { email: string; full_name: string },
  task: { title: string; description: string; priority: string; due_date: string },
  assignedBy: { full_name: string },
) {
  try {
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
        </div>
      `,
    }

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
