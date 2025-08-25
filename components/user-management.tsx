"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { createUser, updateUser, deleteUser, getRanks } from "@/lib/supabase"
import { toast } from "sonner"

interface User {
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

interface Rank {
  id: string
  name: string
  order_index: number
}

interface UserManagementProps {
  users: User[]
  onUsersChange: () => void
}

export function UserManagement({ users: initialUsers, onUsersChange }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [ranks, setRanks] = useState<Rank[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    troop_rank: "",
    role: "user",
    can_create_tasks: false,
    can_delete_tasks: false,
    can_manage_users: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRanks()
    setUsers(initialUsers)
  }, [initialUsers])

  const loadRanks = async () => {
    try {
      const ranksData = await getRanks()
      setRanks(ranksData)
    } catch (error) {
      console.error("Error loading ranks:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      email: "",
      full_name: "",
      troop_rank: "",
      role: "user",
      can_create_tasks: false,
      can_delete_tasks: false,
      can_manage_users: false,
    })
    setEditingUser(null)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: "",
      email: user.email || "",
      full_name: user.full_name,
      troop_rank: user.troop_rank,
      role: user.role,
      can_create_tasks: user.can_create_tasks,
      can_delete_tasks: user.can_delete_tasks,
      can_manage_users: user.can_manage_users,
    })
    setShowUserForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Form submission started", { editingUser: !!editingUser, formData })

      if (editingUser) {
        // Update existing user
        const updateData: any = {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          troop_rank: formData.troop_rank,
          role: formData.role,
          can_create_tasks: formData.can_create_tasks,
          can_delete_tasks: formData.can_delete_tasks,
          can_manage_users: formData.can_manage_users,
        }

        if (formData.password) {
          updateData.password = formData.password
        }

        console.log("Updating user with data:", updateData)
        await updateUser(editingUser.id, updateData)
        toast.success("User updated successfully!")
      } else {
        // Create new user
        if (!formData.password) {
          toast.error("Password is required for new users")
          setLoading(false)
          return
        }

        if (!formData.username.trim()) {
          toast.error("Username is required")
          setLoading(false)
          return
        }

        if (!formData.full_name.trim()) {
          toast.error("Full name is required")
          setLoading(false)
          return
        }

        if (!formData.troop_rank) {
          toast.error("Rank is required")
          setLoading(false)
          return
        }

        const createData = {
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim() || undefined,
          full_name: formData.full_name.trim(),
          troop_rank: formData.troop_rank,
          role: formData.role,
          can_create_tasks: formData.can_create_tasks,
          can_delete_tasks: formData.can_delete_tasks,
          can_manage_users: formData.can_manage_users,
        }

        console.log("Creating new user with data:", createData)
        await createUser(createData)
        toast.success("User created successfully!")
      }

      setShowUserForm(false)
      resetForm()
      onUsersChange()
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error(`${error instanceof Error ? error.message : "Unknown error occurred"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await deleteUser(userId)
      toast.success("User deleted successfully!")
      onUsersChange()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">User Management</h3>
          <p className="text-sm text-gray-600">Manage system users and their permissions</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowUserForm(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users
          </CardTitle>
          <CardDescription>Manage users and their access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.troop_rank}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.can_create_tasks && <Badge variant="outline">Create</Badge>}
                      {user.can_delete_tasks && <Badge variant="outline">Delete</Badge>}
                      {user.can_manage_users && <Badge variant="outline">Manage</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user information and permissions" : "Add a new user to the system"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password {editingUser ? "(leave blank to keep current)" : "*"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required={!editingUser}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address (optional)"
              />
              <p className="text-xs text-gray-500">Leave empty if no email address is available</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="troop_rank">Rank *</Label>
                <Select
                  value={formData.troop_rank}
                  onValueChange={(value) => setFormData({ ...formData, troop_rank: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.length > 0 ? (
                      ranks.map((rank) => (
                        <SelectItem key={rank.id} value={rank.name}>
                          {rank.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Corporal">Corporal</SelectItem>
                        <SelectItem value="Sergeant">Sergeant</SelectItem>
                        <SelectItem value="Lieutenant">Lieutenant</SelectItem>
                        <SelectItem value="Captain">Captain</SelectItem>
                        <SelectItem value="Major">Major</SelectItem>
                        <SelectItem value="Colonel">Colonel</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="can_create_tasks">Can Create Tasks</Label>
                  <Switch
                    id="can_create_tasks"
                    checked={formData.can_create_tasks}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_create_tasks: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="can_delete_tasks">Can Delete Tasks</Label>
                  <Switch
                    id="can_delete_tasks"
                    checked={formData.can_delete_tasks}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_delete_tasks: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="can_manage_users">Can Manage Users</Label>
                  <Switch
                    id="can_manage_users"
                    checked={formData.can_manage_users}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_manage_users: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingUser ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
