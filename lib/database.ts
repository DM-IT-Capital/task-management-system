import { supabase } from "./supabase"

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "assigned"
  priority: "low" | "medium" | "high"
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  due_date: string | null
}

export interface User {
  id: string
  username: string
  email: string
  full_name: string
  troop_rank: string
  role: string
  can_create_tasks: boolean
  can_delete_tasks: boolean
  can_manage_users: boolean
  created_at: string
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data || []
}

export async function createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task | null> {
  const { data, error } = await supabase.from("tasks").insert([task]).select().single()

  if (error) {
    console.error("Error creating task:", error)
    return null
  }

  return data
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task:", error)
    return null
  }

  return data
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting task:", error)
    return false
  }

  return true
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, username, email, full_name, troop_rank, role, can_create_tasks, can_delete_tasks, can_manage_users, created_at",
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data || []
}

export async function createUser(user: Omit<User, "id" | "created_at"> & { password: string }): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .insert([user])
    .select(
      "id, username, email, full_name, troop_rank, role, can_create_tasks, can_delete_tasks, can_manage_users, created_at",
    )
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select(
      "id, username, email, full_name, troop_rank, role, can_create_tasks, can_delete_tasks, can_manage_users, created_at",
    )
    .single()

  if (error) {
    console.error("Error updating user:", error)
    return null
  }

  return data
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from("users").delete().eq("id", id)

  if (error) {
    console.error("Error deleting user:", error)
    return false
  }

  return true
}
