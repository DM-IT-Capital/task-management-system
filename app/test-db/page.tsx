import { DatabaseTest } from "@/components/database-test"

export default function TestDatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Database Connection Test</h1>
          <p className="text-gray-600 mt-2">Test your Supabase database connection and setup</p>
        </div>
        <DatabaseTest />
      </div>
    </div>
  )
}
