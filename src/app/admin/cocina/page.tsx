"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ChefHat, ChevronDown, ChevronUp, Download, Info } from "lucide-react"
import { DateSelector } from "../components/DateSelector"
import { useCocinaData } from "./hooks/useCocinaData"
import { calculateResumenCocina } from "../utils/calculations"
import { exportCocinaWeek, exportCocinaDay } from "./utils/exportCocina"

type ViewMode = "day" | "week"

export default function CocinaPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })

  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const { pedidos, trabajadores, loading } = useCocinaData(selectedDate, viewMode)

  const resumenCocina = useMemo(() => {
    if (viewMode === "day") {
      return calculateResumenCocina(pedidos, trabajadores)
    }
    return { minuta1: [], minuta2: [], totalMinuta1: 0, totalMinuta2: 0, totalGeneral: 0 }
  }, [pedidos, trabajadores, viewMode])

  const weekDates = useMemo(() => {
    const [year, month, day] = selectedDate.split("-")
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    const dayOfWeek = date.getDay()
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(Number(year), Number(month) - 1, diff)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${day}`
    })
  }, [selectedDate])

  const resumenesPorDia = useMemo(() => {
    if (viewMode !== "week") return []

    return weekDates.map((date) => {
      const pedidosDelDia = pedidos.filter((p) => p.fecha_entrega === date)
      const resumen = calculateResumenCocina(pedidosDelDia, trabajadores)
      return {
        fecha: date,
        resumen,
      }
    })
  }, [weekDates, pedidos, trabajadores, viewMode])

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedItems(newExpanded)
  }

  const toggleDayExpand = (date: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDays(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-")
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatShortDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-")
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  const getTop3 = (opciones: any[]) => {
    return opciones
      .slice(0, 3)
      .map((o) => `${o.descripcion} (${o.cantidadTotal})`)
      .join(" • ")
  }

  const handleExportWeek = async () => {
    try {
      await exportCocinaWeek(weekDates, trabajadores)
    } catch (error) {
      console.error("Error exporting week:", error)
    }
  }

  const handleExportDay = async () => {
    try {
      await exportCocinaDay(selectedDate, trabajadores)
    } catch (error) {
      console.error("Error exporting day:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  const renderOpcion = (opcion: any, minutaKey: string) => {
    const key = `${minutaKey}-${opcion.descripcion}`
    const isExpanded = expandedItems.has(key)

    return (
      <div key={key} className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleExpand(key)}
          className="w-full px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
            )}
            <span className="font-semibold text-slate-900 text-left">{opcion.descripcion}</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
              {opcion.cantidadTotal}
            </span>
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Empresa</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {opcion.porEmpresa.map((empresa: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-900">{empresa.empresa}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">{empresa.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSimplifiedSummary = (minuta: any[]) => {
    if (minuta.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">No hay pedidos</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {minuta.map((opcion, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-slate-100"
          >
            <span className="text-sm text-slate-700">{opcion.descripcion}</span>
            <span className="font-semibold text-emerald-600">{opcion.cantidadTotal}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} pedidosCount={pedidos.length} />

      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChefHat className="w-6 h-6 text-emerald-600" />
                <div>
                  <CardTitle className="text-xl text-slate-900">Resumen Cocina</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    {viewMode === "day"
                      ? formatDate(selectedDate)
                      : `Semana del ${formatShortDate(weekDates[0])} al ${formatShortDate(weekDates[6])}`}
                  </p>
                </div>
                {viewMode === "day" && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                    {resumenCocina.totalGeneral} pedidos
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Vista:</span>
                <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1">
                  <button
                    onClick={() => setViewMode("day")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      viewMode === "day" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Día
                  </button>
                  <button
                    onClick={() => setViewMode("week")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      viewMode === "week" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Semana
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handleExportDay}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Download className="w-4 h-4" />
                  Exportar Día
                </Button>

                <Button
                  onClick={handleExportWeek}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Download className="w-4 h-4" />
                  Exportar Semana
                </Button>

                <div className="group relative">
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                    <strong>Exportar Día:</strong> Genera 1 archivo con el día seleccionado
                    <br />
                    <br />
                    <strong>Exportar Semana:</strong> Genera 1 archivo con 7 hojas (Lunes a Domingo)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {viewMode === "day" && (
        <>
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="text-slate-900">Minuta Tipo 1</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                  {resumenCocina.totalMinuta1} pedidos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {resumenCocina.minuta1.length === 0 ? (
                <div className="text-center py-6">
                  <ChefHat className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No hay pedidos para esta minuta</p>
                </div>
              ) : (
                <div className="space-y-2">{resumenCocina.minuta1.map((opcion) => renderOpcion(opcion, "m1"))}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="text-slate-900">Minuta Tipo 2</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                  {resumenCocina.totalMinuta2} pedidos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {resumenCocina.minuta2.length === 0 ? (
                <div className="text-center py-6">
                  <ChefHat className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No hay pedidos para esta minuta</p>
                </div>
              ) : (
                <div className="space-y-2">{resumenCocina.minuta2.map((opcion) => renderOpcion(opcion, "m2"))}</div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === "week" && (
        <div className="space-y-2">
          {resumenesPorDia.map(({ fecha, resumen }) => {
            const isExpanded = expandedDays.has(fecha)
            const top3Minuta1 = getTop3(resumen.minuta1)
            const top3Minuta2 = getTop3(resumen.minuta2)
            const top3Combined = [
              ...resumen.minuta1.slice(0, 2).map((o) => `${o.descripcion} (${o.cantidadTotal})`),
              ...resumen.minuta2.slice(0, 1).map((o) => `${o.descripcion} (${o.cantidadTotal})`),
            ].join(" • ")

            return (
              <Card key={fecha} className="border border-slate-200">
                <button
                  onClick={() => toggleDayExpand(fecha)}
                  className="w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">{formatShortDate(fecha)}</span>
                        <div className="text-sm text-slate-600 mt-1">
                          M1: {resumen.totalMinuta1} | M2: {resumen.totalMinuta2}
                        </div>
                        {!isExpanded && top3Combined && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1">Top: {top3Combined}</div>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                      {resumen.totalGeneral} pedidos
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2 text-sm text-slate-600 py-2 mb-3">
                      <Info className="w-4 h-4" />
                      <span>Resumen simplificado - Ver vista diaria para detalles por empresa</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          Minuta Tipo 1
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            {resumen.totalMinuta1} ped.
                          </span>
                        </h4>
                        {renderSimplifiedSummary(resumen.minuta1)}
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          Minuta Tipo 2
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            {resumen.totalMinuta2} ped.
                          </span>
                        </h4>
                        {renderSimplifiedSummary(resumen.minuta2)}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
