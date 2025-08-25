import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { LoginForm } from "@/components/login-form"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  // Check if user is already logged in
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")

  if (userCookie) {
    console.log("User already logged in, redirecting to dashboard")
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">TaskForce</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Military Task Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
