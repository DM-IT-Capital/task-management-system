import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { dueReminderHtml } from "@/lib/email"

type Task = {
  id: string
  title: string
  due_date: string
  status: string
  reminder_3d_sent: boolean
  reminder_1d_sent: boolean
  reminder_due_sent: boolean
}

export async function GET(request: Request) {
  // Optional security: require a secret token header
  const required = process.env.CRON_SECRET
  if (required) {
    const auth = request.headers.get("authorization") || ""
    if (auth !== `Bearer ${required}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const now = new Date()
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    // Fetch tasks due between now and 3 days, not completed
    const { data: tasks, error: tasksErr } = await supabase
      .from("tasks")
      .select("*")
      .gte("due_date", now.toISOString())
      .lte("due_date", in3Days.toISOString())
      .neq("status", "completed")

    if (tasksErr) throw tasksErr

    const taskList = (tasks || []) as Task[]
    if (taskList.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No tasks in reminder window" })
    }

    const taskIds = taskList.map((t) => t.id)

    // Fetch assignees and their user info
    const { data: assignees, error: assErr } = await supabase
      .from("task_assignees")
      .select("task_id, user:users(id, full_name, email)")
      .in("task_id", taskIds)

    if (assErr) throw assErr

    // Group assignees by task_id
    const byTask = new Map<string, { id: string; full_name: string; email: string }[]>()
    for (const row of assignees || []) {
      // @ts-ignore supabase nested alias
      const u = row.user
      if (!u?.email) continue
      if (!byTask.has(row.task_id)) byTask.set(row.task_id, [])
      byTask.get(row.task_id)!.push({ id: u.id, full_name: u.full_name, email: u.email })
    }

    let sentCount = 0

    for (const task of taskList) {
      const due = new Date(task.due_date)
      // daysLeft: 3, 2, 1, 0, ...
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

      let kind: "3d" | "1d" | "due" | null = null
      if (daysLeft === 3 && !task.reminder_3d_sent) kind = "3d"
      else if (daysLeft === 1 && !task.reminder_1d_sent) kind = "1d"
      else if (daysLeft === 0 && !task.reminder_due_sent) kind = "due"

      if (!kind) continue

      const recipients = byTask.get(task.id) || []
      for (const r of recipients) {
        const html = dueReminderHtml({
          assigneeName: r.full_name,
          title: task.title,
          dueDate: task.due_date,
          daysLeft: daysLeft,
          final: kind === "due",
        })

        // Call internal email route
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/emails/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: r.email,
            subject:
              kind === "due"
                ? `Final Reminder: "${task.title}" is due today`
                : `Reminder: "${task.title}" due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
            html,
          }),
        })
        sentCount++
      }

      // Mark sent flags
      const updates: Partial<Task> = {}
      if (kind === "3d") updates.reminder_3d_sent = true
      if (kind === "1d") updates.reminder_1d_sent = true
      if (kind === "due") updates.reminder_due_sent = true

      await supabase.from("tasks").update(updates).eq("id", task.id)
    }

    return NextResponse.json({ ok: true, sent: sentCount })
  } catch (err: any) {
    console.error("Cron due-reminders error:", err)
    return NextResponse.json({ ok: false, error: err?.message || "Unknown error" }, { status: 500 })
  }
}
