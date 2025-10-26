"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import type { Trabajador } from "@/types/database"
import { Users, Search } from "lucide-react"

interface WorkersTabProps {
  trabajadores: Trabajador[]
  loadingTrabajadores: boolean
  searchTerm: string
  companyFilter: string
  onSearchChange: (term: string) => void
  onCompanyFilterChange: (filter: string) => void
  onAddWorker: () => void
  onEditWorker: (worker: Trabajador) => void
  onDeleteWorker: (workerId: number) => void
}

export function WorkersTab({
  trabajadores,
  loadingTrabajadores,
  searchTerm,
  companyFilter,
  onSearchChange,
  onCompanyFilterChange,
  onAddWorker,
  onEditWorker,
  onDeleteWorker,
}: WorkersTabProps) {
  const filteredTrabajadores = trabajadores

  return (
    <>
      {/* Worker Management Header */}
      <Card className="bg-white shadow-sm border border-slate-200 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Gestión de Trabajadores</span>
            </CardTitle>
            <Button onClick={onAddWorker} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Users className="w-4 h-4 mr-2" />
              Agregar Trabajador
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Nombre, empresa, RUT..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Empresa</label>
              <select
                value={companyFilter}
                onChange={(e) => onCompanyFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas las empresas</option>
                {Array.from(new Set(trabajadores.map((t) => t.empresa).filter((e): e is string => Boolean(e)))).map(
                  (empresa) => (
                    <option key={empresa} value={empresa}>
                      {empresa}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers List */}
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Trabajadores</CardTitle>
            <div className="text-sm text-slate-600">
              Mostrando {filteredTrabajadores.length} de {trabajadores.length} trabajadores
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTrabajadores ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTrabajadores.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay trabajadores</h3>
              <p className="text-slate-600">No se encontraron trabajadores para los filtros seleccionados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrabajadores.map((trabajador) => (
                <div
                  key={trabajador.id}
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold">
                        {trabajador.nombre_completo
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{trabajador.nombre_completo}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Empresa:</span> {trabajador.empresa || "No especificada"}
                          </p>
                          {trabajador.rut && (
                            <p className="text-sm text-slate-600">
                              <span className="font-medium">RUT:</span> {trabajador.rut}
                            </p>
                          )}
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Tipo Minuta:</span> {trabajador.tipo_minuta || 1}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          {trabajador.rol && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                trabajador.rol.toLowerCase() === "admin" ||
                                trabajador.rol.toLowerCase() === "administrador"
                                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                                  : "bg-green-100 text-green-700 border border-green-200"
                              }`}
                            >
                              {trabajador.rol}
                            </span>
                          )}
                          {trabajador.turno_habitual && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs border border-slate-200">
                              Turno: {trabajador.turno_habitual}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditWorker(trabajador)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteWorker(trabajador.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    <p>Creado: {new Date(trabajador.created_at).toLocaleDateString("es-ES")}</p>
                    <p>Contraseña: {trabajador.contraseña}</p>
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
