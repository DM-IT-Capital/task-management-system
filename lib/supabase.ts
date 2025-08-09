import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

// USERS

export async function getUsers() {
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: true })
  if (error) throw error
  return data
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase.from("users").select("*").eq("username", username).single()
  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function getUserById(id: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()
  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function createUser(userData: any) {
  const { data, error } = await supabase.from("users").insert([userData]).select().single()
  if (error) throw error
  return data
}

export async function updateUser(id: string, updates: any) {
  const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id)
  if (error) throw error
}

// TASKS

// Admin: all tasks, User: only tasks assigned to them
export async function getTasksForUser(currentUserId: string, isAdmin: boolean) {
  if (isAdmin) {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        created_user:created_by(id, full_name, email, troop_rank),
        assignees:task_assignees(
          user:users(id, full_name, email, troop_rank)
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  // Only tasks where currentUser is an assignee
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      created_user:created_by(id, full_name, email, troop_rank),
      assignees:task_assignees!inner(
        user:users(id, full_name, email, troop_rank)
      )
    `,
    )
    .eq("task_assignees.user_id", currentUserId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createTaskWithAssignees(taskData: any, assigneeIds: string[]) {
  // 1) create task
  const { data: task, error: taskErr } = await supabase
    .from("tasks")
    .insert([taskData])
    .select(
      `
      *,
      created_user:created_by(id, full_name, email, troop_rank)
    `,
    )
    .single()
  if (taskErr) throw taskErr

  // 2) assign users (if any)
  if (assigneeIds?.length) {
    const rows = assigneeIds.map((uid) => ({ task_id: task.id, user_id: uid }))
    const { error: assignErr } = await supabase.from("task_assignees").insert(rows)
    if (assignErr) throw assignErr
  }

  // 3) refetch with assignees nested
  const { data: fullTask, error: refetchErr } = await supabase
    .from("tasks")
    .select(
      `
      *,
      created_user:created_by(id, full_name, email, troop_rank),
      assignees:task_assignees(
        user:users(id, full_name, email, troop_rank)
      )
    `,
    )
    .eq("id", task.id)
    .single()
  if (refetchErr) throw refetchErr

  return fullTask
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) throw error
}
