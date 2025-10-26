"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Calendar, Trash2, ChevronDown, ChevronRight, Edit2, X, Check, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface MenuOpcion {
  id: number
  fecha: string
  dia_semana: string
  numero_dia: number
  codigo_opcion: number
  descripcion_opcion: string
  categoria: string
  tipo_minuta: number
}

interface DiaResumen {
  fecha: string
  dia_semana: string
  numero_dia: number
  opciones: MenuOpcion[]
}

interface MinutaResumen {
  mes: string
  año: number
  tipo_minuta: number
  count: number
  fecha_inicio: string
  fecha_fin: string
  expanded: boolean
  dias?: DiaResumen[]
}

interface MinutasExistentesProps {
  refreshTrigger: number
}

export function MinutasExistentes({ refreshTrigger }: MinutasExistentesProps) {
  const [minutas, setMinutas] = useState<MinutaResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newOpcion, setNewOpcion] = useState({
    fecha: "",
    categoria: "MENU",
    descripcion: "",
    tipo_minuta: 1,
  })

  useEffect(() => {
    loadMinutas()
  }, [refreshTrigger])

  const loadMinutas = async () => {
    try {
      const { data, error } = await supabase
        .from("menus")
        .select("fecha, tipo_minuta")
        .order("fecha", { ascending: false })

      if (error) throw error

      const grouped = data.reduce(
        (acc, menu) => {
          const date = new Date(menu.fecha)
          const mes = date.toLocaleString("es-ES", { month: "long" })
          const año = date.getFullYear()
          const key = `${mes}-${año}-${menu.tipo_minuta}`

          if (!acc[key]) {
            acc[key] = {
              mes,
              año,
              tipo_minuta: menu.tipo_minuta,
              count: 0,
              fecha_inicio: menu.fecha,
              fecha_fin: menu.fecha,
              expanded: false,
            }
          }

          acc[key].count++
          if (menu.fecha < acc[key].fecha_inicio) acc[key].fecha_inicio = menu.fecha
          if (menu.fecha > acc[key].fecha_fin) acc[key].fecha_fin = menu.fecha

          return acc
        },
        {} as Record<string, MinutaResumen>,
      )

      setMinutas(Object.values(grouped))
    } catch (err) {
      console.error("Error loading minutas:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadDias = async (minuta: MinutaResumen) => {
    try {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .gte("fecha", minuta.fecha_inicio)
        .lte("fecha", minuta.fecha_fin)
        .eq("tipo_minuta", minuta.tipo_minuta)
        .order("fecha", { ascending: true })
        .order("codigo_opcion", { ascending: true })

      if (error) throw error

      const diasMap = data.reduce(
        (acc, menu) => {
          if (!acc[menu.fecha]) {
            acc[menu.fecha] = {
              fecha: menu.fecha,
              dia_semana: menu.dia_semana,
              numero_dia: menu.numero_dia,
              opciones: [],
            }
          }
          acc[menu.fecha].opciones.push(menu)
          return acc
        },
        {} as Record<string, DiaResumen>,
      )

      return Object.values(diasMap)
    } catch (err) {
      console.error("Error loading dias:", err)
      return []
    }
  }

  const toggleMinuta = async (index: number) => {
    const newMinutas = [...minutas]
    const minuta = newMinutas[index]

    if (!minuta.expanded && !minuta.dias) {
      minuta.dias = await loadDias(minuta)
    }

    minuta.expanded = !minuta.expanded
    setMinutas(newMinutas)
  }

  const startEdit = (opcion: MenuOpcion) => {
    setEditingId(opcion.id)
    setEditValue(opcion.descripcion_opcion)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue("")
  }

  const saveEdit = async (opcionId: number) => {
    if (!editValue.trim()) {
      alert("La descripción no puede estar vacía")
      return
    }

    try {
      const { error } = await supabase.from("menus").update({ descripcion_opcion: editValue.trim() }).eq("id", opcionId)

      if (error) throw error

      setMinutas((prev) =>
        prev.map((minuta) => ({
          ...minuta,
          dias: minuta.dias?.map((dia) => ({
            ...dia,
            opciones: dia.opciones.map((op) =>
              op.id === opcionId ? { ...op, descripcion_opcion: editValue.trim() } : op,
            ),
          })),
        })),
      )

      setEditingId(null)
      setEditValue("")
    } catch (err) {
      console.error("Error updating opcion:", err)
      alert("Error al actualizar la opción")
    }
  }

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      MENU: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ESPECIAL: "bg-blue-100 text-blue-800 border-blue-200",
      "PROTEINA ENSALADA": "bg-green-100 text-green-800 border-green-200",
      HIPO: "bg-amber-100 text-amber-800 border-amber-200",
      "COLACION ESPECIAL": "bg-pink-100 text-pink-800 border-pink-200",
      "DIETA BLANDA": "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[categoria] || "bg-slate-100 text-slate-800 border-slate-200"
  }

  const handleDelete = async (minuta: MinutaResumen) => {
    if (
      !confirm(
        `¿Eliminar minuta de ${minuta.mes} ${minuta.año} (Tipo ${minuta.tipo_minuta})? Se eliminarán ${minuta.count} registros.`,
      )
    ) {
      return
    }

    try {
      const { error } = await supabase
        .from("menus")
        .delete()
        .gte("fecha", minuta.fecha_inicio)
        .lte("fecha", minuta.fecha_fin)
        .eq("tipo_minuta", minuta.tipo_minuta)

      if (error) throw error

      alert("Minuta eliminada exitosamente")
      loadMinutas()
    } catch (err) {
      console.error("Error deleting minuta:", err)
      alert("Error al eliminar la minuta")
    }
  }

  const getDiaSemana = (fecha: string) => {
    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
    const date = new Date(fecha + "T00:00:00")
    return dias[date.getDay()]
  }

  const handleAddManual = async () => {
    if (!newOpcion.fecha || !newOpcion.descripcion.trim()) {
      alert("Por favor completa todos los campos")
      return
    }

    try {
      const date = new Date(newOpcion.fecha + "T00:00:00")
      const dia_semana = getDiaSemana(newOpcion.fecha)
      const numero_dia = date.getDate()

      const codigoMap: Record<string, number> = {
        MENU: 1,
        ESPECIAL: 2,
        "PROTEINA ENSALADA": 3,
        HIPO: 4,
        "COLACION ESPECIAL": 5,
        "DIETA BLANDA": 6,
      }

      console.log("[v0] Intentando INSERT manual:", {
        fecha: newOpcion.fecha,
        dia_semana,
        numero_dia,
        codigo_opcion: codigoMap[newOpcion.categoria],
        descripcion_opcion: newOpcion.descripcion.trim(),
        categoria: newOpcion.categoria,
        tipo_minuta: newOpcion.tipo_minuta,
      })

      const { error } = await supabase.from("menus").insert({
        fecha: newOpcion.fecha,
        dia_semana,
        numero_dia,
        codigo_opcion: codigoMap[newOpcion.categoria],
        descripcion_opcion: newOpcion.descripcion.trim(),
        categoria: newOpcion.categoria,
        tipo_minuta: newOpcion.tipo_minuta,
      })

      if (error) throw error

      console.log("[v0] INSERT exitoso")
      alert("Opción agregada exitosamente")
      setShowAddModal(false)
      setNewOpcion({ fecha: "", categoria: "MENU", descripcion: "", tipo_minuta: 1 })
      loadMinutas()
    } catch (err) {
      console.error("[v0] Error en INSERT manual:", err)
      alert(`Error al agregar la opción: ${err instanceof Error ? err.message : "Error desconocido"}`)
    }
  }

  if (loading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-900">Minutas Existentes</CardTitle>
          <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1" />
            Agregar Manual
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Agregar Opción Manual</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newOpcion.fecha}
                    onChange={(e) => setNewOpcion({ ...newOpcion, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  {newOpcion.fecha && (
                    <p className="text-xs text-slate-600 mt-1">
                      Día:{" "}
                      {getDiaSemana(newOpcion.fecha).charAt(0).toUpperCase() + getDiaSemana(newOpcion.fecha).slice(1)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select
                    value={newOpcion.categoria}
                    onChange={(e) => setNewOpcion({ ...newOpcion, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="MENU">MENU</option>
                    <option value="ESPECIAL">ESPECIAL</option>
                    <option value="PROTEINA ENSALADA">PROTEINA ENSALADA</option>
                    <option value="HIPO">HIPO</option>
                    <option value="COLACION ESPECIAL">COLACION ESPECIAL</option>
                    <option value="DIETA BLANDA">DIETA BLANDA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea
                    value={newOpcion.descripcion}
                    onChange={(e) => setNewOpcion({ ...newOpcion, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    rows={3}
                    placeholder="Ej: Pescado frito con puré"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Minuta</label>
                  <select
                    value={newOpcion.tipo_minuta}
                    onChange={(e) => setNewOpcion({ ...newOpcion, tipo_minuta: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value={1}>Tipo 1</option>
                    <option value={2}>Tipo 2</option>
                    <option value={3}>Tipo 3</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200">
                <Button onClick={() => setShowAddModal(false)} variant="outline" size="sm">
                  Cancelar
                </Button>
                <Button onClick={handleAddManual} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}

        {minutas.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No hay minutas cargadas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {minutas.map((minuta, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                  <button onClick={() => toggleMinuta(idx)} className="flex items-center gap-3 flex-1 text-left">
                    {minuta.expanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    )}
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {minuta.mes.charAt(0).toUpperCase() + minuta.mes.slice(1)} {minuta.año}
                      </p>
                      <p className="text-xs text-slate-600">
                        Tipo {minuta.tipo_minuta} • {minuta.count} registros
                      </p>
                    </div>
                  </button>
                  <Button onClick={() => handleDelete(minuta)} variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {minuta.expanded && minuta.dias && (
                  <div className="bg-slate-50 border-t border-slate-200 p-3 space-y-2">
                    {minuta.dias.map((dia, diaIdx) => (
                      <div key={diaIdx} className="bg-white border border-slate-200 rounded-lg p-3">
                        <p className="font-semibold text-sm text-slate-900 mb-2">
                          {dia.dia_semana.charAt(0).toUpperCase() + dia.dia_semana.slice(1)} {dia.numero_dia} -{" "}
                          {dia.opciones.length} opciones
                        </p>
                        <div className="space-y-1.5">
                          {dia.opciones.map((opcion) => (
                            <div
                              key={opcion.id}
                              className={`flex items-center justify-between p-2 rounded border ${getCategoryColor(opcion.categoria)}`}
                            >
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold">{opcion.categoria}</span>
                                {editingId === opcion.id ? (
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full mt-1 px-2 py-1 text-sm border border-slate-300 rounded"
                                    autoFocus
                                  />
                                ) : (
                                  <p className="text-sm mt-0.5">{opcion.descripcion_opcion}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                {editingId === opcion.id ? (
                                  <>
                                    <Button
                                      onClick={() => saveEdit(opcion.id)}
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                    >
                                      <Check className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button onClick={cancelEdit} size="sm" variant="ghost" className="h-7 w-7 p-0">
                                      <X className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    onClick={() => startEdit(opcion)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
