import { SetupInstructions } from "@/components/setup-instructions"
import { ConnectionStatus } from "@/components/connection-status"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Task Management System</h1>
          <p className="text-gray-600">Configure your Supabase connection and database</p>
        </div>

        <div className="mb-8 flex justify-center">
          <ConnectionStatus />
        </div>

        <SetupInstructions />
      </div>
    </div>
  )
}
