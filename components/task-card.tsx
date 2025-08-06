"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { User, Mail, Trash2, Clock, MessageSquare } from "lucide-react"
import type { User as AuthUser } from "@/lib/auth"
import { updateTaskStatus } from "@/lib/supabase"

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

interface TaskCardProps {
  task: Task
  user: AuthUser
  onDelete?: (taskId: string) => void
  onUpdate?: (updatedTask: Task) => void
}

export function TaskCard({ task, user, onDelete, onUpdate }: TaskCardProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [newStatus, setNewStatus] = useState(task.status)
  const [comment, setComment] = useState("")

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

  const getDaysUntilDue = () => {
    const due = new Date(task.due_date)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDueDateBadge = () => {
    const daysUntilDue = getDaysUntilDue()

    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue by {Math.abs(daysUntilDue)} days</Badge>
    } else if (daysUntilDue === 0) {
      return <Badge variant="destructive">Due Today</Badge>
    } else if (daysUntilDue === 1) {
      return <Badge className="bg-orange-100 text-orange-800">Due Tomorrow</Badge>
    } else if (daysUntilDue <= 3) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due in {daysUntilDue} days</Badge>
    } else {
      return <Badge variant="outline">Due in {daysUntilDue} days</Badge>
    }
  }

  const canUpdateStatus = () => {
    // User can update status if they are assigned to the task or are admin
    return task.assigned_to === user.id || user.permissions.can_manage_users
  }

  const canDelete = () => {
    return user.permissions.can_delete_tasks
  }

  const handleStatusUpdate = async () => {
    if (!canUpdateStatus()) {
      alert("You don't have permission to update this task status")
      return
    }

    setIsUpdatingStatus(true)
    try {
      const updatedTask = await updateTaskStatus(task.id, newStatus, user.id, comment)

      if (onUpdate) {
        onUpdate(updatedTask)
      }

      setShowStatusUpdate(false)
      setComment("")
      alert("Task status updated successfully!")
    } catch (error) {
      console.error("Error updating task status:", error)
      alert("Error updating task status. Please try again.")
    }
    setIsUpdatingStatus(false)
  }

  const isAssignedToCurrentUser = task.assigned_to === user.id
  const isCreatedByCurrentUser = task.created_by === user.id

  return (
    <Card className={`${isAssignedToCurrentUser ? "border-blue-200 bg-blue-50/30" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{task.title}</CardTitle>
              {isAssignedToCurrentUser && (
                <Badge variant="secondary" className="text-xs">
                  Assigned to You
                </Badge>
              )}
            </div>
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
            {canDelete() && (
              <Button variant="outline" size="sm" onClick={() => onDelete?.(task.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Due Date Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Due: {new Date(task.due_date).toLocaleDateString()} at {new Date(task.due_date).toLocaleTimeString()}
              </span>
            </div>
            {getDueDateBadge()}
          </div>

          {/* Status Update Section */}
          {canUpdateStatus() && (
            <div className="border-t pt-3">
              {!showStatusUpdate ? (
                <Button variant="outline" size="sm" onClick={() => setShowStatusUpdate(true)} className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">New Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Comment (Optional)</Label>
                    <Textarea
                      placeholder="Add a comment about this status update..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleStatusUpdate} disabled={isUpdatingStatus} className="flex-1">
                      {isUpdatingStatus ? "Updating..." : "Update"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowStatusUpdate(false)
                        setNewStatus(task.status)
                        setComment("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Task Visibility Info */}
          {isAssignedToCurrentUser && (
            <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
              <strong>📋 Your Task:</strong> This task is assigned to you. You'll receive email reminders 3 days, 1 day,
              and on the due date.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
