import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get admin user info
    const { data, error } = await supabase.from("users").select("*").eq("username", "admin").single()

    if (error) {
      console.error("Get admin user error:", error)
      return NextResponse.json(
        {
          error: "Failed to get admin user",
          details: error.message,
          code: error.code,
        },
        { status: 500 },
      )
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Admin user not found",
          suggestion: "Run the database setup scripts to create the admin user",
        },
        { status: 404 },
      )
    }

    // Return user info without sensitive data for debugging
    const debugInfo = {
      id: data.id,
      username: data.username,
      email: data.email,
      full_name: data.full_name,
      troop_rank: data.troop_rank,
      role: data.role,
      can_create_tasks: data.can_create_tasks,
      can_delete_tasks: data.can_delete_tasks,
      can_manage_users: data.can_manage_users,
      created_at: data.created_at,
      password_length: data.password_hash ? data.password_hash.length : 0,
      password_preview: data.password_hash ? data.password_hash.substring(0, 3) + "..." : "No password",
    }

    return NextResponse.json({
      success: true,
      user: debugInfo,
      message: "Admin user found successfully",
    })
  } catch (error) {
    console.error("Get admin user error:", error)
    return NextResponse.json(
      {
        error: "Database connection error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
