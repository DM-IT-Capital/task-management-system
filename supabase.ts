import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// User functions
export async function getUsers() {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getUsers:", error)
    throw error
  }
}

export async function getUserByUsername(username: string) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getUserByUsername:", error)
    throw error
  }
}

export async function getUserById(id: string) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getUserById:", error)
    throw error
  }
}

export async function createUser(userData: any) {
  try {
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in createUser:", error)
    throw error
  }
}

export async function updateUser(id: string, updates: any) {
  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in updateUser:", error)
    throw error
  }
}

export async function deleteUser(id: string) {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteUser:", error)
    throw error
  }
}

// Task functions with user details
export async function getTasks() {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, troop_rank),
        created_user:created_by(id, full_name, email, troop_rank)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getTasks:", error)
    throw error
  }
}

export async function createTask(taskData: any) {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([taskData])
      .select(`
      *,
      assigned_user:assigned_to(id, full_name, email, troop_rank),
      created_user:created_by(id, full_name, email, troop_rank)
    `)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in createTask:", error)
    throw error
  }
}

export async function updateTask(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select(`
      *,
      assigned_user:assigned_to(id, full_name, email, troop_rank),
      created_user:created_by(id, full_name, email, troop_rank)
    `)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in updateTask:", error)
    throw error
  }
}

export async function deleteTask(id: string) {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteTask:", error)
    throw error
  }
}

// Rank functions
export async function getRanks() {
  try {
    const { data, error } = await supabase.from("ranks").select("*").order("order_index", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getRanks:", error)
    throw error
  }
}

export async function createRank(rankData: any) {
  try {
    const { data, error } = await supabase.from("ranks").insert([rankData]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in createRank:", error)
    throw error
  }
}

export async function updateRank(id: string, updates: any) {
  try {
    const { data, error } = await supabase.from("ranks").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in updateRank:", error)
    throw error
  }
}

export async function deleteRank(id: string) {
  try {
    const { error } = await supabase.from("ranks").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteRank:", error)
    throw error
  }
}
