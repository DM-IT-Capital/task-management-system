import { requireAuth } from "@/lib/auth"
import { DashboardContent } from "@/components/dashboard-content"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await requireAuth()

  return <DashboardContent user={user} />
}
