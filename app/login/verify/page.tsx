"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginVerifyPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogin = async () => {
      try {
        // Get users from localStorage
        const savedUsers = localStorage.getItem("users")
        let users = []

        if (savedUsers) {
          users = JSON.parse(savedUsers)
        } else {
          // Default users
          users = [
            {
              id: "1",
              username: "admin",
              password: "admin123", // This will be the current password
              full_name: "System Administrator",
              troop_rank: "Colonel",
              role: "admin",
              permissions: {
                can_create_tasks: true,
                can_delete_tasks: true,
                can_manage_users: true,
              },
            },
          ]
          localStorage.setItem("users", JSON.stringify(users))
        }

        // Get login attempt from URL params or session
        const urlParams = new URLSearchParams(window.location.search)
        const username = urlParams.get("username") || "admin"
        const password = urlParams.get("password") || ""

        if (!username || !password) {
          router.push("/login?error=missing-credentials")
          return
        }

        // Find user
        const user = users.find((u: any) => u.username === username)

        if (!user) {
          router.push("/login?error=invalid-credentials")
          return
        }

        // Check password - use the stored password from localStorage
        const isValidPassword = password === user.password

        if (!isValidPassword) {
          router.push("/login?error=invalid-credentials")
          return
        }

        // Set user session
        document.cookie = `user=${JSON.stringify({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          troop_rank: user.troop_rank,
          role: user.role,
          permissions: user.permissions,
        })}; path=/; max-age=${60 * 60 * 24 * 7}`

        router.push("/dashboard")
      } catch (error) {
        console.error("Login error:", error)
        router.push("/login?error=system-error")
      }
    }

    handleLogin()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Verifying credentials...</p>
      </div>
    </div>
  )
}
