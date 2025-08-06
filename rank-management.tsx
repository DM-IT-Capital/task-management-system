"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Save, X, GripVertical } from "lucide-react"
import { getRanks, createRank, updateRank, deleteRank } from "@/lib/supabase"

interface Rank {
  id: string
  name: string
  order_index: number
}

export function RankManagement() {
  const [ranks, setRanks] = useState<Rank[]>([])
  const [showRankForm, setShowRankForm] = useState(false)
  const [editingRank, setEditingRank] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; order_index: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRanks = async () => {
      try {
        const ranksData = await getRanks()
        setRanks(ranksData || [])
      } catch (error) {
        console.error("Error loading ranks:", error)
        setRanks([])
      }
      setLoading(false)
    }

    loadRanks()
  }, [])

  const handleCreateRank = async (formData: FormData) => {
    const name = formData.get("name") as string
    const orderIndex = Number.parseInt(formData.get("orderIndex") as string) || ranks.length + 1

    if (!name) {
      alert("Rank name is required")
      return
    }

    try {
      const newRank = {
        name,
        order_index: orderIndex,
      }

      const createdRank = await createRank(newRank)
      const updatedRanks = [...ranks, createdRank].sort((a, b) => a.order_index - b.order_index)
      setRanks(updatedRanks)
      setShowRankForm(false)
      alert("Rank created successfully!")
    } catch (error) {
      console.error("Error creating rank:", error)
      alert("Error creating rank. Please try again.")
    }
  }

  const handleEditRank = (rank: Rank) => {
    setEditingRank(rank.id)
    setEditForm({ name: rank.name, order_index: rank.order_index })
  }

  const handleSaveEdit = async () => {
    if (!editForm || !editingRank) return

    try {
      const updatedRank = await updateRank(editingRank, {
        name: editForm.name,
        order_index: editForm.order_index,
      })

      const updatedRanks = ranks
        .map((rank) => (rank.id === editingRank ? updatedRank : rank))
        .sort((a, b) => a.order_index - b.order_index)
      setRanks(updatedRanks)

      setEditingRank(null)
      setEditForm(null)
      alert("Rank updated successfully!")
    } catch (error) {
      console.error("Error updating rank:", error)
      alert("Error updating rank. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    setEditingRank(null)
    setEditForm(null)
  }

  const handleDeleteRank = async (rankId: string, rankName: string) => {
    if (confirm(`Are you sure you want to delete the rank "${rankName}"?`)) {
      try {
        await deleteRank(rankId)
        const updatedRanks = ranks.filter((rank) => rank.id !== rankId)
        setRanks(updatedRanks)
        alert("Rank deleted successfully!")
      } catch (error) {
        console.error("Error deleting rank:", error)
        alert("Error deleting rank. Please try again.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rank Management</h2>
        <Button onClick={() => setShowRankForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rank
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        <strong>Rank Management:</strong> Create and organize custom ranks. The order index determines the hierarchy
        (lower numbers = higher priority).
      </div>

      {showRankForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreateRank} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rank Name</Label>
                  <Input id="name" name="name" type="text" placeholder="Enter rank name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    name="orderIndex"
                    type="number"
                    placeholder="Enter order (1, 2, 3...)"
                    defaultValue={ranks.length + 1}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowRankForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Rank</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading ranks...</div>
        ) : ranks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No ranks found</p>
            </CardContent>
          </Card>
        ) : (
          ranks.map((rank) => (
            <Card key={rank.id}>
              <CardContent className="pt-6">
                {editingRank === rank.id && editForm ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rank Name</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Order Index</Label>
                        <Input
                          type="number"
                          value={editForm.order_index}
                          onChange={(e) =>
                            setEditForm({ ...editForm, order_index: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>

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
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div>
                        <h3 className="font-semibold">{rank.name}</h3>
                        <p className="text-sm text-gray-600">Order: {rank.order_index}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">#{rank.order_index}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditRank(rank)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRank(rank.id, rank.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
