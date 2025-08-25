"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Users,
} from "lucide-react"
import { format, isAfter, isBefore, addDays } from "date-fns"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "assigned" | "in_progress" | "completed"
  due_date: string
  created_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  created_user?: {
    id: string
    username: string
    email?: string
    full_name: string
    troop_rank: string
  }
  assignees?: Array<{
    user: {
      id: string
      username: string
      email?: string
      full_name: string
      troop_rank: string
    }
  }>
}

interface TaskCardProps {
  task: Task
  currentUser: any
  users: any[]
  onStatusUpdate: (taskId: string, newStatus: Task["status"], comment?: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, currentUser, users, onStatusUpdate, onEdit, onDelete }: TaskCardProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<Task["status"]>(task.status)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && task.status !== "completed"
  const isDueSoon =
    task.due_date &&
    isAfter(new Date(task.due_date), new Date()) &&
    isBefore(new Date(task.due_date), addDays(new Date(), 3))

  const canEdit = currentUser.role === "admin" || task.created_by === currentUser.id || currentUser.can_create_tasks
  const canDelete = currentUser.role === "admin" || task.created_by === currentUser.id || currentUser.can_delete_tasks
  const canUpdateStatus =
    currentUser.role === "admin" ||
    task.created_by === currentUser.id ||
    task.assigned_to === currentUser.id ||
    task.assignees?.some((assignee) => assignee.user.id === currentUser.id)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "assigned":
        return <Users className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleStatusUpdate = async () => {
    setLoading(true)
    try {
      await onStatusUpdate(task.id, newStatus, comment.trim() || undefined)
      setShowStatusDialog(false)
      setComment("")
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(task.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting task:", error)
    } finally {
      setLoading(false)
    }
  }

  const assignedUsers = task.assignees?.map((a) => a.user) || []
  if (task.assigned_to && !assignedUsers.find((u) => u.id === task.assigned_to)) {
    const assignedUser = users.find((u) => u.id === task.assigned_to)
    if (assignedUser) {
      assignedUsers.push(assignedUser)
    }
  }

  return (
    <>
      <Card
        className={`transition-all hover:shadow-md ${isOverdue ? "border-red-200 bg-red-50" : isDueSoon ? "border-yellow-200 bg-yellow-50" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {task.title}
                {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </CardTitle>
              <CardDescription className="mt-1">
                Created by {task.created_user?.full_name || "Unknown"} ({task.created_user?.troop_rank || "N/A"})
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>

              {(canEdit || canDelete || canUpdateStatus) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canUpdateStatus && (
                      <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Update Status
                      </DropdownMenuItem>
                    )}
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Task
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              {getStatusIcon(task.status)}
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace("_", " ").charAt(0).toUpperCase() + task.status.replace("_", " ").slice(1)}
              </Badge>
            </div>

            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span
                  className={isOverdue ? "text-red-600 font-medium" : isDueSoon ? "text-yellow-600 font-medium" : ""}
                >
                  Due {format(new Date(task.due_date), "MMM d, yyyy")}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Created {format(new Date(task.created_at), "MMM d, yyyy")}
            </div>
          </div>

          {assignedUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Assigned to:
              </div>
              <div className="flex flex-wrap gap-2">
                {assignedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.full_name}</span>
                    <span className="text-xs text-gray-500">({user.troop_rank})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
            <DialogDescription>Change the status of "{task.title}" and optionally add a comment.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(value: Task["status"]) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Comment (Optional)</Label>
              <Textarea
                placeholder="Add a comment about this status change..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "Deleting..." : "Delete Task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
