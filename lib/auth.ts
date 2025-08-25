import { cookies } from "next/headers"
import { redirect } from "next/navigation"

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
}

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie || !userCookie.value) {
      return null
    }

    const user = JSON.parse(userCookie.value)
    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (!user.can_manage_users) {
    redirect("/dashboard")
  }
  return user
}
