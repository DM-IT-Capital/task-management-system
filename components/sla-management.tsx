"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Settings } from "lucide-react"
import { getSLASettings, updateSLASettings } from "@/lib/supabase"
import { toast } from "sonner"

interface SLASetting {
  id: string
  priority: string
  response_hours: number
  reminder_intervals: string
  escalation_enabled: boolean
}

export function SLAManagement() {
  const [slaSettings, setSlaSettings] = useState<SLASetting[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSLASettings()
  }, [])

  const loadSLASettings = async () => {
    try {
      const data = await getSLASettings()
      setSlaSettings(data)
    } catch (error) {
      console.error("Error loading SLA settings:", error)
      toast.error("Failed to load SLA settings")
    }
  }

  const handleUpdate = async (setting: SLASetting, field: string, value: any) => {
    try {
      setLoading(true)
      const updatedSetting = { ...setting, [field]: value }
      await updateSLASettings(updatedSetting)
      toast.success("SLA setting updated successfully!")
      loadSLASettings()
    } catch (error) {
      console.error("Error updating SLA setting:", error)
      toast.error("Failed to update SLA setting")
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">SLA Management</h3>
        <p className="text-sm text-gray-600">
          Configure Service Level Agreement settings for different priority levels
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Settings
          </CardTitle>
          <CardDescription>Configure response times and escalation rules for different priority levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Response Time (Hours)</TableHead>
                <TableHead>Reminder Intervals</TableHead>
                <TableHead>Escalation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slaSettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <Badge className={getPriorityColor(setting.priority)}>{setting.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={setting.response_hours}
                      onChange={(e) => handleUpdate(setting, "response_hours", Number.parseInt(e.target.value))}
                      className="w-20"
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={setting.reminder_intervals}
                      onChange={(e) => handleUpdate(setting, "reminder_intervals", e.target.value)}
                      placeholder="1,2,4"
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={setting.escalation_enabled}
                      onCheckedChange={(checked) => handleUpdate(setting, "escalation_enabled", checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" disabled={loading}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SLA Configuration Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Response Time:</strong> Maximum hours allowed before a task must be acknowledged or completed.
          </p>
          <p>
            <strong>Reminder Intervals:</strong> Comma-separated hours when reminders should be sent (e.g., "1,2,4"
            sends reminders after 1, 2, and 4 hours).
          </p>
          <p>
            <strong>Escalation:</strong> Whether to automatically escalate overdue tasks to higher authorities.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
