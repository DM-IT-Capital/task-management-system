"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskForm } from "./task-form"
import { UserManagement } from "./user-management"
import { RankManagement } from "./rank-management"
import { SLAManagement } from "./sla-management"
import { getTasks, getUsers, updateTaskStatus, deleteTask } from "@/lib/supabase"
import { toast } from "sonner"
import { Clock, AlertTriangle, CheckCircle, Circle, Play, Pause, Trash2, Edit } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "assigned" | "in_progress" | "on_hold" | "completed"
  due_date: string | null
  created_at: string
  updated_at: string
  created_by: string
  assigned_to: string | null
  created_user: {
    id: string
    username: string
    email: string
    full_name: string
    troop_rank: string
  }
}

interface DashboardContentProps {
  currentUser: any
}

export function DashboardContent({ currentUser }: DashboardContentProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tasks")

  // Check if current user is admin
  const isAdmin = currentUser.role === "admin"

  const loadTasks = async () => {
    try {
      const tasksData = await getTasks(currentUser.id, currentUser.role)
      setTasks(tasksData)
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast.error("Failed to load tasks")
    }
  }

  const loadUsers = async () => {
    try {
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadTasks(), loadUsers()])
      setLoading(false)
    }
    loadData()
  }, [currentUser.id, currentUser.role])

  const handleCreateTaskClick = () => {
    if (!currentUser.can_create_tasks && !isAdmin) {
      toast.error("You don't have permission to create tasks")
      return
    }
    setCreateTaskOpen(true)
  }

  const handleTaskCreated = () => {
    setCreateTaskOpen(false)
    loadTasks()
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditTaskOpen(true)
  }

  const handleTaskUpdated = () => {
    setEditTaskOpen(false)
    setEditingTask(null)
    loadTasks()
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus, currentUser.id)
      toast.success("Task status updated successfully")
      loadTasks()
    } catch (error) {
      console.error("Error updating task status:", error)
      toast.error("Failed to update task status")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser.can_delete_tasks && !isAdmin) {
      toast.error("You don't have permission to delete tasks")
      return
    }
    setDeleteTaskId(taskId)
  }

  const confirmDeleteTask = async () => {
    if (!deleteTaskId) return

    if (!currentUser.can_delete_tasks && !isAdmin) {
      toast.error("You don't have permission to delete tasks")
      return
    }

    try {
      await deleteTask(deleteTaskId)
      toast.success("Task deleted successfully")
      loadTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    } finally {
      setDeleteTaskId(null)
    }
  }

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      assigned: tasks.filter((t) => t.status === "assigned").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => {
        if (!t.due_date || t.status === "completed") return false
        return new Date(t.due_date) < new Date()
      }).length,
    }
    return stats
  }

  const getMyTasks = () => {
    return tasks.filter((task) => task.assigned_to === currentUser.id || task.created_by === currentUser.id)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      case "assigned":
        return "bg-purple-500"
      case "on_hold":
        return "bg-orange-500"
      case "pending":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <Play className="h-4 w-4" />
      case "assigned":
        return <div className="h-4 w-4 text-muted-foreground">User</div>
      case "on_hold":
        return <Pause className="h-4 w-4" />
      case "pending":
        return <Circle className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === "completed") return false
    return new Date(dueDate) < new Date()
  }

  const stats = getTaskStats()
  const myTasks = getMyTasks()

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">CalendarDays</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All tasks in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">User</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned}</div>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full ${isAdmin ? "grid-cols-5" : "grid-cols-2"}`}>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="ranks">Ranks</TabsTrigger>
              <TabsTrigger value="sla">SLA Settings</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">All Tasks</h2>
            {(currentUser.can_create_tasks || isAdmin) && (
              <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreateTaskClick}>Add Task</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Fill in the details to create a new task.</DialogDescription>
                  </DialogHeader>
                  <TaskForm users={users} onTaskCreated={handleTaskCreated} currentUser={currentUser} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className={`${isOverdue(task.due_date, task.status) ? "border-red-500" : ""}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {(currentUser.can_delete_tasks || isAdmin) && (
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={`${getStatusColor(task.status)} text-white border-0`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        {task.status.replace("_", " ").toUpperCase()}
                      </div>
                    </Badge>
                    {isOverdue(task.due_date, task.status) && <Badge variant="destructive">OVERDUE</Badge>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>Created by:</strong> {task.created_user.full_name} ({task.created_user.troop_rank})
                    </div>
                    <div>
                      <strong>Assigned to:</strong>{" "}
                      {task.assigned_to
                        ? users.find((u) => u.id === task.assigned_to)?.full_name || "Unknown User"
                        : "Unassigned"}
                    </div>
                    <div>
                      <strong>Created:</strong> {formatDate(task.created_at)}
                    </div>
                    <div>
                      <strong>Due:</strong> {task.due_date ? formatDate(task.due_date) : "No due date"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                      <SelectTrigger className="w-full">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Tasks</h2>
            <p className="text-muted-foreground">Tasks assigned to you or created by you</p>
          </div>

          <div className="grid gap-4">
            {myTasks.map((task) => (
              <Card key={task.id} className={`${isOverdue(task.due_date, task.status) ? "border-red-500" : ""}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {(currentUser.can_delete_tasks || isAdmin) && (
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={`${getStatusColor(task.status)} text-white border-0`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        {task.status.replace("_", " ").toUpperCase()}
                      </div>
                    </Badge>
                    {isOverdue(task.due_date, task.status) && <Badge variant="destructive">OVERDUE</Badge>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>Created by:</strong> {task.created_user.full_name} ({task.created_user.troop_rank})
                    </div>
                    <div>
                      <strong>Assigned to:</strong>{" "}
                      {task.assigned_to
                        ? users.find((u) => u.id === task.assigned_to)?.full_name || "Unknown User"
                        : "Unassigned"}
                    </div>
                    <div>
                      <strong>Created:</strong> {formatDate(task.created_at)}
                    </div>
                    <div>
                      <strong>Due:</strong> {task.due_date ? formatDate(task.due_date) : "No due date"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                      <SelectTrigger className="w-full">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="users">
              <UserManagement currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="ranks">
              <RankManagement />
            </TabsContent>

            <TabsContent value="sla">
              <SLAManagement />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the task details.</DialogDescription>
          </DialogHeader>
          <TaskForm
            users={users}
            onTaskCreated={handleTaskCreated}
            onTaskUpdated={handleTaskUpdated}
            currentUser={currentUser}
            editingTask={editingTask}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
