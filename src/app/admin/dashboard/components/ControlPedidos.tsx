"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Settings, Lock, Unlock, Calendar, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Configuracion {
  id: number
  hora_bloqueo: string | null
  pedidos_activos: boolean
}

export function ControlPedidos() {
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [nuevaHora, setNuevaHora] = useState("")

  useEffect(() => {
    fetchConfig()
  }, [])

  useEffect(() => {
    if (config?.hora_bloqueo) {
      const fechaUtc = new Date(config.hora_bloqueo)

      // Usar toLocaleString para obtener la fecha en timezone Chile
      const fechaChileStr = fechaUtc.toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      // Parsear el string "DD/MM/YYYY, HH:MM" a formato input
      const [datePart, timePart] = fechaChileStr.split(", ")
      const [day, month, year] = datePart.split("/")
      const fechaStr = `${year}-${month}-${day}`
      const horaStr = timePart

      setNuevaFecha(fechaStr)
      setNuevaHora(horaStr)
    }
  }, [config])

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase.from("configuracion").select("*").eq("id", 1).single()

      if (error) throw error
      setConfig(data)
    } catch (error) {
      console.error("Error fetching config:", error)
    } finally {
      setLoading(false)
    }
  }

  const togglePedidos = async () => {
    if (!config) return

    const newValue = !config.pedidos_activos

    if (!newValue) {
      if (
        !confirm(
          "¿Estás seguro de que deseas BLOQUEAR los pedidos? Los trabajadores no podrán realizar nuevos pedidos.",
        )
      ) {
        return
      }
    }

    setUpdating(true)
    try {
      const { error } = await supabase.from("configuracion").update({ pedidos_activos: newValue }).eq("id", 1)

      if (error) throw error

      setConfig({ ...config, pedidos_activos: newValue })
    } catch (error) {
      console.error("Error updating config:", error)
      alert("Error al actualizar la configuración")
    } finally {
      setUpdating(false)
    }
  }

  const actualizarFechaBloqueo = async () => {
    if (!config || !nuevaFecha || !nuevaHora) {
      alert("Por favor ingresa una fecha y hora válidas")
      return
    }

    const fechaChileStr = `${nuevaFecha}T${nuevaHora}:00-03:00`
    const fechaDate = new Date(fechaChileStr)

    // Validar que la fecha sea futura
    const ahora = new Date()
    if (fechaDate <= ahora) {
      alert("La fecha de bloqueo debe ser futura")
      return
    }

    // Mostrar confirmación con la fecha en hora Chile
    const fechaDisplay = fechaDate.toLocaleString("es-CL", {
      timeZone: "America/Santiago",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    if (!confirm(`¿Estás seguro de que deseas cambiar la fecha de bloqueo a ${fechaDisplay} (hora de Chile)?`)) {
      return
    }

    setUpdating(true)
    try {
      const fechaUTC = fechaDate.toISOString()

      const { error } = await supabase.from("configuracion").update({ hora_bloqueo: fechaUTC }).eq("id", 1)

      if (error) throw error

      setConfig({ ...config, hora_bloqueo: fechaUTC })
      alert("✅ Fecha de bloqueo actualizada correctamente")
    } catch (error) {
      console.error("Error updating fecha bloqueo:", error)
      alert("Error al actualizar la fecha de bloqueo")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const pedidosActivos = config?.pedidos_activos ?? true
  const horaBloqueo = config?.hora_bloqueo ? new Date(config.hora_bloqueo) : null

  return (
    <Card className="border border-slate-200">
      <CardHeader className="border-b border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Settings className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <CardTitle className="text-sm text-slate-900">Control de Pedidos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-3">
          {/* Columna 1: Override Manual */}
          <div className="space-y-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Override Manual</h3>
              <p className="text-xs text-slate-500">Casos extraordinarios</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                {pedidosActivos ? (
                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Unlock className="w-3.5 h-3.5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-slate-900">
                    {pedidosActivos ? "Pedidos Habilitados" : "Pedidos Bloqueados"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {pedidosActivos ? "Trabajadores pueden pedir" : "Pedidos deshabilitados"}
                  </p>
                </div>
              </div>

              <Button
                onClick={togglePedidos}
                disabled={updating}
                size="sm"
                className={
                  pedidosActivos
                    ? "w-full bg-red-500 hover:bg-red-600 text-white text-xs"
                    : "w-full bg-green-500 hover:bg-green-600 text-white text-xs"
                }
              >
                {updating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Actualizando...
                  </>
                ) : pedidosActivos ? (
                  <>
                    <Lock className="w-3 h-3 mr-1.5" />
                    Bloquear
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 mr-1.5" />
                    Habilitar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Columna 2: Programación Mensual */}
          <div className="space-y-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Programación Mensual</h3>
              <p className="text-xs text-slate-500">Actualiza día 10 para bloqueo día 25</p>
            </div>

            {horaBloqueo && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-900">Bloqueo programado:</p>
                  <p className="text-xs text-amber-700">
                    {horaBloqueo.toLocaleString("es-CL", {
                      timeZone: "America/Santiago",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Nueva fecha (hora Chile):</label>
              <div className="flex gap-1.5">
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <Button
                onClick={actualizarFechaBloqueo}
                disabled={updating || !nuevaFecha || !nuevaHora}
                size="sm"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-3 h-3 mr-1.5" />
                    Actualizar
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
              <p className="text-xs text-blue-800 leading-tight">
                <strong>Nota:</strong> Override manual tiene prioridad sobre fecha programada.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
