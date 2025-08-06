"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Calendar, AlertTriangle } from "lucide-react"
import type { User } from "@/lib/auth"
import { getUsers } from "@/lib/supabase"
import { sendAssignmentNotification } from "@/lib/notifications"

interface TaskFormProps {
  user: User
  onClose: () => void
  onTaskCreated: (task: any) => void
}

interface UserOption {
  id: string
  full_name: string
  email: string
  troop_rank: string
}

export function TaskForm({ user, onClose, onTaskCreated }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [sendEmail, setSendEmail] = useState(true)
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await getUsers()
        setUsers(usersData || [])
      } catch (error) {
        console.error("Error loading users:", error)
      }
    }
    loadUsers()

    // Set minimum due date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split("T")[0]
    setDueDate(minDate)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const assignedTo = formData.get("assignedTo") as string
    const dueDateValue = formData.get("dueDate") as string

    // Validate due date
    const selectedDueDate = new Date(dueDateValue)
    const now = new Date()
    if (selectedDueDate <= now) {
      alert("Due date must be in the future")
      setLoading(false)
      return
    }

    // If assigning to someone, due date is required
    if (assignedTo && assignedTo !== "unassigned" && !dueDateValue) {
      alert("Due date is required when assigning a task to someone")
      setLoading(false)
      return
    }

    const newTask = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: "pending",
      priority: formData.get("priority") as string,
      assigned_to: assignedTo && assignedTo !== "unassigned" ? assignedTo : null,
      created_by: user.id,
      due_date: dueDateValue,
    }

    try {
      const createdTask = await onTaskCreated(newTask)

      // Send email notification if a user is assigned and email is enabled
      if (assignedTo && assignedTo !== "unassigned" && sendEmail) {
        try {
          await sendAssignmentNotification(createdTask.id, assignedTo, user.id)
        } catch (emailError) {
          console.error("Error sending notification:", emailError)
          // Don't fail the task creation if email fails
          alert("Task created successfully, but email notification failed to send.")
        }
      }

      onClose()
    } catch (error) {
      console.error("Error in task creation:", error)
      alert("Error creating task. Please try again.")
    }

    setLoading(false)
  }

  const selectedUserData = users.find((u) => u.id === selectedUser)
  const isAssigned = selectedUser && selectedUser !== "unassigned"

  // Calculate days until due date
  const getDaysUntilDue = () => {
    if (!dueDate) return 0
    const due = new Date(dueDate)
    const now = new Date()
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const daysUntilDue = getDaysUntilDue()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" placeholder="Enter task title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Enter task description" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select name="assignedTo" value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((userOption) => (
                  <SelectItem key={userOption.id} value={userOption.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{userOption.full_name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {userOption.troop_rank}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedUserData && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                <Mail className="w-4 h-4" />
                <span>Will notify: {selectedUserData.email}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
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
              <Label htmlFor="dueDate">Due Date {isAssigned && <span className="text-red-500">*</span>}</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required={isAssigned}
              />
            </div>
          </div>

          {dueDate && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>Due in {daysUntilDue} days</strong>
                {isAssigned && (
                  <div className="mt-2 text-sm">
                    <strong>📅 Reminder Schedule:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>3 days before: First reminder email</li>
                      <li>1 day before: Urgent reminder email</li>
                      <li>On due date: Final warning email</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isAssigned && (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="sendEmail" className="text-sm">
                  Send email notification to assigned user
                </Label>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Task Visibility:</strong> Only the assigned user and admins will be able to see this task. The
                  assigned user will receive automatic reminders based on the due date.
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
