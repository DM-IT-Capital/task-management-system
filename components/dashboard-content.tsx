"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  LogOut,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  Edit,
  Trash2,
  Sun,
  Moon,
} from "lucide-react"
import { toast } from "sonner"
import { getTasks, getUsers, updateTaskStatus, deleteTask } from "@/lib/supabase"
import { TaskForm } from "@/components/task-form"
import { UserManagement } from "@/components/user-management"
import { RankManagement } from "@/components/rank-management"
import { SLAManagement } from "@/components/sla-management"

interface DashboardUser {
  id: string
  username: string
  email: string
  full_name: string
  troop_rank: string
  role: string
  can_create_tasks: boolean
  can_delete_tasks: boolean
  can_manage_users: boolean
  created_at: string
}

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "assigned" | "in_progress" | "on_hold" | "completed"
  due_date: string | null
  created_by: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  created_user?: {
    id: string
    username: string
    full_name: string
    troop_rank: string
  }
}

interface DashboardContentProps {
  user: DashboardUser
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("tasks")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tasksData, usersData] = await Promise.all([
        getTasks(user.id, user.role),
        user.can_manage_users ? getUsers() : Promise.resolve([]),
      ])
      setTasks(tasksData)
      setUsers(usersData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout failed")
    }
  }

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus, user.id)
      await loadData()
      toast.success("Task status updated")
    } catch (error) {
      console.error("Error updating task status:", error)
      toast.error("Failed to update task status")
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task)
    setShowDeleteDialog(true)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      await deleteTask(taskToDelete.id)
      toast.success("Task deleted successfully")
      await loadData()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    } finally {
      setShowDeleteDialog(false)
      setTaskToDelete(null)
    }
  }

  const handleTaskFormClose = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleTaskUpdated = () => {
    handleTaskFormClose()
    loadData()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Circle className="h-4 w-4 text-gray-500" />
      case "assigned":
        return <User className="h-4 w-4 text-blue-500" />
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-yellow-500" />
      case "on_hold":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskCounts = () => {
    const total = tasks.length
    const pending = tasks.filter((t) => t.status === "pending").length
    const assigned = tasks.filter((t) => t.status === "assigned").length
    const inProgress = tasks.filter((t) => t.status === "in_progress").length
    const onHold = tasks.filter((t) => t.status === "on_hold").length
    const completed = tasks.filter((t) => t.status === "completed").length
    const overdue = tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed",
    ).length

    return { total, pending, assigned, inProgress, onHold, completed, overdue }
  }

  const counts = getTaskCounts()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Task Management Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.full_name} ({user.troop_rank})
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.total}</div>
              <p className="text-xs text-muted-foreground">All tasks in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Circle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <User className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.assigned}</div>
              <p className="text-xs text-muted-foreground">Ready to start</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <PlayCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.inProgress}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.completed}</div>
              <p className="text-xs text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.overdue}</div>
              <p className="text-xs text-muted-foreground">Past due date</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            {user.can_manage_users && <TabsTrigger value="users">Users</TabsTrigger>}
            <TabsTrigger value="ranks">Ranks</TabsTrigger>
            <TabsTrigger value="sla">SLA Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">All Tasks</h3>
                <p className="text-sm text-muted-foreground">Manage all tasks in the system</p>
              </div>
              <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            <div className="grid gap-4">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tasks have been created yet.</p>
                    <Button onClick={() => setShowTaskForm(true)} className="mt-4">
                      Create First Task
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                            <span className="text-sm capitalize">{task.status.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {task.created_user && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Created by {task.created_user.full_name}
                            </div>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Due {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status !== "completed" && (
                            <Select
                              value={task.status}
                              onValueChange={(value) => handleTaskStatusUpdate(task.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.can_delete_tasks && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-tasks" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">My Tasks</h3>
              <p className="text-sm text-muted-foreground">Tasks assigned to you</p>
            </div>

            <div className="grid gap-4">
              {tasks.filter((task) => task.assigned_to === user.id).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tasks have been assigned to you yet.</p>
                  </CardContent>
                </Card>
              ) : (
                tasks
                  .filter((task) => task.assigned_to === user.id)
                  .map((task) => (
                    <Card key={task.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription>{task.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(task.status)}
                              <span className="text-sm capitalize">{task.status.replace("_", " ")}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Due {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {task.status !== "completed" && (
                              <Select
                                value={task.status}
                                onValueChange={(value) => handleTaskStatusUpdate(task.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="assigned">Assigned</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="on_hold">On Hold</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          {user.can_manage_users && (
            <TabsContent value="users" className="space-y-4">
              <UserManagement users={users} onUsersChange={loadData} />
            </TabsContent>
          )}

          <TabsContent value="ranks" className="space-y-4">
            <RankManagement />
          </TabsContent>

          <TabsContent value="sla" className="space-y-4">
            <SLAManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={handleTaskFormClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Update the task details" : "Fill in the details to create a new task"}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            users={users}
            onTaskCreated={() => {
              handleTaskFormClose()
              loadData()
            }}
            onTaskUpdated={handleTaskUpdated}
            currentUser={user}
            editingTask={editingTask}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the task "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-red-600 hover:bg-red-700">
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
