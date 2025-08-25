export const dynamic = "force-dynamic"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function HomePage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")

  if (userCookie) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }

  // The rest of the code remains the same as it will not be executed due to the redirects above
}
