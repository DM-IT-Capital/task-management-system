"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Edit, Save, X, RefreshCw } from "lucide-react"
import type { User } from "@/lib/auth"
import {
  getUsers,
  createUser as createUserDB,
  updateUser as updateUserDB,
  deleteUser as deleteUserDB,
  getRanks,
} from "@/lib/supabase"

interface UserData {
  id: string
  username: string
  email?: string
  full_name: string
  troop_rank: string
  role: string
  permissions: {
    can_create_tasks: boolean
    can_delete_tasks: boolean
    can_manage_users: boolean
  }
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  password?: string
}

interface Rank {
  id: string
  name: string
  order_index: number
}

interface UserManagementProps {
  currentUser: User
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [ranks, setRanks] = useState<Rank[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if current user is admin
  const isAdmin = currentUser.permissions.can_manage_users

  const resetToDefaults = async () => {
    if (!isAdmin) {
      alert("You don't have permission to reset system data")
      return
    }

    if (confirm("This will reset all users to default settings. Are you sure?")) {
      try {
        window.location.reload()
      } catch (error) {
        console.error("Error resetting system:", error)
        alert("Error resetting system. Please try again.")
      }
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load ranks
        const ranksData = await getRanks()
        setRanks(ranksData || [])

        // Load users
        const allUsers = await getUsers()

        // Filter users based on permissions
        if (isAdmin) {
          // Admin can see all users
          setUsers(allUsers || [])
        } else {
          // Regular user can only see their own profile
          const currentUserData = allUsers?.find((user: UserData) => user.id === currentUser.id)
          setUsers(currentUserData ? [currentUserData] : [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        // Fallback to default admin user if database fails
        const defaultUsers = [
          {
            id: "1",
            username: "admin",
            full_name: "System Administrator",
            troop_rank: "Colonel",
            role: "admin",
            permissions: {
              can_create_tasks: true,
              can_delete_tasks: true,
              can_manage_users: true,
            },
            password: "admin123",
          },
        ]
        setUsers(isAdmin ? defaultUsers : defaultUsers.filter((u) => u.id === currentUser.id))
      }
      setLoading(false)
    }

    loadData()
  }, [currentUser.id, isAdmin])

  const handleCreateUser = async (formData: FormData) => {
    if (!isAdmin) {
      alert("You don't have permission to create users")
      return
    }

    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const troopRank = formData.get("troopRank") as string
    const role = formData.get("role") as string
    const canCreateTasks = formData.get("canCreateTasks") === "on"
    const canDeleteTasks = formData.get("canDeleteTasks") === "on"
    const canManageUsers = formData.get("canManageUsers") === "on"

    if (!username || !email || !password || !fullName || !troopRank) {
      alert("All fields are required")
      return
    }

    try {
      const newUser = {
        username,
        email,
        password_hash: password,
        full_name: fullName,
        troop_rank: troopRank,
        role,
        permissions: {
          can_create_tasks: canCreateTasks,
          can_delete_tasks: canDeleteTasks,
          can_manage_users: canManageUsers,
        },
      }

      const createdUser = await createUserDB(newUser)
      const updatedUsers = [...users, { ...createdUser, password }]
      setUsers(updatedUsers)
      setShowUserForm(false)
      alert("User created successfully!")
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Error creating user. Please try again.")
    }
  }

  const handleEditUser = (user: UserData) => {
    // Users can only edit their own profile, admins can edit anyone
    if (!isAdmin && user.id !== currentUser.id) {
      alert("You can only edit your own profile")
      return
    }

    setEditingUser(user.id)
    setEditForm({ ...user })
  }

  const handleSaveEdit = async () => {
    if (!editForm) return

    // Users can only edit their own profile, admins can edit anyone
    if (!isAdmin && editForm.id !== currentUser.id) {
      alert("You can only edit your own profile")
      return
    }

    // Check if password change is being attempted
    const isPasswordChangeAttempted = editForm.currentPassword || editForm.newPassword || editForm.confirmPassword

    if (isPasswordChangeAttempted) {
      // Get current user data to check current password
      const currentUserData = users.find((u: UserData) => u.id === editForm.id)
      const storedPassword = currentUserData?.password || "admin123"

      if (!editForm.currentPassword) {
        alert("Please enter your current password to change it")
        return
      }

      if (editForm.currentPassword !== storedPassword) {
        alert("Current password is incorrect")
        return
      }

      if (!editForm.newPassword) {
        alert("Please enter a new password")
        return
      }

      if (editForm.newPassword.length < 3) {
        alert("New password must be at least 3 characters long")
        return
      }

      if (editForm.newPassword !== editForm.confirmPassword) {
        alert("New password and confirm password do not match")
        return
      }
    }

    try {
      // Create updated user object
      const updatedUser = {
        username: editForm.username,
        full_name: editForm.full_name,
        troop_rank: editForm.troop_rank,
        role: editForm.role,
        permissions: editForm.permissions,
        ...(isPasswordChangeAttempted && { password_hash: editForm.newPassword }),
      }

      await updateUserDB(editForm.id, updatedUser)

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === editForm.id
          ? {
              ...user,
              ...updatedUser,
              password: isPasswordChangeAttempted ? editForm.newPassword : user.password,
            }
          : user,
      )
      setUsers(updatedUsers)

      setEditingUser(null)
      setEditForm(null)

      if (isPasswordChangeAttempted) {
        alert("Profile updated successfully! Password has been changed.")
      } else {
        alert("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Error updating user. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm(null)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) {
      alert("You don't have permission to delete users")
      return
    }

    if (userId === "1") {
      alert("Cannot delete the main admin user")
      return
    }

    if (userId === currentUser.id) {
      alert("You cannot delete your own account")
      return
    }

    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserDB(userId)
        const updatedUsers = users.filter((user: UserData) => user.id !== userId)
        setUsers(updatedUsers)
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Error deleting user. Please try again.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{isAdmin ? "User Management" : "My Profile"}</h2>
        <div className="flex space-x-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={resetToDefaults}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button onClick={() => setShowUserForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Permission info */}
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        {isAdmin ? <strong>Admin Access:</strong> : <strong>User Access:</strong>}{" "}
        {isAdmin ? "You can view and manage all users in the system." : "You can only view and edit your own profile."}
      </div>

      {isAdmin && showUserForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" type="text" placeholder="Enter username" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Enter email address" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Enter password" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" placeholder="Enter full name" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="troopRank">Rank</Label>
                <Select name="troopRank">
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((rank) => (
                      <SelectItem key={rank.id} value={rank.name}>
                        {rank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="canCreateTasks" name="canCreateTasks" defaultChecked />
                    <Label htmlFor="canCreateTasks">Can create tasks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="canDeleteTasks" name="canDeleteTasks" />
                    <Label htmlFor="canDeleteTasks">Can delete tasks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="canManageUsers" name="canManageUsers" />
                    <Label htmlFor="canManageUsers">Can manage users</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                {editingUser === user.id && editForm ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rank</Label>
                        <Select
                          value={editForm.troop_rank}
                          onValueChange={(value) => setEditForm({ ...editForm, troop_rank: value })}
                          disabled={!isAdmin && editForm.id !== currentUser.id}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ranks.map((rank) => (
                              <SelectItem key={rank.id} value={rank.name}>
                                {rank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Password change section */}
                    <div className="space-y-4 border-t pt-4">
                      <Label className="text-sm font-medium">Change Password (Optional)</Label>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label>Current Password</Label>
                          <Input
                            type="password"
                            placeholder="Enter current password"
                            value={editForm.currentPassword || ""}
                            onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>New Password</Label>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            value={editForm.newPassword || ""}
                            onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm New Password</Label>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            value={editForm.confirmPassword || ""}
                            onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={editForm.role}
                          onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                          disabled={!isAdmin}
                        >
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

                    {/* Only admins can edit permissions */}
                    {isAdmin && (
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={editForm.permissions.can_create_tasks}
                              onCheckedChange={(checked) =>
                                setEditForm({
                                  ...editForm,
                                  permissions: { ...editForm.permissions, can_create_tasks: !!checked },
                                })
                              }
                            />
                            <Label>Can create tasks</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={editForm.permissions.can_delete_tasks}
                              onCheckedChange={(checked) =>
                                setEditForm({
                                  ...editForm,
                                  permissions: { ...editForm.permissions, can_delete_tasks: !!checked },
                                })
                              }
                            />
                            <Label>Can delete tasks</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={editForm.permissions.can_manage_users}
                              onCheckedChange={(checked) =>
                                setEditForm({
                                  ...editForm,
                                  permissions: { ...editForm.permissions, can_manage_users: !!checked },
                                })
                              }
                            />
                            <Label>Can manage users</Label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEdit}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <Badge variant="outline">{user.role}</Badge>
                        {user.id === currentUser.id && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <p className="text-sm text-gray-600">📧 {user.email || "No email set"}</p>
                      <p className="text-sm text-gray-600">Rank: {user.troop_rank}</p>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.can_create_tasks && (
                          <Badge variant="secondary" className="text-xs">
                            Create Tasks
                          </Badge>
                        )}
                        {user.permissions.can_delete_tasks && (
                          <Badge variant="secondary" className="text-xs">
                            Delete Tasks
                          </Badge>
                        )}
                        {user.permissions.can_manage_users && (
                          <Badge variant="secondary" className="text-xs">
                            Manage Users
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {isAdmin && user.id !== "1" && user.id !== currentUser.id && (
                        <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
