import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerClient()

    // Reset admin password to 'admin'
    const { data, error } = await supabase
      .from("users")
      .update({
        password_hash: "admin",
        can_create_tasks: true,
        can_delete_tasks: true,
        can_manage_users: true,
      })
      .eq("username", "admin")
      .select()
      .single()

    if (error) {
      console.error("Reset admin password error:", error)
      return NextResponse.json(
        {
          error: "Failed to reset admin password",
          details: error.message,
          code: error.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Admin password reset to 'admin' successfully",
      user: {
        username: data.username,
        password: "admin",
      },
    })
  } catch (error) {
    console.error("Reset admin password error:", error)
    return NextResponse.json(
      {
        error: "Database connection error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
