"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, LogOut, Users, CheckSquare, Award, Eye } from "lucide-react"
import { TaskForm } from "@/components/task-form"
import { TaskCard } from "@/components/task-card"
import { UserManagement } from "@/components/user-management"
import { RankManagement } from "@/components/rank-management"
import { logoutAction } from "@/app/actions/auth"
import { getTasks, createTask, deleteTask } from "@/lib/supabase"
import { checkDueDateReminders } from "@/lib/notifications"
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
        // Pass user info to getTasks for visibility filtering
        const tasksData = await getTasks(user.id, user.role)
        setTasks(tasksData || [])
      } catch (error) {
        console.error("Error loading tasks:", error)
        setTasks([])
      }
      setLoading(false)
    }

    loadTasks()

    // Check for due date reminders (only for admins to avoid multiple checks)
    if (user.permissions.can_manage_users) {
      checkDueDateReminders().catch(console.error)
    }
  }, [user.id, user.role, user.permissions.can_manage_users])

  const handleDeleteTask = async (taskId: string) => {
    if (!user.permissions.can_delete_tasks) {
      alert("You do not have permission to delete tasks")
      return
    }

    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId)
        const updatedTasks = tasks.filter((task) => task.id !== taskId)
        setTasks(updatedTasks)
      } catch (error) {
        console.error("Error deleting task:", error)
        alert("Error deleting task. Please try again.")
      }
    }
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  // Separate tasks by assignment
  const myTasks = tasks.filter((task) => task.assigned_to === user.id)
  const createdTasks = tasks.filter((task) => task.created_by === user.id && task.assigned_to !== user.id)
  const allTasks = tasks

  // Get task counts
  const taskCounts = {
    total: tasks.length,
    assigned: myTasks.length,
    created: createdTasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => new Date(t.due_date) < new Date() && t.status !== "completed").length,
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
            {/* Task Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{taskCounts.total}</div>
                  <div className="text-xs text-gray-600">Total Tasks</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{taskCounts.assigned}</div>
                  <div className="text-xs text-gray-600">Assigned to Me</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{taskCounts.created}</div>
                  <div className="text-xs text-gray-600">Created by Me</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{taskCounts.pending}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{taskCounts.inProgress}</div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{taskCounts.completed}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{taskCounts.overdue}</div>
                  <div className="text-xs text-gray-600">Overdue</div>
                </CardContent>
              </Card>
            </div>

            {/* Task Visibility Info */}
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>Task Visibility:</strong>{" "}
                {user.permissions.can_manage_users
                  ? "As an admin, you can see all tasks in the system."
                  : "You can only see tasks assigned to you or tasks you created."}{" "}
                Tasks with email notifications will send reminders 3 days, 1 day, and on the due date.
              </AlertDescription>
            </Alert>

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

            {/* Task Sections */}
            <div className="space-y-6">
              {/* My Tasks Section */}
              {myTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="secondary">{myTasks.length}</Badge>
                    Tasks Assigned to Me
                  </h3>
                  <div className="grid gap-4">
                    {myTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        user={user}
                        onDelete={handleDeleteTask}
                        onUpdate={handleTaskUpdate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Created Tasks Section */}
              {createdTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="outline">{createdTasks.length}</Badge>
                    Tasks I Created
                  </h3>
                  <div className="grid gap-4">
                    {createdTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        user={user}
                        onDelete={handleDeleteTask}
                        onUpdate={handleTaskUpdate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Tasks Section (Admin Only) */}
              {user.permissions.can_manage_users && allTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="default">{allTasks.length}</Badge>
                    All Tasks (Admin View)
                  </h3>
                  <div className="grid gap-4">
                    {allTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        user={user}
                        onDelete={handleDeleteTask}
                        onUpdate={handleTaskUpdate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No Tasks Message */}
              {loading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No tasks found</p>
                    {!user.permissions.can_manage_users && (
                      <p className="text-sm text-gray-400 mt-2">
                        You can only see tasks assigned to you or tasks you created
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : null}
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
