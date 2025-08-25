"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Shield } from "lucide-react"
import { getRanks, createRank, updateRank, deleteRank } from "@/lib/supabase"
import { toast } from "sonner"

interface Rank {
  id: string
  name: string
  order_index: number
}

export function RankManagement() {
  const [ranks, setRanks] = useState<Rank[]>([])
  const [showRankForm, setShowRankForm] = useState(false)
  const [editingRank, setEditingRank] = useState<Rank | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    order_index: 1,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRanks()
  }, [])

  const loadRanks = async () => {
    try {
      const data = await getRanks()
      setRanks(data)
    } catch (error) {
      console.error("Error loading ranks:", error)
      toast.error("Failed to load ranks")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      order_index: ranks.length + 1,
    })
    setEditingRank(null)
  }

  const handleEdit = (rank: Rank) => {
    setEditingRank(rank)
    setFormData({
      name: rank.name,
      order_index: rank.order_index,
    })
    setShowRankForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingRank) {
        await updateRank(editingRank.id, formData)
        toast.success("Rank updated successfully!")
      } else {
        await createRank(formData)
        toast.success("Rank created successfully!")
      }

      setShowRankForm(false)
      resetForm()
      loadRanks()
    } catch (error) {
      console.error("Error saving rank:", error)
      toast.error("Failed to save rank")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (rankId: string) => {
    if (!confirm("Are you sure you want to delete this rank?")) return

    try {
      await deleteRank(rankId)
      toast.success("Rank deleted successfully!")
      loadRanks()
    } catch (error) {
      console.error("Error deleting rank:", error)
      toast.error("Failed to delete rank")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Rank Management</h3>
          <p className="text-sm text-gray-600">Manage military ranks and their hierarchy</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowRankForm(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Rank
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Military Ranks
          </CardTitle>
          <CardDescription>Manage the hierarchy of military ranks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Rank Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranks.map((rank) => (
                <TableRow key={rank.id}>
                  <TableCell>{rank.order_index}</TableCell>
                  <TableCell className="font-medium">{rank.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(rank)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(rank.id)}>
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

      <Dialog open={showRankForm} onOpenChange={setShowRankForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRank ? "Edit Rank" : "Create New Rank"}</DialogTitle>
            <DialogDescription>
              {editingRank ? "Update rank information" : "Add a new military rank to the system"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rank Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter rank name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index">Order Index</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) })}
                placeholder="Enter order index"
                min="1"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRankForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingRank ? "Update Rank" : "Create Rank"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
