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
import { Mail } from "lucide-react"
import type { User } from "@/lib/auth"
import { getUsers } from "@/lib/supabase"
import { sendTaskAssignmentEmail } from "@/lib/email"

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
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const assignedTo = formData.get("assignedTo") as string

    const newTask = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: "pending",
      priority: formData.get("priority") as string,
      assigned_to: assignedTo || null,
      created_by: user.id,
      due_date: formData.get("dueDate") as string,
    }

    try {
      const createdTask = await onTaskCreated(newTask)

      // Send email notification if a user is assigned and email is enabled
      if (assignedTo && sendEmail) {
        const assignedUser = users.find((u) => u.id === assignedTo)
        if (assignedUser && assignedUser.email) {
          await sendTaskAssignmentEmail(
            assignedUser,
            {
              title: newTask.title,
              description: newTask.description,
              priority: newTask.priority,
              due_date: newTask.due_date,
            },
            { full_name: user.full_name },
          )
        }
      }
    } catch (error) {
      console.error("Error in task creation:", error)
    }

    setLoading(false)
  }

  const selectedUserData = users.find((u) => u.id === selectedUser)

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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" required />
            </div>
          </div>

          {selectedUser && (
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
