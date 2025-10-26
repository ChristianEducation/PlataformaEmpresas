"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Check, X, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Menu } from "@/types/database"

interface PreviewMinutaProps {
  data: Menu[]
  onInsertComplete: () => void
  onCancel: () => void
}

export function PreviewMinuta({ data, onInsertComplete, onCancel }: PreviewMinutaProps) {
  const [inserting, setInserting] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    setInserting(true)
    setError("")

    try {
      const { error: insertError } = await supabase.from("menus").insert(data)

      if (insertError) throw insertError

      alert(`Se insertaron ${data.length} registros exitosamente`)
      onInsertComplete()
    } catch (err) {
      console.error("Error inserting menus:", err)
      setError(err instanceof Error ? err.message : "Error al insertar los datos")
    } finally {
      setInserting(false)
    }
  }

  const firstDate = data[0]?.fecha
  const lastDate = data[data.length - 1]?.fecha
  const tipoMinuta = data[0]?.tipo_minuta

  const categoryCounts = data.reduce(
    (acc, menu) => {
      acc[menu.categoria] = (acc[menu.categoria] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card className="border border-amber-200 bg-amber-50">
      <CardHeader className="bg-amber-100 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <div>
            <CardTitle className="text-lg text-slate-900">Preview de Datos</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Revisa los datos antes de confirmar la inserción</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Total Registros</p>
              <p className="text-2xl font-bold text-indigo-600">{data.length}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Período</p>
              <p className="text-sm font-semibold text-slate-900">
                {firstDate} a {lastDate}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Tipo Minuta</p>
              <p className="text-2xl font-bold text-indigo-600">{tipoMinuta}</p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-2">Registros por Categoría</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(categoryCounts).map(([categoria, count]) => (
                <div key={categoria} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{categoria}</span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">Fecha</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">Día</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">Categoría</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">Descripción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.slice(0, 10).map((menu, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-900">{menu.fecha}</td>
                    <td className="px-3 py-2 text-slate-600">{menu.dia_semana}</td>
                    <td className="px-3 py-2 text-slate-600">{menu.categoria}</td>
                    <td className="px-3 py-2 text-slate-900">{menu.descripcion_opcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <div className="p-2 bg-slate-50 text-center text-xs text-slate-600 border-t border-slate-200">
                Mostrando 10 de {data.length} registros
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleConfirm} disabled={inserting} className="flex-1">
              {inserting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Insertando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar e Insertar
                </>
              )}
            </Button>
            <Button onClick={onCancel} variant="outline" disabled={inserting} className="flex-1 bg-transparent">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
