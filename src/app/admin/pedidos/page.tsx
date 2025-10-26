"use client"

import { useState, useMemo, useEffect } from "react"
import { useAdminData } from "../hooks/useAdminData"
import { DateSelector } from "../components/DateSelector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ClipboardList, Building2, Search, ChevronDown, ChevronUp, Download } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { exportarPedidosPorEmpresa } from "./utils/exportPedidos"

export default function PedidosPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmpresa, setSelectedEmpresa] = useState("")
  const [expandedEmpresas, setExpandedEmpresas] = useState<Set<string>>(new Set())

  const { pedidos, fetchAllData } = useAdminData(selectedDate)

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const matchesSearch = !searchTerm || pedido.nombre_trabajador?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEmpresa = !selectedEmpresa || pedido.empresa === selectedEmpresa
      return matchesSearch && matchesEmpresa
    })
  }, [pedidos, searchTerm, selectedEmpresa])

  const pedidosAgrupados = useMemo(() => {
    const grupos: Record<string, typeof pedidos> = {}

    filteredPedidos.forEach((pedido) => {
      const empresa = pedido.empresa || "Sin empresa"
      if (!grupos[empresa]) {
        grupos[empresa] = []
      }
      grupos[empresa].push(pedido)
    })

    // Ordenar empresas alfabéticamente
    const empresasOrdenadas = Object.keys(grupos).sort((a, b) => a.localeCompare(b))

    // Ordenar trabajadores dentro de cada empresa alfabéticamente
    empresasOrdenadas.forEach((empresa) => {
      grupos[empresa].sort((a, b) => a.nombre_trabajador.localeCompare(b.nombre_trabajador))
    })

    return empresasOrdenadas.map((empresa) => ({
      empresa,
      pedidos: grupos[empresa],
      total: grupos[empresa].length,
    }))
  }, [filteredPedidos])

  const empresas = useMemo(() => {
    const uniqueEmpresas = [...new Set(pedidos.map((p) => p.empresa).filter(Boolean))]
    return uniqueEmpresas.sort((a, b) => a.localeCompare(b))
  }, [pedidos])

  const toggleEmpresa = (empresa: string) => {
    const newExpanded = new Set(expandedEmpresas)
    if (newExpanded.has(empresa)) {
      newExpanded.delete(empresa)
    } else {
      newExpanded.add(empresa)
    }
    setExpandedEmpresas(newExpanded)
  }

  const handleExportExcel = async () => {
    await exportarPedidosPorEmpresa(pedidos, selectedDate)
  }

  useEffect(() => {
    fetchAllData()
  }, [selectedDate, fetchAllData])

  return (
    <div className="space-y-6">
      <DateSelector selectedDate={selectedDate} pedidosCount={pedidos.length} onDateChange={setSelectedDate} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              <span>Pedidos del Día</span>
            </div>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative w-full sm:w-64">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Todas las empresas</option>
                  {empresas.map((empresa) => (
                    <option key={empresa} value={empresa}>
                      {empresa}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {pedidosAgrupados.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos</h3>
                <p className="text-slate-600">No se encontraron pedidos para los filtros seleccionados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosAgrupados.map((grupo) => (
                  <div key={grupo.empresa} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleEmpresa(grupo.empresa)}
                      className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-slate-900">{grupo.empresa}</h3>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          {grupo.total} {grupo.total === 1 ? "pedido" : "pedidos"}
                        </span>
                      </div>
                      {expandedEmpresas.has(grupo.empresa) ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedEmpresas.has(grupo.empresa) ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-white border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                                Nombre Trabajador
                              </th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                                Opción Elegida
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {grupo.pedidos.map((pedido) => (
                              <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-900">{pedido.nombre_trabajador}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{pedido.descripcion_opcion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
