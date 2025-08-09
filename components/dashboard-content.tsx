"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, LogOut, Users, CheckSquare, Trash2, Award, User } from 'lucide-react'
import { TaskForm } from "@/components/task-form"
import { UserManagement } from "@/components/user-management"
import { RankManagement } from "@/components/rank-management"
import { logoutAction } from "@/app/actions/auth"
import type { User as AuthUser } from "@/lib/auth"
import { getTasksForUser, createTaskWithAssignees, deleteTask } from "@/lib/supabase"

type Task = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_by: string
  due_date: string
  created_at: string
  created_user?: { id: string; full_name: string; email: string; troop_rank: string }
  assignees?: { user: { id: string; full_name: string; email: string; troop_rank: string } }[]
}

export function DashboardContent({ user }: { user: AuthUser }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const isAdmin = user.permissions.can_manage_users

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTasksForUser(user.id, isAdmin)
        setTasks((data || []) as any)
      } catch (e) {
        console.error("Error loading tasks:", e)
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id, isAdmin])

  const handleDeleteTask = async (taskId: string) => {
    if (!user.permissions.can_delete_tasks) {
      alert("You do not have permission to delete tasks")
      return
    }
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (e) {
      console.error("Delete failed:", e)
      alert("Error deleting task. Please try again.")
    }
  }

  const getPriorityColor = (priority: string) =>
    priority === "high" ? "destructive" : priority === "low" ? "secondary" : "default"
  const getStatusColor = (status: string) =>
    status === "completed" ? "default" : status === "in-progress" ? "secondary" : "outline"

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
              {isAdmin ? "User Management" : "My Profile"}
            </TabsTrigger>
            {isAdmin && (
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
                    const assigneeIds: string[] = (window as any).__newTaskAssignees || []
                    const created = await createTaskWithAssignees(newTask, assigneeIds)
                    setTasks((prev) => [created, ...prev])
                    setShowTaskForm(false)
                    return created
                  } catch (e) {
                    console.error("Create failed:", e)
                    alert("Error creating task. Please try again.")
                    throw e
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
                    {!isAdmin && <p className="text-gray-400 text-sm">Tasks appear here when they are assigned to you.</p>}
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => {
                  const assignees = (task.assignees || []).map((a) => a.user)
                  return (
                    <Card key={task.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>
                                  Assigned to:{" "}
                                  {assignees.length ? (
                                    <span className="font-medium text-gray-700">
                                      {assignees.map((u) => u.full_name).join(", ")}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">Unassigned</span>
                                  )}
                                </span>
                              </div>
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
                          <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}</span>
                          <span>Status: {task.status}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement currentUser={user} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="ranks">
              <RankManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
