import { supabase } from "./supabase"
import { sendTaskAssignmentEmail, sendTaskReminderEmail } from "./email"

export interface TaskNotification {
  id: string
  task_id: string
  user_id: string
  notification_type: "assignment" | "3_days_before" | "1_day_before" | "due_date"
  sent_at: string
  email_sent: boolean
}

// Create notification record
export async function createNotification(taskId: string, userId: string, type: TaskNotification["notification_type"]) {
  try {
    const { data, error } = await supabase
      .from("task_notifications")
      .insert([
        {
          task_id: taskId,
          user_id: userId,
          notification_type: type,
          email_sent: false,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Send assignment notification
export async function sendAssignmentNotification(taskId: string, assignedUserId: string, assignedByUserId: string) {
  try {
    // Get task and user details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, troop_rank),
        created_user:created_by(id, full_name, email, troop_rank)
      `)
      .eq("id", taskId)
      .single()

    if (taskError) throw taskError

    if (task.assigned_user && task.assigned_user.email) {
      // Send email
      await sendTaskAssignmentEmail(
        task.assigned_user,
        {
          title: task.title,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
        },
        task.created_user,
      )

      // Create notification record
      await createNotification(taskId, assignedUserId, "assignment")
    }
  } catch (error) {
    console.error("Error sending assignment notification:", error)
    throw error
  }
}

// Check for due date reminders
export async function checkDueDateReminders() {
  try {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get tasks that need reminders
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, troop_rank),
        created_user:created_by(id, full_name, email, troop_rank)
      `)
      .not("assigned_to", "is", null)
      .in("status", ["pending", "in-progress"])

    if (error) throw error

    for (const task of tasks || []) {
      const dueDate = new Date(task.due_date)
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

      // Check if we need to send reminders
      const notifications = await getTaskNotifications(task.id)

      // 3 days before reminder
      if (dueDateOnly.getTime() === threeDaysFromNow.getTime()) {
        const hasThreeDayReminder = notifications.some((n) => n.notification_type === "3_days_before")
        if (!hasThreeDayReminder && task.assigned_user?.email) {
          await sendTaskReminderEmail(
            task.assigned_user,
            {
              title: task.title,
              description: task.description,
              priority: task.priority,
              due_date: task.due_date,
              status: task.status,
            },
            "3_days_before",
          )
          await createNotification(task.id, task.assigned_to, "3_days_before")
        }
      }

      // 1 day before reminder
      if (dueDateOnly.getTime() === oneDayFromNow.getTime()) {
        const hasOneDayReminder = notifications.some((n) => n.notification_type === "1_day_before")
        if (!hasOneDayReminder && task.assigned_user?.email) {
          await sendTaskReminderEmail(
            task.assigned_user,
            {
              title: task.title,
              description: task.description,
              priority: task.priority,
              due_date: task.due_date,
              status: task.status,
            },
            "1_day_before",
          )
          await createNotification(task.id, task.assigned_to, "1_day_before")
        }
      }

      // Due date reminder
      if (dueDateOnly.getTime() === today.getTime()) {
        const hasDueDateReminder = notifications.some((n) => n.notification_type === "due_date")
        if (!hasDueDateReminder && task.assigned_user?.email) {
          await sendTaskReminderEmail(
            task.assigned_user,
            {
              title: task.title,
              description: task.description,
              priority: task.priority,
              due_date: task.due_date,
              status: task.status,
            },
            "due_date",
          )
          await createNotification(task.id, task.assigned_to, "due_date")
        }
      }
    }
  } catch (error) {
    console.error("Error checking due date reminders:", error)
    throw error
  }
}

// Get notifications for a task
export async function getTaskNotifications(taskId: string) {
  try {
    const { data, error } = await supabase.from("task_notifications").select("*").eq("task_id", taskId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting task notifications:", error)
    return []
  }
}

// Record task status update
export async function recordTaskStatusUpdate(
  taskId: string,
  userId: string,
  oldStatus: string,
  newStatus: string,
  comment?: string,
) {
  try {
    const { data, error } = await supabase
      .from("task_status_updates")
      .insert([
        {
          task_id: taskId,
          user_id: userId,
          old_status: oldStatus,
          new_status: newStatus,
          comment: comment,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error recording status update:", error)
    throw error
  }
}
