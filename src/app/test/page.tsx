import SupabaseTest from '@/components/debug/SupabaseTest'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Prueba de Conexión Supabase
        </h1>
        <SupabaseTest />
      </div>
    </div>
  )
}
