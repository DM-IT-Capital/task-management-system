import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the main supabase client
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Create client function
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Create server client function
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// User management functions
export async function getUsers() {
  console.log("Fetching users...")
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

  console.log("Users fetched:", data?.length || 0)
  return data || []
}

export async function getUserByUsername(username: string) {
  console.log("Getting user by username:", username)
  const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user:", error)
    return null
  }

  console.log("User found:", data ? "Yes" : "No")
  return data
}

export async function createUser(userData: {
  username: string
  password: string
  email?: string
  full_name: string
  troop_rank: string
  role: string
  can_create_tasks?: boolean
  can_delete_tasks?: boolean
  can_manage_users?: boolean
}) {
  console.log("Creating user with data:", userData)

  try {
    const insertData = {
      username: userData.username,
      password_hash: userData.password,
      email: userData.email && userData.email.trim() ? userData.email.trim() : null,
      full_name: userData.full_name,
      troop_rank: userData.troop_rank,
      role: userData.role,
      can_create_tasks: userData.can_create_tasks || false,
      can_delete_tasks: userData.can_delete_tasks || false,
      can_manage_users: userData.can_manage_users || false,
    }

    console.log("Insert data:", insertData)

    const { data, error } = await supabase.from("users").insert([insertData]).select().single()

    if (error) {
      console.error("Supabase error creating user:", error)

      // Handle specific database constraint errors
      if (error.code === "23505") {
        if (error.message.includes("users_email_key")) {
          throw new Error("This email address is already registered. Please use a different email.")
        }
        if (error.message.includes("users_username_key")) {
          throw new Error("This username is already taken. Please choose a different username.")
        }
        throw new Error("A user with this information already exists.")
      }

      throw new Error(`Database error: ${error.message}`)
    }

    console.log("User created successfully:", data)
    return data
  } catch (error) {
    console.error("Error in createUser function:", error)
    throw error
  }
}

export async function updateUser(userId: string, userData: any) {
  console.log("Updating user:", userId, userData)

  try {
    // If password is being updated, use correct column name
    if (userData.password) {
      userData.password_hash = userData.password
      delete userData.password
    }

    // Handle email properly - convert empty string to null
    if (userData.email !== undefined) {
      userData.email = userData.email && userData.email.trim() ? userData.email.trim() : null
    }

    const { data, error } = await supabase.from("users").update(userData).eq("id", userId).select().single()

    if (error) {
      console.error("Supabase error updating user:", error)

      // Handle specific database constraint errors
      if (error.code === "23505") {
        if (error.message.includes("users_email_key")) {
          throw new Error("This email address is already registered. Please use a different email.")
        }
        if (error.message.includes("users_username_key")) {
          throw new Error("This username is already taken. Please choose a different username.")
        }
        throw new Error("A user with this information already exists.")
      }

      throw new Error(`Database error: ${error.message}`)
    }

    console.log("User updated successfully:", data)
    return data
  } catch (error) {
    console.error("Error in updateUser function:", error)
    throw error
  }
}

export async function deleteUser(userId: string) {
  console.log("Deleting user:", userId)

  try {
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Supabase error deleting user:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("User deleted successfully")
  } catch (error) {
    console.error("Error in deleteUser function:", error)
    throw error
  }
}

