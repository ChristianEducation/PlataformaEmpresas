"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import type { Pedido, Shift, Menu } from "@/types/database"
import { X, Save, Trash2, Loader2, ChefHat, Calendar, Clock, FileText, Lock, AlertTriangle } from "lucide-react"

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  selectedShift: Shift
  existingOrder?: Pedido | null
  onOrderSaved: () => void
  availableMenus: Menu[]
}

interface ConfiguracionBloqueo {
  id: number
  hora_bloqueo: string | null
  pedidos_activos?: boolean
}

export default function OrderModal({
  isOpen,
  onClose,
  selectedDate,
  selectedShift,
  existingOrder,
  onOrderSaved,
  availableMenus,
}: OrderModalProps) {
  const { user, profile } = useAuth()
  const [selectedMenuId, setSelectedMenuId] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estados para el bloqueo de pedidos
  const [bloqueado, setBloqueado] = useState(false)
  const [loadingBloqueo, setLoadingBloqueo] = useState(true)
  const [configuracionBloqueo, setConfiguracionBloqueo] = useState<ConfiguracionBloqueo | null>(null)

  useEffect(() => {
    if (existingOrder) {
      // Buscar el menú correspondiente al pedido existente
      const matchingMenu = availableMenus.find((menu) => menu.descripcion_opcion === existingOrder.descripcion_opcion)
      setSelectedMenuId(matchingMenu?.id.toString() || "")
      setNotes(existingOrder.notas || "")
    } else {
      setSelectedMenuId("")
      setNotes("")
    }
    setError("")
  }, [existingOrder, isOpen, availableMenus])

  // Verificar bloqueo al abrir el modal
  useEffect(() => {
    if (isOpen) {
      verificarBloqueo()
    }
  }, [isOpen])

  const verificarBloqueo = async () => {
    setLoadingBloqueo(true)
    try {
      const { data, error } = await supabase.from("configuracion").select("*").eq("id", 1).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching configuración:", error)
        setBloqueado(false)
        setLoadingBloqueo(false)
        return
      }

      if (data) {
        setConfiguracionBloqueo(data)

        // Si pedidos_activos es false, bloquear inmediatamente
        if (data.pedidos_activos === false) {
          setBloqueado(true)
          setLoadingBloqueo(false)
          return
        }

        if (data.hora_bloqueo) {
          const ahora = new Date()
          const horaBloqueo = new Date(data.hora_bloqueo)

          // Si la hora actual es igual o posterior a la hora de bloqueo
          if (ahora >= horaBloqueo) {
            setBloqueado(true)
          } else {
            setBloqueado(false)
          }
        } else {
          setBloqueado(false)
        }
      } else {
        setBloqueado(false)
      }
    } catch (error) {
      console.error("Error verificando bloqueo:", error)
      setBloqueado(false)
    } finally {
      setLoadingBloqueo(false)
    }
  }

  // Function to map shift names to the expected database values
  const mapShiftToTurno = (shiftName: string): string => {
    const name = shiftName.toLowerCase()
    if (name.includes("día") || name.includes("dia") || name.includes("day")) {
      return "dia"
    } else if (name.includes("noche") || name.includes("night")) {
      return "noche"
    }
    // Default fallback based on time
    const startTime = selectedShift.start_time
    if (
      startTime.includes("06:") ||
      startTime.includes("6:") ||
      startTime.includes("07:") ||
      startTime.includes("7:")
    ) {
      return "dia"
    } else {
      return "noche"
    }
  }

  const handleSave = async () => {
    if (!user || !profile || !selectedMenuId.trim()) {
      setError("Por favor selecciona un plato del menú")
      return
    }

    const selectedMenu = availableMenus.find((menu) => menu.id.toString() === selectedMenuId)
    if (!selectedMenu) {
      setError("Menú seleccionado no válido")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Get day name in Spanish
      const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
      const dayName = dayNames[selectedDate.getDay()]

      // Map shift name to expected database value
      const turnoElegido = mapShiftToTurno(selectedShift.name)

      const pedidoData = {
        nombre_trabajador: profile.nombre_completo,
        rut_trabajador: profile.rut || null, // RUT no es obligatorio
        turno_elegido: turnoElegido,
        fecha_entrega: selectedDate.toISOString().split("T")[0],
        dia_semana: dayName,
        numero_dia: selectedDate.getDate(),
        codigo_opcion: selectedMenu.codigo_opcion,
        descripcion_opcion: selectedMenu.descripcion_opcion,
        categoria_opcion: selectedMenu.categoria,
        notas: notes.trim() || null,
        empresa: profile.empresa || "",
      }

      console.log("Saving pedido with data:", pedidoData) // Debug log

      if (existingOrder) {
        // Update existing order
        const { error } = await supabase
          .from("pedidos")
          .update({
            turno_elegido: pedidoData.turno_elegido,
            codigo_opcion: pedidoData.codigo_opcion,
            descripcion_opcion: pedidoData.descripcion_opcion,
            categoria_opcion: pedidoData.categoria_opcion,
            notas: pedidoData.notas,
          })
          .eq("id", existingOrder.id)

        if (error) throw error
      } else {
        // Create new order
        const { error } = await supabase.from("pedidos").insert([pedidoData])

        if (error) throw error
      }

      onOrderSaved()
      onClose()
    } catch (err: unknown) {
      console.error("Error saving order:", err)
      setError(err instanceof Error ? err.message : "Error al guardar el pedido")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingOrder) return

    if (!confirm("¿Estás seguro de que quieres eliminar este pedido?")) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.from("pedidos").delete().eq("id", existingOrder.id)

      if (error) throw error

      onOrderSaved()
      onClose()
    } catch (err: unknown) {
      console.error("Error deleting order:", err)
      setError(err instanceof Error ? err.message : "Error al eliminar el pedido")
    } finally {
      setLoading(false)
    }
  }

  const groupMenusByCategory = () => {
    const grouped: { [key: string]: Menu[] } = {}
    availableMenus.forEach((menu) => {
      if (!grouped[menu.categoria]) {
        grouped[menu.categoria] = []
      }
      grouped[menu.categoria].push(menu)
    })
    return grouped
  }

  if (!isOpen) return null

  const dateStr = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const groupedMenus = groupMenusByCategory()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {bloqueado ? <Lock className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  {bloqueado ? "Pedidos Bloqueados" : existingOrder ? "Editar Pedido" : "Nuevo Pedido de Almuerzo"}
                </CardTitle>
                <p className="text-indigo-100 text-sm">
                  {bloqueado
                    ? "La realización de pedidos está temporalmente bloqueada"
                    : "Selecciona tu almuerzo para el día elegido"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Date and Shift Info - Siempre visible */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Fecha</p>
                  <p className="font-semibold text-slate-900 capitalize">{dateStr}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Turno</p>
                  <p className="font-semibold text-slate-900">{selectedShift.name}</p>
                  <p className="text-xs text-slate-500">
                    {selectedShift.start_time} - {selectedShift.end_time}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading state para verificación de bloqueo */}
          {loadingBloqueo ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Verificando disponibilidad...</h3>
              <p className="text-slate-600">Comprobando si los pedidos están disponibles</p>
            </div>
          ) : bloqueado ? (
            /* Mensaje de bloqueo - Solo se muestra si está bloqueado */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-4">
                La realización de pedidos está actualmente bloqueada por el administrador.
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-red-900 mb-2">Información del bloqueo:</p>
                    <div className="text-sm text-red-800 space-y-1">
                      <p>• Los pedidos han sido bloqueados temporalmente</p>
                      <p>• No es posible realizar nuevos pedidos en este momento</p>
                      {configuracionBloqueo?.hora_bloqueo && (
                        <p>
                          • Bloqueo activo desde: {new Date(configuracionBloqueo.hora_bloqueo).toLocaleString("es-ES")}
                        </p>
                      )}
                      <p>• Contacta al administrador para más información</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white px-8">
                  Entendido
                </Button>
              </div>
            </div>
          ) : (
            /* Contenido normal del modal - Solo se muestra si NO está bloqueado */
            <>
              {availableMenus.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay menú disponible</h3>
                  <p className="text-slate-600 max-w-sm mx-auto">
                    No se ha configurado un menú para este día. Contacta al administrador para más información.
                  </p>
                </div>
              ) : (
                <>
                  {/* Menu Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <ChefHat className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-slate-900">Menú del Día</h3>
                    </div>

                    <div className="space-y-6">
                      {Object.entries(groupedMenus).map(([categoria, menus]) => (
                        <div key={categoria} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <h4 className="font-semibold text-slate-800 uppercase tracking-wide text-sm">
                              {categoria}
                            </h4>
                          </div>
                          <div className="grid gap-3">
                            {menus.map((menu) => (
                              <label
                                key={menu.id}
                                className={`
                                  group flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                                  ${
                                    selectedMenuId === menu.id.toString()
                                      ? "border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-500/20"
                                      : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-25 hover:shadow-sm"
                                  }
                                `}
                              >
                                <input
                                  type="radio"
                                  name="menu"
                                  value={menu.id}
                                  checked={selectedMenuId === menu.id.toString()}
                                  onChange={(e) => setSelectedMenuId(e.target.value)}
                                  className="sr-only"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-900 group-hover:text-indigo-900">
                                      {menu.descripcion_opcion}
                                    </span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium border border-slate-200">
                                      {menu.codigo_opcion}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className={`
                                  w-5 h-5 rounded-full border-2 ml-4 flex items-center justify-center transition-all duration-200
                                  ${
                                    selectedMenuId === menu.id.toString()
                                      ? "border-indigo-500 bg-indigo-500 scale-110"
                                      : "border-slate-300 group-hover:border-indigo-400"
                                  }
                                `}
                                >
                                  {selectedMenuId === menu.id.toString() && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <label htmlFor="notes" className="text-sm font-semibold text-slate-900">
                        Notas adicionales (opcional)
                      </label>
                    </div>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Sin cebolla, extra salsa, sin picante..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions - Solo se muestran si NO está bloqueado */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                {existingOrder && (
                  <Button
                    onClick={handleDelete}
                    disabled={loading}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Pedido
                  </Button>
                )}

                <div className="flex items-center space-x-3 ml-auto">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    disabled={loading || !selectedMenuId.trim() || availableMenus.length === 0}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    Cancelar
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={loading || !selectedMenuId.trim() || availableMenus.length === 0}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {existingOrder ? "Actualizando..." : "Guardando..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {existingOrder ? "Actualizar Pedido" : "Guardar Pedido"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
