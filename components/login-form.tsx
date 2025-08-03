"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { getUserByUsername } from "@/lib/supabase"
import Link from "next/link"

export function LoginForm() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Clear any existing user session on component mount
  useEffect(() => {
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (!username || !password) {
      setError("Username and password are required")
      setLoading(false)
      return
    }

    try {
      let user = null

      try {
        // Try to get user from database
        user = await getUserByUsername(username)
      } catch (dbError) {
        console.error("Database error:", dbError)
        setError("Database connection failed. Please check your internet connection and try again.")
        setLoading(false)
        return
      }

      if (!user) {
        setError("Invalid username or password")
        setLoading(false)
        return
      }

      // Check password (accept stored password_hash or "admin123" for admin)
      const isValidPassword = password === user.password_hash || (username === "admin" && password === "admin123")

      if (!isValidPassword) {
        setError("Invalid username or password")
        setLoading(false)
        return
      }

      // Set user session
      const userSession = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        troop_rank: user.troop_rank,
        role: user.role,
        permissions: user.permissions,
      }

      document.cookie = `user=${JSON.stringify(userSession)}; path=/; max-age=${60 * 60 * 24 * 7}`

      // Small delay to ensure cookie is set
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (error) {
      console.error("Login error:", error)
      setError("System error occurred. Please try again.")
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access the system</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                {error.includes("Database connection failed") && (
                  <div className="mt-2">
                    <Link href="/test-db" className="text-blue-600 underline text-sm">
                      → Test Database Connection
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" type="text" placeholder="Enter username" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Enter password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Link href="/test-db" className="text-sm text-blue-600 hover:underline">
            Test Database Connection
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
