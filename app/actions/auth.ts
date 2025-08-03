"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  // Since we can't access localStorage in server actions, we'll need to handle this differently
  // For now, let's redirect to a client-side login handler
  const cookieStore = await cookies()
  cookieStore.set("login-attempt", JSON.stringify({ username, password }), {
    httpOnly: true,
    maxAge: 60, // 1 minute
  })

  redirect("/login/verify")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("user")
  redirect("/login")
}

export async function createUserAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const troopRank = formData.get("troopRank") as string
  const role = formData.get("role") as string
  const canCreateTasks = formData.get("canCreateTasks") === "on"
  const canDeleteTasks = formData.get("canDeleteTasks") === "on"
  const canManageUsers = formData.get("canManageUsers") === "on"

  if (!username || !password || !fullName || !troopRank) {
    return { error: "All fields are required" }
  }

  return { success: true }
}
