import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend("re_QfhF5vXp_FvESFgZjwMoxYRqYKNSJk8Yt")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, assigneeName, taskTitle, taskDescription, priority, dueDate, assignedBy } = body

    if (type === "task_assignment") {
      const priorityColors = {
        high: "#ef4444",
        medium: "#f59e0b",
        low: "#10b981",
      }

      const priorityColor = priorityColors[priority as keyof typeof priorityColors] || "#6b7280"

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Task Assignment</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📋 New Task Assignment</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${assigneeName}</strong>,</p>
            
            <p style="margin-bottom: 25px;">You have been assigned a new task by <strong>${assignedBy}</strong>.</p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid ${priorityColor}; margin: 25px 0;">
              <h2 style="color: #2d3748; margin-top: 0; margin-bottom: 15px; font-size: 22px;">${taskTitle}</h2>
              
              <div style="margin-bottom: 20px;">
                <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                  ${priority} Priority
                </span>
              </div>
              
              <p style="color: #4a5568; margin-bottom: 20px; line-height: 1.6;">${taskDescription}</p>
              
              <div style="background: #f7fafc; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #2d3748;"><strong>📅 Due Date:</strong> ${new Date(
                  dueDate,
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" 
                 style="background: #4299e1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Task in Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #718096; font-size: 14px; text-align: center; margin: 0;">
              This is an automated message from the Task Management System.<br>
              Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `

      const { data, error } = await resend.emails.send({
        from: "Task Management System <noreply@yourdomain.com>",
        to: [to],
        subject: `🎯 New Task Assignment: ${taskTitle}`,
        html: emailHtml,
      })

      if (error) {
        console.error("Resend error:", error)
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
