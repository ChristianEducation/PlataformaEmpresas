"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import type { Pedido, Trabajador } from "@/types/database"
import { Search, Package, Sun, Moon, CheckCircle2 } from "lucide-react"

interface PedidoCompleto extends Pedido {
  trabajador_info?: Trabajador
}

interface OrdersTabProps {
  pedidos: PedidoCompleto[]
  searchTerm: string
  shiftFilter: string
  onSearchChange: (term: string) => void
  onShiftFilterChange: (filter: string) => void
}

export function OrdersTab({ pedidos, searchTerm, shiftFilter, onSearchChange, onShiftFilterChange }: OrdersTabProps) {
  const filteredPedidos = pedidos

  return (
    <>
      {/* Filters for Orders */}
      <Card className="bg-white shadow-sm border border-slate-200 mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Nombre, RUT, empresa, plato, código..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Turno</label>
              <select
                value={shiftFilter}
                onChange={(e) => onShiftFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los turnos</option>
                <option value="dia">Día</option>
                <option value="noche">Noche</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Pedidos</CardTitle>
            <div className="text-sm text-slate-600">
              Mostrando {filteredPedidos.length} de {pedidos.length} pedidos
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPedidos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos</h3>
              <p className="text-slate-600">No se encontraron pedidos para los filtros seleccionados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center text-white font-semibold">
                        {pedido.nombre_trabajador
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-slate-900 text-lg">{pedido.nombre_trabajador}</h4>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            ID: {pedido.id}
                          </span>
                          {pedido.trabajador_info?.rol && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pedido.trabajador_info.rol.toLowerCase() === "admin" ||
                                pedido.trabajador_info.rol.toLowerCase() === "administrador"
                                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                                  : "bg-green-100 text-green-700 border border-green-200"
                              }`}
                            >
                              {pedido.trabajador_info.rol}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">
                              <span className="font-medium">RUT:</span> {pedido.rut_trabajador || "No especificado"}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium">Empresa:</span> {pedido.empresa}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium">Turno habitual:</span>{" "}
                              {pedido.trabajador_info?.turno_habitual || "No especificado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600">
                              <span className="font-medium">Plato:</span> {pedido.descripcion_opcion}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium">Código:</span> {pedido.codigo_opcion}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium">Categoría:</span> {pedido.categoria_opcion}
                            </p>
                          </div>
                        </div>
                        {pedido.notas && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">Notas:</span> {pedido.notas}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        {pedido.turno_elegido === "dia" ? (
                          <Sun className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Moon className="w-4 h-4 text-purple-600" />
                        )}
                        <span className="text-sm font-medium">
                          {pedido.turno_elegido === "dia" ? "Turno Día" : "Turno Noche"}
                        </span>
                      </div>
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmado</span>
                      </span>
                      <div className="text-xs text-slate-500 text-right">
                        <p>
                          {pedido.dia_semana} {pedido.numero_dia}
                        </p>
                        <p>{new Date(pedido.created_at).toLocaleString("es-ES")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
