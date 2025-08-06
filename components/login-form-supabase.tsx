"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { getUserByUsername } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export function LoginFormSupabase() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      // Get user from Supabase
      const user = await getUserByUsername(username)

      if (!user) {
        setError("Invalid username or password")
        setLoading(false)
        return
      }

      // Check password (for demo, accept "admin123" or verify hash)
      const isValidPassword = password === "admin123" || (await bcrypt.compare(password, user.password_hash))

      if (!isValidPassword) {
        setError("Invalid username or password")
        setLoading(false)
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" type="text" placeholder="admin" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="admin123" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
