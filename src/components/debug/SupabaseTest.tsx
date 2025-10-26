'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { getAllUsers, testSupabaseConnection, generatePassword } from '@/lib/auth'
import { Trabajador } from '@/types/database'

interface DebugInfo {
  status?: number
  statusText?: string
  error?: Error | string | null
  dataLength?: number
  url?: string
  sampleFields?: string[]
  expectedFields?: string[]
  rlsTest?: 'passed' | 'failed'
  sampleData?: Partial<Trabajador>[]
}

export default function SupabaseTest() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('')
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError('')
    setConnectionStatus('Probando conexión...')
    setDebugInfo(null)

    try {
      // Test basic connection
      const isConnected = await testSupabaseConnection()
      if (!isConnected) {
        throw new Error('No se pudo conectar con Supabase')
      }
      setConnectionStatus('✅ Conexión exitosa')

      // Test fetching trabajadores
      const trabajadoresList = await getAllUsers()
      setTrabajadores(trabajadoresList)
      setConnectionStatus(`✅ Conexión exitosa - ${trabajadoresList.length} trabajadores encontrados`)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      setConnectionStatus('❌ Error de conexión')
      setDebugInfo({ error: err instanceof Error ? err.message : String(err) })
    } finally {
      setLoading(false)
    }
  }

  const testDirectQuery = async () => {
    setLoading(true)
    setError('')
    setDebugInfo(null)

    try {
      console.log('Testing direct query to trabajadores table...')
      
      const { data, error, status, statusText } = await supabase
        .from('trabajadores')
        .select('*')
        .limit(10)

      console.log('Query result:', { data, error, status, statusText })

      setDebugInfo({
        status,
        statusText,
        error,
        dataLength: data?.length || 0,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/trabajadores`,
        sampleFields: data?.[0] ? Object.keys(data[0]) : [],
        expectedFields: ['id', 'empresa_id', 'nombre_completo', 'rut', 'turno_habitual', 'activo', 'created_at', 'contraseña', 'rol']
      })

      if (error) {
        throw new Error(`Error ${status}: ${error.message || statusText}`)
      }

      setTrabajadores(data || [])
      setConnectionStatus(`✅ Query directo exitoso - ${data?.length || 0} trabajadores`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      setConnectionStatus('❌ Error en query directo')
      console.error('Direct query error:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkRLSPolicies = async () => {
    setLoading(true)
    setError('')
    setConnectionStatus('Verificando políticas RLS...')

    try {
      // Test SELECT permission
      const { data, error } = await supabase
        .from('trabajadores')
        .select('id, nombre_completo, activo')
        .limit(1)

      if (error) {
        if (error.code === '42501') {
          throw new Error('Sin permisos para leer la tabla. Configura las políticas RLS.')
        } else {
          throw new Error(`Error RLS: ${error.message}`)
        }
      }

      setConnectionStatus('✅ Políticas RLS configuradas correctamente')
      setDebugInfo({ rlsTest: 'passed', sampleData: data })

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
      setConnectionStatus('❌ Error en políticas RLS')
      setDebugInfo({ rlsTest: 'failed', error: err instanceof Error ? err : String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-6xl mx-auto m-8">
      <CardHeader>
        <CardTitle>🔍 Diagnóstico - Tabla Trabajadores (Estructura Real)</CardTitle>
        <p className="text-sm text-gray-600">
          Columnas detectadas: id, empresa_id, nombre_completo, rut, turno_habitual, activo, created_at, contraseña, rol
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Botones de diagnóstico */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button onClick={testConnection} disabled={loading} variant="default">
            🔌 Probar Conexión
          </Button>
          <Button onClick={testDirectQuery} disabled={loading} variant="outline">
            📊 Query Directo
          </Button>
          <Button onClick={checkRLSPolicies} disabled={loading} variant="secondary">
            🔒 Verificar RLS
          </Button>
        </div>

        {/* Estado de conexión */}
        {connectionStatus && (
          <div className={`p-4 rounded-lg ${
            connectionStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <p className="font-medium">{connectionStatus}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Información de debug */}
        {debugInfo && (
          <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <p className="font-medium mb-2">🔍 Información de Debug:</p>
            <pre className="text-xs overflow-auto bg-white p-2 rounded border max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Trabajadores encontrados */}
        {trabajadores.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">👥 Trabajadores Encontrados ({trabajadores.length}):</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trabajadores.map((trabajador) => (
                <div key={trabajador.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p><strong>Nombre:</strong> {trabajador.nombre_completo}</p>
                  <p><strong>RUT:</strong> {trabajador.rut}</p>
                  <p><strong>Turno:</strong> {trabajador.turno_habitual || 'No especificado'}</p>
                  <p><strong>Rol:</strong> {trabajador.rol || 'No especificado'}</p>
                  <p><strong>Empresa ID:</strong> {trabajador.empresa_id || 'N/A'}</p>
                  <p><strong>Contraseña generada:</strong> <span className="font-mono font-bold text-green-700">{generatePassword(trabajador.nombre_completo)}</span></p>
                  <p><strong>Contraseña BD:</strong> <span className="font-mono text-gray-600">{trabajador.contraseña || 'No definida'}</span></p>
                  <p><strong>ID:</strong> {trabajador.id}</p>
                  <p><strong>Activo:</strong> {trabajador.activo ? '✅ Sí' : '❌ No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Script SQL de solución */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium mb-2">📝 Script SQL para configurar RLS:</h3>
          <div className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
            <code>
              {`-- Habilitar RLS en la tabla trabajadores
ALTER TABLE public.trabajadores ENABLE ROW LEVEL SECURITY;

-- Crear política que permita todas las operaciones
CREATE POLICY "Allow all operations for trabajadores" ON public.trabajadores
  FOR ALL USING (true) WITH CHECK (true);

-- Verificar datos
SELECT 'Total trabajadores:' as info, count(*) as total FROM public.trabajadores;
SELECT 'Trabajadores activos:' as info, count(*) as total FROM public.trabajadores WHERE activo = true;

-- Mostrar estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trabajadores' AND table_schema = 'public'
ORDER BY ordinal_position;`}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
