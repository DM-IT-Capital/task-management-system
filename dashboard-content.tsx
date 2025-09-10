"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, LogOut, Users, CheckSquare, Trash2, Award, User, Mail } from "lucide-react"
import { TaskForm } from "@/components/task-form"
import { UserManagement } from "@/components/user-management"
import { RankManagement } from "@/components/rank-management"
import { logoutAction } from "@/app/actions/auth"
import { getTasks, createTask, deleteTask } from "@/lib/supabase"
import type { User as AuthUser } from "@/lib/auth"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assigned_to: string
  created_by: string
  due_date: string
  created_at: string
  assigned_user?: {
    id: string
    full_name: string
    email: string
    troop_rank: string
  }
  created_user?: {
    id: string
    full_name: string
    email: string
    troop_rank: string
  }
}

export function DashboardContent({ user }: { user: AuthUser }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await getTasks()
        setTasks(tasksData || [])
      } catch (error) {
        console.error("Error loading tasks:", error)
        setTasks([])
      }
      setLoading(false)
    }

    loadTasks()
  }, [user.id])

  const handleDeleteTask = async (taskId: string) => {
    if (!user.permissions.can_delete_tasks) {
      alert("You do not have permission to delete tasks")
      return
    }

    try {
      await deleteTask(taskId)
      const updatedTasks = tasks.filter((task) => task.id !== taskId)
      setTasks(updatedTasks)
    } catch (error) {
      console.error("Error deleting task:", error)
      alert("Error deleting task. Please try again.")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management System</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user.full_name} ({user.troop_rank})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{user.role}</Badge>
              <form action={logoutAction}>
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              {user.permissions.can_manage_users ? "User Management" : "My Profile"}
            </TabsTrigger>
            {user.permissions.can_manage_users && (
              <TabsTrigger value="ranks">
                <Award className="w-4 h-4 mr-2" />
                Rank Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tasks</h2>
              {user.permissions.can_create_tasks && (
                <Button onClick={() => setShowTaskForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              )}
            </div>

            {showTaskForm && (
              <TaskForm
                user={user}
                onClose={() => setShowTaskForm(false)}
                onTaskCreated={async (newTask) => {
                  try {
                    const createdTask = await createTask(newTask)
                    const updatedTasks = [...tasks, createdTask]
                    setTasks(updatedTasks)
                    setShowTaskForm(false)
                    return createdTask
                  } catch (error) {
                    console.error("Error creating task:", error)
                    alert("Error creating task. Please try again.")
                    throw error
                  }
                }}
              />
            )}

            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No tasks found</p>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>

                          {/* Assignment and Creation Info */}
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>
                                Assigned to:{" "}
                                {task.assigned_user ? (
                                  <span className="font-medium text-gray-700">
                                    {task.assigned_user.full_name} ({task.assigned_user.troop_rank})
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Unassigned</span>
                                )}
                              </span>
                            </div>

                            {task.assigned_user?.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>{task.assigned_user.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-gray-400 mt-2">
                            Created by: {task.created_user?.full_name || "Unknown"} on{" "}
                            {new Date(task.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                          {user.permissions.can_delete_tasks && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        <span>Status: {task.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement currentUser={user} />
          </TabsContent>

          {user.permissions.can_manage_users && (
            <TabsContent value="ranks">
              <RankManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
