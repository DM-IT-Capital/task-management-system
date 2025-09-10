"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createTask, updateTask } from "@/lib/supabase"
import { toast } from "sonner"

interface User {
  id: string
  username: string
  full_name: string
  troop_rank: string
  role?: string
}

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "assigned" | "in_progress" | "on_hold" | "completed"
  due_date: string | null
  assigned_to: string | null
  task_assignments?: Array<{
    user_id: string
    assigned_user: {
      id: string
      username: string
      full_name: string
      troop_rank: string
    }
  }>
}

interface TaskFormProps {
  users: User[]
  onTaskCreated: () => void
  onTaskUpdated?: () => void
  currentUser: User
  editingTask?: Task | null
}

export function TaskForm({ users, onTaskCreated, onTaskUpdated, currentUser, editingTask }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    due_date: "",
    assigned_to: "unassigned",
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Check if current user is admin
  const isAdmin = currentUser.role === "admin"

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        due_date: editingTask.due_date ? editingTask.due_date.split("T")[0] : "",
        assigned_to: editingTask.assigned_to || "unassigned",
      })

      // Set selected users for multi-assignment (admin only)
      if (isAdmin && editingTask.task_assignments && editingTask.task_assignments.length > 0) {
        const assignedUserIds = editingTask.task_assignments.map((assignment) => assignment.user_id)
        setSelectedUsers(assignedUserIds)
      } else if (editingTask.assigned_to) {
        setSelectedUsers([editingTask.assigned_to])
      } else {
        setSelectedUsers([])
      }
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        due_date: "",
        assigned_to: "unassigned",
      })
      setSelectedUsers([])
    }
  }, [editingTask, isAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let assignmentData: string | string[] | undefined

      if (isAdmin) {
        // Admin can assign to multiple users
        assignmentData = selectedUsers.length > 0 ? selectedUsers : undefined
      } else {
        // Regular user can only assign to themselves
        assignmentData = formData.assigned_to === "unassigned" ? undefined : formData.assigned_to
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || null,
        assigned_to: assignmentData,
      }

      console.log("Submitting task data:", taskData)

      if (editingTask) {
        await updateTask(editingTask.id, taskData)
        toast.success("Task updated successfully!")
        onTaskUpdated?.()
      } else {
        const result = await createTask({
          ...taskData,
          created_by: currentUser.id,
        })
        console.log("Task creation result:", result)
        toast.success("Task created successfully!")
        onTaskCreated()
      }

      // Reset form after successful submission
      if (!editingTask) {
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "pending",
          due_date: "",
          assigned_to: "unassigned",
        })
        setSelectedUsers([])
      }
    } catch (error) {
      console.error("Error saving task:", error)
      toast.error(
        `Failed to ${editingTask ? "update" : "create"} task: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  // Get available users for assignment based on role
  const getAssignmentOptions = () => {
    if (isAdmin) {
      // Admin can assign to anyone
      return users.map((user) => ({
        ...user,
        displayName: user.id === currentUser.id ? `${user.full_name} (Me)` : `${user.full_name} (${user.troop_rank})`,
      }))
    } else {
      // Regular users can only assign to themselves
      return [
        {
          ...currentUser,
          displayName: `${currentUser.full_name} (Me)`,
        },
      ]
    }
  }

  const assignmentOptions = getAssignmentOptions()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to">
          Assign To {isAdmin ? "(Select multiple users)" : "(You can only assign to yourself)"}
        </Label>

        {isAdmin ? (
          // Multi-select for admin users
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unassigned"
                checked={selectedUsers.length === 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedUsers([])
                  }
                }}
              />
              <Label htmlFor="unassigned" className="text-sm font-normal">
                Unassigned
              </Label>
            </div>
            {assignmentOptions.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  id={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                />
                <Label htmlFor={user.id} className="text-sm font-normal">
                  {user.displayName}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          // Single select for regular users
          <Select
            value={formData.assigned_to}
            onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {assignmentOptions.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}
