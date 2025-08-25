"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuth() {
  const [adminUser, setAdminUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetResult, setResetResult] = useState<any>(null)

  const checkAdminUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/debug/admin-user")
      const data = await response.json()

      if (data.success) {
        setAdminUser(data.user)
      } else {
        setError(JSON.stringify(data, null, 2))
      }
    } catch (err) {
      setError("Failed to fetch admin user: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const resetAdminPassword = async () => {
    setLoading(true)
    setError(null)
    setResetResult(null)
    try {
      const response = await fetch("/api/debug/reset-admin", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setResetResult(data)
        // Refresh admin user info
        await checkAdminUser()
      } else {
        setError(JSON.stringify(data, null, 2))
      }
    } catch (err) {
      setError("Failed to reset password: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>Debug admin user authentication issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={checkAdminUser} disabled={loading}>
              {loading ? "Loading..." : "Check Admin User"}
            </Button>
            <Button onClick={resetAdminPassword} disabled={loading} variant="destructive">
              {loading ? "Loading..." : "Reset Admin Password to 'admin'"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {adminUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Admin User Found:</h3>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">{JSON.stringify(adminUser, null, 2)}</pre>
            </div>
          )}

          {resetResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">After Reset:</h3>
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Username:</strong> {resetResult.user?.username}
                </p>
                <p>
                  <strong>Password:</strong> {resetResult.user?.password}
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Instructions:</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>
                First run the database script: <code>012-add-missing-columns.sql</code>
              </li>
              <li>Click "Check Admin User" to see current status</li>
              <li>Click "Reset Admin Password" if needed</li>
              <li>
                Try logging in with username: <code>admin</code> and password: <code>admin</code>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
