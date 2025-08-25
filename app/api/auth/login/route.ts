import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    console.log("Login attempt for username:", username)

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get user from database
    const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    if (!user) {
      console.log("User not found:", username)
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    console.log("User found, checking password...")

    // Simple password comparison (in production, use proper hashing)
    if (user.password_hash !== password) {
      console.log("Password mismatch")
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    console.log("Password correct, creating session...")

    // Create session data
    const sessionData = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      troop_rank: user.troop_rank,
      role: user.role,
      can_create_tasks: user.can_create_tasks || false,
      can_delete_tasks: user.can_delete_tasks || false,
      can_manage_users: user.can_manage_users || false,
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: sessionData,
    })

    // Set session cookie
    response.cookies.set("user", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("Session cookie set, login complete")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
