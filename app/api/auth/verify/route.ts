import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const supabase = createServerClient()

    // Get fresh user data
    const { data: user, error } = await supabase
      .from("users")
      .select(
        "id, username, email, full_name, troop_rank, role, can_create_tasks, can_delete_tasks, can_manage_users, created_at",
      )
      .eq("id", decoded.userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
