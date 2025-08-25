"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Circle, AlertTriangle, Play } from "lucide-react"

interface TestItem {
  id: string
  category: string
  description: string
  location: string
  expected: string
  tested: boolean
  working: boolean
  notes?: string
}

export function TestingGuide() {
  const [testItems, setTestItems] = useState<TestItem[]>([
    // Login Page Tests
    {
      id: "login-form",
      category: "Authentication",
      description: "Login form submission",
      location: "/login",
      expected: "Should accept admin/admin and redirect to dashboard",
      tested: false,
      working: false,
    },
    {
      id: "login-validation",
      category: "Authentication",
      description: "Form validation",
      location: "/login",
      expected: "Should show error for invalid credentials",
      tested: false,
      working: false,
    },

    // Dashboard Header Tests
    {
      id: "create-task-header",
      category: "Dashboard Header",
      description: "Create Task button (header)",
      location: "/dashboard - header",
      expected: "Should open task creation dialog",
      tested: false,
      working: false,
    },
    {
      id: "logout-button",
      category: "Dashboard Header",
      description: "Logout button",
      location: "/dashboard - header",
      expected: "Should log out and redirect to login",
      tested: false,
      working: false,
    },

    // Navigation Tabs Tests
    {
      id: "tasks-tab",
      category: "Navigation",
      description: "Tasks tab",
      location: "/dashboard",
      expected: "Should show all tasks with proper data",
      tested: false,
      working: false,
    },
    {
      id: "my-tasks-tab",
      category: "Navigation",
      description: "My Tasks tab",
      location: "/dashboard",
      expected: "Should show only assigned tasks",
      tested: false,
      working: false,
    },
    {
      id: "users-tab",
      category: "Navigation",
      description: "Users tab (admin only)",
      location: "/dashboard",
      expected: "Should show user management interface",
      tested: false,
      working: false,
    },
    {
      id: "ranks-tab",
      category: "Navigation",
      description: "Ranks tab",
      location: "/dashboard",
      expected: "Should show rank management interface",
      tested: false,
      working: false,
    },
    {
      id: "sla-tab",
      category: "Navigation",
      description: "SLA Settings tab",
      location: "/dashboard",
      expected: "Should show SLA configuration",
      tested: false,
      working: false,
    },

    // Task Management Tests
    {
      id: "add-task-button",
      category: "Task Management",
      description: "Add Task button in Tasks tab",
      location: "/dashboard - Tasks tab",
      expected: "Should open task creation dialog",
      tested: false,
      working: false,
    },
    {
      id: "task-status-dropdown",
      category: "Task Management",
      description: "Task status dropdown",
      location: "/dashboard - Task cards",
      expected: "Should update task status",
      tested: false,
      working: false,
    },
    {
      id: "task-edit-button",
      category: "Task Management",
      description: "Task edit button",
      location: "/dashboard - Task cards",
      expected: "Should open edit dialog",
      tested: false,
      working: false,
    },
    {
      id: "task-delete-button",
      category: "Task Management",
      description: "Task delete button",
      location: "/dashboard - Task cards",
      expected: "Should delete task after confirmation",
      tested: false,
      working: false,
    },

    // Task Form Tests
    {
      id: "task-form-submit",
      category: "Task Forms",
      description: "Task creation form submission",
      location: "Task creation dialog",
      expected: "Should create new task and close dialog",
      tested: false,
      working: false,
    },
    {
      id: "task-form-validation",
      category: "Task Forms",
      description: "Task form validation",
      location: "Task creation dialog",
      expected: "Should validate required fields",
      tested: false,
      working: false,
    },

    // User Management Tests
    {
      id: "add-user-button",
      category: "User Management",
      description: "Add User button",
      location: "/dashboard - Users tab",
      expected: "Should open user creation dialog",
      tested: false,
      working: false,
    },
    {
      id: "user-edit-button",
      category: "User Management",
      description: "User edit button",
      location: "/dashboard - Users tab",
      expected: "Should open user edit dialog",
      tested: false,
      working: false,
    },
    {
      id: "user-delete-button",
      category: "User Management",
      description: "User delete button",
      location: "/dashboard - Users tab",
      expected: "Should delete user after confirmation",
      tested: false,
      working: false,
    },
    {
      id: "user-form-submit",
      category: "User Management",
      description: "User form submission",
      location: "User creation/edit dialog",
      expected: "Should save user and close dialog",
      tested: false,
      working: false,
    },

    // Rank Management Tests
    {
      id: "add-rank-button",
      category: "Rank Management",
      description: "Add Rank button",
      location: "/dashboard - Ranks tab",
      expected: "Should open rank creation dialog",
      tested: false,
      working: false,
    },
    {
      id: "rank-edit-button",
      category: "Rank Management",
      description: "Rank edit button",
      location: "/dashboard - Ranks tab",
      expected: "Should open rank edit dialog",
      tested: false,
      working: false,
    },
    {
      id: "rank-delete-button",
      category: "Rank Management",
      description: "Rank delete button",
      location: "/dashboard - Ranks tab",
      expected: "Should delete rank after confirmation",
      tested: false,
      working: false,
    },

    // SLA Management Tests
    {
      id: "sla-switches",
      category: "SLA Management",
      description: "SLA escalation switches",
      location: "/dashboard - SLA tab",
      expected: "Should toggle escalation settings",
      tested: false,
      working: false,
    },
    {
      id: "sla-inputs",
      category: "SLA Management",
      description: "SLA time inputs",
      location: "/dashboard - SLA tab",
      expected: "Should update response times",
      tested: false,
      working: false,
    },
  ])

  const updateTestItem = (id: string, updates: Partial<TestItem>) => {
    setTestItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const getTestStats = () => {
    const total = testItems.length
    const tested = testItems.filter((item) => item.tested).length
    const working = testItems.filter((item) => item.working).length
    const failing = testItems.filter((item) => item.tested && !item.working).length

    return { total, tested, working, failing }
  }

  const stats = getTestStats()
  const categories = [...new Set(testItems.map((item) => item.category))]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">UI Testing Guide</h1>
        <p className="text-gray-600">Comprehensive testing checklist for all buttons and UI elements</p>
      </div>

      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tested</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tested}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.tested / stats.total) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.working}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failing}</div>
          </CardContent>
        </Card>
      </div>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>Follow these steps to test each UI element</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Before Testing:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Ensure you're logged in as admin</li>
                <li>• Have the browser developer tools open</li>
                <li>• Check console for any errors</li>
                <li>• Test on different screen sizes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Each Test:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Navigate to the specified location</li>
                <li>• Perform the action described</li>
                <li>• Verify the expected behavior</li>
                <li>• Mark as tested and working/failing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Categories */}
      <Tabs defaultValue={categories[0]} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{category} Tests</h3>
              <Badge variant="outline">
                {testItems.filter((item) => item.category === category && item.working).length} /{" "}
                {testItems.filter((item) => item.category === category).length} passing
              </Badge>
            </div>

            <div className="grid gap-4">
              {testItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-colors ${
                      item.tested
                        ? item.working
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{item.description}</CardTitle>
                          <CardDescription>
                            <strong>Location:</strong> {item.location}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.tested &&
                            (item.working ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong className="text-sm">Expected Behavior:</strong>
                        <p className="text-sm text-gray-600 mt-1">{item.expected}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`tested-${item.id}`}
                            checked={item.tested}
                            onCheckedChange={(checked) =>
                              updateTestItem(item.id, { tested: !!checked, working: !!checked ? item.working : false })
                            }
                          />
                          <label htmlFor={`tested-${item.id}`} className="text-sm">
                            Tested
                          </label>
                        </div>

                        {item.tested && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`working-${item.id}`}
                              checked={item.working}
                              onCheckedChange={(checked) => updateTestItem(item.id, { working: !!checked })}
                            />
                            <label htmlFor={`working-${item.id}`} className="text-sm">
                              Working
                            </label>
                          </div>
                        )}
                      </div>

                      {item.tested && !item.working && (
                        <div className="mt-2">
                          <label className="text-sm font-medium">Notes:</label>
                          <textarea
                            className="w-full mt-1 p-2 text-sm border rounded"
                            placeholder="Describe the issue..."
                            value={item.notes || ""}
                            onChange={(e) => updateTestItem(item.id, { notes: e.target.value })}
                            rows={2}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Bulk testing operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() =>
                setTestItems((prev) => prev.map((item) => ({ ...item, tested: false, working: false, notes: "" })))
              }
            >
              Reset All Tests
            </Button>
            <Button
              variant="outline"
              onClick={() => setTestItems((prev) => prev.map((item) => ({ ...item, tested: true, working: true })))}
            >
              Mark All as Working
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const results = testItems.map((item) => ({
                  test: item.description,
                  location: item.location,
                  status: item.tested ? (item.working ? "PASS" : "FAIL") : "NOT_TESTED",
                  notes: item.notes || "",
                }))
                console.log("Test Results:", results)
                alert("Test results logged to console")
              }}
            >
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
