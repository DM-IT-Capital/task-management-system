"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { User } from "@/lib/auth"
import { getUsers } from "@/lib/supabase"
import { sendEmail, taskAssignedHtml } from "@/lib/email"

interface TaskFormProps {
  user: User
  onClose: () => void
  onTaskCreated: (task: any) => Promise<any> // returns created task
}

type UserOption = { id: string; full_name: string; email: string; troop_rank: string }

export function TaskForm({ user, onClose, onTaskCreated }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<UserOption[]>([])
  const [assignees, setAssignees] = useState<string[]>([])
  const [sendAssignmentEmails, setSendAssignmentEmails] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getUsers()
        setAllUsers((users || []) as any)
      } catch (e) {
        console.error("Failed to load users", e)
      }
    }
    loadUsers()
  }, [])

  const selectedUsers = useMemo(() => allUsers.filter((u) => assignees.includes(u.id)), [allUsers, assignees])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const newTask = {
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      status: "pending",
      priority: String(form.get("priority") || "medium"),
      created_by: user.id,
      due_date: String(form.get("dueDate") || ""),
    }

    try {
      const createdTask = await onTaskCreated(newTask)

      // Send assignment emails
      if (sendAssignmentEmails && selectedUsers.length) {
        await Promise.all(
          selectedUsers
            .filter((u) => !!u.email)
            .map((u) =>
              sendEmail({
                to: u.email,
                subject: `New Task Assigned: ${newTask.title}`,
                html: taskAssignedHtml({
                  assigneeName: u.full_name,
                  title: newTask.title,
                  description: newTask.description,
                  priority: newTask.priority,
                  dueDate: newTask.due_date,
                  assignedBy: user.full_name,
                }),
              }),
            ),
        )
      }
      onClose()
    } catch (err) {
      console.error("Error creating task:", err)
      alert("Error creating task. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleAssignee = (id: string, checked: boolean | "indeterminate") => {
    const on = !!checked
    setAssignees((prev) => (on ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)))
  }

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label>Assign To (multiple)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-auto border rounded-md p-2">
              {allUsers.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={assignees.includes(u.id)} onCheckedChange={(c) => toggleAssignee(u.id, c)} />
                  <span className="truncate">
                    {u.full_name} <span className="text-gray-500">({u.troop_rank || "N/A"})</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">Only selected users will see this task in their dashboard.</p>
          </div>

          {assignees.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox checked={sendAssignmentEmails} onCheckedChange={(c) => setSendAssignmentEmails(!!c)} />
              <Label className="text-sm">Send email notification to assigned users</Label>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {/* We need to persist assignees alongside task; we'll let parent handle assignees via hidden field */}
            <Button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                // Attach assignees as a global var the parent can read (simplest handoff)
                ;(window as any).__newTaskAssignees = assignees
              }}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
