"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function VerifyLoginPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        // Get login attempt from cookie
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          credentials: "include",
        })

        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage("Login successful! Redirecting to dashboard...")

          // Store user data in localStorage
          localStorage.setItem("user", JSON.stringify(data.user))

          // Redirect after a short delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        } else {
          setStatus("error")
          setMessage(data.error || "Login failed")
        }
      } catch (error) {
        console.error("Verification error:", error)
        setStatus("error")
        setMessage("An error occurred during verification")
      }
    }

    verifyLogin()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
            Verifying Login
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your credentials..."}
            {status === "success" && "Login successful!"}
            {status === "error" && "Login verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={status === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <AlertDescription className={status === "error" ? "text-red-800" : "text-green-800"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Button onClick={() => router.push("/login")} className="w-full" variant="outline">
              Back to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
