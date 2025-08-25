import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Task Management <noreply@yourdomain.com>",
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export function generateTaskAssignmentEmail(taskTitle: string, assignedBy: string, dueDate?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Task Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Task Assignment</h1>
          </div>
          <div class="content">
            <h2>You have been assigned a new task</h2>
            <p><strong>Task:</strong> ${taskTitle}</p>
            <p><strong>Assigned by:</strong> ${assignedBy}</p>
            ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ""}
            <p>Please log in to the task management system to view the full details and update the task status.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Task</a>
          </div>
          <div class="footer">
            <p>This is an automated message from the Task Management System.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
