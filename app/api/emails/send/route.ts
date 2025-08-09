import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: Request) {
  try {
    const { to, subject, html } = (await request.json()) as { to: string; subject: string; html: string }

    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: "Missing to/subject/html" }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // Dry-run: log instead of sending
      console.log("DRY-RUN Email send -> To:", to, "Subject:", subject)
      return NextResponse.json({ success: true, dryRun: true })
    }

    const resend = new Resend(apiKey)
    const from = process.env.RESEND_FROM || "Task Tracker <no-reply@your-domain.com>"

    const { error } = await resend.emails.send({ from, to, subject, html })
    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Email route error:", err)
    return NextResponse.json({ success: false, error: err?.message || "Unknown error" }, { status: 500 })
  }
}
