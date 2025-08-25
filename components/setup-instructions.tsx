"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Database, Users, Settings } from "lucide-react"

export function SetupInstructions() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Setup Instructions
          </CardTitle>
          <CardDescription>Follow these steps to complete your TaskForce setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium">Database Connection</h3>
              <p className="text-sm text-gray-600">
                Configure your Supabase database connection and run initial migrations
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium">Create Tables</h3>
              <p className="text-sm text-gray-600">
                Run the SQL scripts to create users, tasks, ranks, and assignment tables
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-medium">Admin User</h3>
              <p className="text-sm text-gray-600">Initialize the default admin user account for system management</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ready for Setup
            </Badge>
            <span className="text-sm text-gray-500">Complete the steps above to activate</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
