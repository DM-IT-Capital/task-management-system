export type EmailPayload = {
  to: string
  subject: string
  html: string
}

// Client-safe wrapper that calls our server route
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/emails/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    return json
  } catch (err: any) {
    console.error("sendEmail error:", err)
    return { success: false, error: err?.message || "Unknown error" }
  }
}

// Helper to compose assignment email HTML
export function taskAssignedHtml(opts: {
  assigneeName: string
  title: string
  description?: string
  priority: string
  dueDate: string
  assignedBy: string
}) {
  const { assigneeName, title, description, priority, dueDate, assignedBy } = opts
  const color =
    priority === "high" ? "#dc2626" : priority === "medium" ? "#ea580c" : priority === "low" ? "#16a34a" : "#6b7280"

  return `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
    <h2 style="color: #111827; margin-bottom: 8px;">New Task Assigned</h2>
    <p>Hello ${assigneeName},</p>
    <p>You have been assigned a task by <strong>${assignedBy}</strong>.</p>
    <div style="background:#f3f4f6; border-radius:8px; padding:16px; margin:16px 0;">
      <p style="margin:0 0 8px;"><strong>Title:</strong> ${title}</p>
      <p style="margin:0 0 8px;"><strong>Description:</strong> ${description || "No description provided"}</p>
      <p style="margin:0 0 8px;">
        <strong>Priority:</strong> 
        <span style="color:${color}; text-transform:capitalize">${priority}</span>
      </p>
      <p style="margin:0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
    </div>
    <p>Please log in to the system to view and update progress.</p>
  </div>
  `
}

export function dueReminderHtml(opts: {
  assigneeName: string
  title: string
  dueDate: string
  daysLeft: number
  final?: boolean
}) {
  const { assigneeName, title, dueDate, daysLeft, final } = opts
  const header = final ? "Final Due Date Reminder" : "Upcoming Due Date Reminder"
  const line = final
    ? "This is your final reminder. The task is due today."
    : `This task is due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`

  return `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
    <h2 style="color: #111827; margin-bottom: 8px;">${header}</h2>
    <p>Hello ${assigneeName},</p>
    <p>${line}</p>
    <div style="background:#f3f4f6; border-radius:8px; padding:16px; margin:16px 0;">
      <p style="margin:0 0 8px;"><strong>Title:</strong> ${title}</p>
      <p style="margin:0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
    </div>
    <p>Please update the task status if you have made progress.</p>
  </div>
  `
}
