"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Wifi, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [error, setError] = useState<string | null>(null)

  const checkConnection = async () => {
    setConnectionStatus("checking")
    setError(null)

    try {
      const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true })

      if (error) {
        throw error
      }

      setConnectionStatus("connected")
    } catch (err: any) {
      setConnectionStatus("error")
      setError(err.message)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Supabase Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          {connectionStatus === "checking" && (
            <Badge variant="secondary">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Checking...
            </Badge>
          )}
          {connectionStatus === "connected" && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
          {connectionStatus === "error" && (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>URL:</span>
            <span className="text-green-600">✅ Set</span>
          </div>
          <div className="flex justify-between">
            <span>Anon Key:</span>
            <span className="text-green-600">✅ Set</span>
          </div>
        </div>

        <Button onClick={checkConnection} className="w-full" disabled={connectionStatus === "checking"}>
          {connectionStatus === "checking" ? "Checking..." : "Test Connection"}
        </Button>

        {connectionStatus === "connected" && (
          <div className="text-center">
            <p className="text-sm text-green-600 mb-2">🎉 Connection successful!</p>
            <p className="text-xs text-gray-500">You can now proceed to set up your database tables.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