// Task management functions
export async function getTasks(userId?: string, userRole?: string) {
  console.log("Fetching tasks for user:", userId, "role:", userRole)

  try {
    let query = supabase
      .from("tasks")
      .select(`
        *,
        created_user:users!tasks_created_by_fkey(id, username, email, full_name, troop_rank)
      `)
      .order("created_at", { ascending: false })

    // If not admin, only show tasks assigned to user or created by user
    if (userId && userRole !== "admin") {
      query = query.or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error fetching tasks:", error)
      return []
    }

    console.log("Tasks fetched:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("Error in getTasks function:", error)
    return []
  }
}

export async function createTask(taskData: {
  title: string
  description: string
  priority: string
  status?: string
  due_date?: string | null
  created_by: string
  assigned_to?: string
}) {
  console.log("Creating task with data:", taskData)

  try {
    const status = taskData.status || (taskData.assigned_to ? "assigned" : "pending")

    const insertData = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: status,
      due_date: taskData.due_date,
      created_by: taskData.created_by,
      assigned_to: taskData.assigned_to || null,
    }

    console.log("Task insert data:", insertData)

    const { data, error } = await supabase
      .from("tasks")
      .insert([insertData])
      .select(`
        *,
        created_user:users!tasks_created_by_fkey(id, username, email, full_name, troop_rank)
      `)
      .single()

    if (error) {
      console.error("Supabase error creating task:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Task created successfully:", data)
    return data
  } catch (error) {
    console.error("Error in createTask function:", error)
    throw error
  }
}

export async function updateTask(
  taskId: string,
  taskData: {
    title: string
    description: string
    priority: string
    status?: string
    due_date?: string | null
    assigned_to?: string
  },
) {
  console.log("Updating task:", taskId, "with data:", taskData)

  try {
    const updateData = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status,
      due_date: taskData.due_date,
      assigned_to: taskData.assigned_to || null,
      updated_at: new Date().toISOString(),
    }

    console.log("Task update data:", updateData)

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .select(`
        *,
        created_user:users!tasks_created_by_fkey(id, username, email, full_name, troop_rank)
      `)
      .single()

    if (error) {
      console.error("Supabase error updating task:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Task updated successfully:", data)
    return data
  } catch (error) {
    console.error("Error in updateTask function:", error)
    throw error
  }
}

export async function updateTaskStatus(taskId: string, status: string, userId: string, comment?: string) {
  console.log("Updating task status:", taskId, "to:", status)

  try {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select(`
        *,
        created_user:users!tasks_created_by_fkey(id, username, email, full_name, troop_rank)
      `)
      .single()

    if (error) {
      console.error("Supabase error updating task status:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Task status updated successfully:", data)
    return data
  } catch (error) {
    console.error("Error in updateTaskStatus function:", error)
    throw error
  }
}

export async function deleteTask(taskId: string) {
  console.log("Deleting task:", taskId)

  try {
    // First delete task assignments if they exist
    await supabase.from("task_assignments").delete().eq("task_id", taskId)

    // Then delete the task
    const { error } = await supabase.from("tasks").delete().eq("id", taskId)

    if (error) {
      console.error("Supabase error deleting task:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Task deleted successfully")
  } catch (error) {
    console.error("Error in deleteTask function:", error)
    throw error
  }
}

// Rank management functions
export async function getRanks() {
  const { data, error } = await supabase.from("ranks").select("*").order("order_index", { ascending: true })

  if (error) {
    console.error("Error fetching ranks:", error)
    // Return default ranks if table doesn't exist
    return [
      { id: "1", name: "Private", order_index: 1 },
      { id: "2", name: "Corporal", order_index: 2 },
      { id: "3", name: "Sergeant", order_index: 3 },
      { id: "4", name: "Lieutenant", order_index: 4 },
      { id: "5", name: "Captain", order_index: 5 },
      { id: "6", name: "Major", order_index: 6 },
      { id: "7", name: "Colonel", order_index: 7 },
    ]
  }

  return data || []
}

export async function createRank(rankData: { name: string; order_index: number }) {
  const { data, error } = await supabase.from("ranks").insert([rankData]).select().single()

  if (error) {
    console.error("Error creating rank:", error)
    throw error
  }

  return data
}

export async function updateRank(rankId: string, rankData: { name: string; order_index: number }) {
  const { data, error } = await supabase.from("ranks").update(rankData).eq("id", rankId).select().single()

  if (error) {
    console.error("Error updating rank:", error)
    throw error
  }

  return data
}

export async function deleteRank(rankId: string) {
  const { error } = await supabase.from("ranks").delete().eq("id", rankId)

  if (error) {
    console.error("Error deleting rank:", error)
    throw error
  }
}

// SLA management functions
export async function getSLASettings() {
  const { data, error } = await supabase.from("sla_settings").select("*").order("priority", { ascending: false })

  if (error) {
    console.error("Error fetching SLA settings:", error)
    // Return default SLA settings
    return [
      {
        id: "1",
        priority: "high",
        response_hours: 4,
        reminder_intervals: "1,2,4",
        escalation_enabled: true,
      },
      {
        id: "2",
        priority: "medium",
        response_hours: 24,
        reminder_intervals: "4,12,24",
        escalation_enabled: true,
      },
      {
        id: "3",
        priority: "low",
        response_hours: 72,
        reminder_intervals: "24,48,72",
        escalation_enabled: false,
      },
    ]
  }

  return data || []
}

export async function updateSLASettings(slaData: {
  id?: string
  priority: string
  response_hours: number
  reminder_intervals: string
  escalation_enabled: boolean
}) {
  const { data, error } = await supabase
    .from("sla_settings")
    .upsert([slaData], { onConflict: "priority" })
    .select()
    .single()

  if (error) {
    console.error("Error updating SLA settings:", error)
    throw error
  }

  return data
}
