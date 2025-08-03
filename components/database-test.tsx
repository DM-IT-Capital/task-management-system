"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database, Wifi, Play } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  details?: string
}

export function DatabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)
  const [setupRunning, setSetupRunning] = useState(false)

  const runDatabaseSetup = async () => {
    setSetupRunning(true)

    try {
      // Create users table
      const { error: usersError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            troop_rank TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            permissions JSONB DEFAULT '{"can_create_tasks": true, "can_delete_tasks": false, "can_manage_users": false}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (usersError) {
        // Try alternative approach - direct table creation
        const { error: directUsersError } = await supabase.from("users").select("*").limit(1)

        if (directUsersError && directUsersError.code === "42P01") {
          alert("Tables need to be created in Supabase dashboard. Please run the SQL script manually.")
          setSetupRunning(false)
          return
        }
      }

      // Create admin user
      const { data: adminUser, error: adminError } = await supabase
        .from("users")
        .insert([
          {
            username: "admin",
            password_hash: "admin123",
            full_name: "System Administrator",
            troop_rank: "Colonel",
            role: "admin",
            permissions: {
              can_create_tasks: true,
              can_delete_tasks: true,
              can_manage_users: true,
            },
          },
        ])
        .select()

      if (adminError && adminError.code !== "23505") {
        // 23505 is unique constraint violation (user already exists)
        throw adminError
      }

      alert("Database setup completed successfully!")
      runTests() // Re-run tests to verify
    } catch (error: any) {
      console.error("Setup error:", error)
      alert(`Setup failed: ${error.message}`)
    }

    setSetupRunning(false)
  }

  const runTests = async () => {
    setTesting(true)
    const testResults: TestResult[] = []

    // Test 1: Basic Connection
    testResults.push({ name: "Database Connection", status: "pending", message: "Testing..." })
    setTests([...testResults])

    try {
      const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true })
      if (error) throw error
      testResults[0] = {
        name: "Database Connection",
        status: "success",
        message: "✅ Connected successfully",
        details: `Connection established`,
      }
    } catch (error: any) {
      testResults[0] = {
        name: "Database Connection",
        status: "error",
        message: "❌ Connection failed",
        details: error.message,
      }
    }
    setTests([...testResults])

    // Test 2: Users Table
    testResults.push({ name: "Users Table", status: "pending", message: "Testing..." })
    setTests([...testResults])

    try {
      const { data, error } = await supabase.from("users").select("*").limit(1)
      if (error) throw error
      testResults[1] = {
        name: "Users Table",
        status: "success",
        message: "✅ Users table accessible",
        details: `Found ${data?.length || 0} users`,
      }
    } catch (error: any) {
      testResults[1] = {
        name: "Users Table",
        status: "error",
        message: "❌ Users table error",
        details: error.message,
      }
    }
    setTests([...testResults])

    // Test 3: Tasks Table
    testResults.push({ name: "Tasks Table", status: "pending", message: "Testing..." })
    setTests([...testResults])

    try {
      const { data, error } = await supabase.from("tasks").select("*").limit(1)
      if (error) throw error
      testResults[2] = {
        name: "Tasks Table",
        status: "success",
        message: "✅ Tasks table accessible",
        details: `Found ${data?.length || 0} tasks`,
      }
    } catch (error: any) {
      testResults[2] = {
        name: "Tasks Table",
        status: "error",
        message: "❌ Tasks table error",
        details: error.message,
      }
    }
    setTests([...testResults])

    // Test 4: Admin User Check
    testResults.push({ name: "Admin User", status: "pending", message: "Testing..." })
    setTests([...testResults])

    try {
      const { data, error } = await supabase.from("users").select("*").eq("username", "admin").single()
      if (error && error.code !== "PGRST116") throw error

      if (data) {
        testResults[3] = {
          name: "Admin User",
          status: "success",
          message: "✅ Admin user exists",
          details: `User: ${data.full_name} (${data.role})`,
        }
      } else {
        testResults[3] = {
          name: "Admin User",
          status: "error",
          message: "❌ Admin user not found",
          details: "Need to create default admin user",
        }
      }
    } catch (error: any) {
      testResults[3] = {
        name: "Admin User",
        status: "error",
        message: "❌ Admin user check failed",
        details: error.message,
      }
    }
    setTests([...testResults])

    setTesting(false)
  }

  const createAdminUser = async () => {
    try {
      const { data, error } = await supabase.from("users").insert([
        {
          username: "admin",
          password_hash: "admin123",
          full_name: "System Administrator",
          troop_rank: "Colonel",
          role: "admin",
          permissions: {
            can_create_tasks: true,
            can_delete_tasks: true,
            can_manage_users: true,
          },
        },
      ])

      if (error) throw error
      alert("Admin user created successfully!")
      runTests() // Re-run tests
    } catch (error: any) {
      alert(`Error creating admin user: ${error.message}`)
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "pending":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>
    }
  }

  const hasTableErrors = tests.some(
    (test) =>
      (test.name === "Users Table" || test.name === "Tasks Table") &&
      test.status === "error" &&
      test.details?.includes("does not exist"),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={testing}>
              {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
              {testing ? "Testing..." : "Run Connection Test"}
            </Button>

            {hasTableErrors && (
              <Button onClick={runDatabaseSetup} disabled={setupRunning} variant="outline">
                {setupRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {setupRunning ? "Setting up..." : "Auto Setup Database"}
              </Button>
            )}
          </div>

          {hasTableErrors && (
            <Alert>
              <AlertDescription>
                <strong>Tables Missing:</strong> Your database tables don't exist yet. You can either:
                <br />
                1. Click "Auto Setup Database" above, or
                <br />
                2. Run the SQL script manually in your Supabase dashboard
              </AlertDescription>
            </Alert>
          )}

          {tests.length > 0 && (
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{test.name}</span>
                      {getStatusBadge(test.status)}
                    </div>
                    <p className="text-sm text-gray-600">{test.message}</p>
                    {test.details && <p className="text-xs text-gray-500 mt-1">{test.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tests.some(
            (test) =>
              test.name === "Admin User" && test.status === "error" && !test.details?.includes("does not exist"),
          ) && (
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                <span>Admin user not found. Create it now?</span>
                <Button size="sm" onClick={createAdminUser}>
                  Create Admin User
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-600" : "text-red-600"}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Supabase Anon Key:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              <strong>If auto-setup doesn't work, follow these steps:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>
                Run the SQL script: <code>004-create-database-schema.sql</code>
              </li>
              <li>Come back here and click "Run Connection Test"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
