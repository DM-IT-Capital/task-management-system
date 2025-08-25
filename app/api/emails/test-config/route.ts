import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    hasResendKey: !!process.env.RESEND_API_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json({
    message: "Email configuration check",
    config,
    recommendations: {
      resend: config.hasResendKey
        ? "✅ Resend API key is configured"
        : "⚠️ Add RESEND_API_KEY environment variable to enable real email sending",
      appUrl: config.appUrl.includes("localhost")
        ? "⚠️ Using localhost URL - update NEXT_PUBLIC_APP_URL for production"
        : "✅ App URL is configured",
    },
  })
}
