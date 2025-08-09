"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendEmail } from "@/lib/email"

export default function TestEmailPage() {
  const [to, setTo] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const onSend = async () => {
    setStatus("Sending...")
    const { success, error } = await sendEmail({
      to,
      subject: "Test email from Task Management System",
      html: "<p>If you received this, email notifications are working!</p>",
    })
    setStatus(success ? "Success! Check your inbox." : `Failed: ${error}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button onClick={onSend} disabled={!to}>
              Send Test Email
            </Button>
            {status && <p className="text-sm text-gray-600">{status}</p>}
            <p className="text-xs text-gray-500">
              Tip: Set RESEND_API_KEY and RESEND_FROM in your Vercel environment to send real emails. Without it, this
              endpoint runs in "dry run" and logs instead of sending.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
