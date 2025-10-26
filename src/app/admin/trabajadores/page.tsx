"use client"

import { useState, useMemo, useEffect } from "react"
import { useAdminData } from "../hooks/useAdminData"
import { useWorkerManagement } from "../hooks/useWorkerManagement"
import { getFilteredTrabajadores } from "../utils/filters"
import { WorkerModal } from "../components/modals/WorkerModal"
import { ImportExcelModal } from "./components/ImportExcelModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Users, Search, Filter, Plus, Edit, Trash2, Eye, EyeOff, Upload } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function TrabajadoresPage() {
  const [workerSearchTerm, setWorkerSearchTerm] = useState("")
  const [workerCompanyFilter, setWorkerCompanyFilter] = useState("all")
  const [showWorkerModal, setShowWorkerModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingWorker, setEditingWorker] = useState<any>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set())

  const { trabajadores, loadingTrabajadores, fetchAllData } = useAdminData(new Date().toISOString().split("T")[0])

  const filteredTrabajadores = useMemo(
    () => getFilteredTrabajadores(trabajadores, workerSearchTerm, workerCompanyFilter),
    [trabajadores, workerSearchTerm, workerCompanyFilter],
  )

  const { handleCreateWorker, handleUpdateWorker, handleDeleteWorker, handleBulkCreateWorkers } =
    useWorkerManagement(fetchAllData)

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  const togglePasswordVisibility = (workerId: number) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(workerId)) {
        newSet.delete(workerId)
      } else {
        newSet.add(workerId)
      }
      return newSet
    })
  }

  const handleBulkImport = async (workers: Array<{ nombre_completo: string; empresa: string }>, tipoMinuta: number) => {
    const result = await handleBulkCreateWorkers(workers, tipoMinuta)

    let message = `${result.imported} trabajador${result.imported !== 1 ? "es" : ""} importado${result.imported !== 1 ? "s" : ""} exitosamente`
    if (result.duplicates > 0) {
      message += `\n${result.duplicates} duplicado${result.duplicates !== 1 ? "s" : ""} saltado${result.duplicates !== 1 ? "s" : ""}`
    }
    if (result.errors.length > 0) {
      message += `\n${result.errors.length} error${result.errors.length !== 1 ? "es" : ""}`
    }
    alert(message)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Gestión de Trabajadores</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowImportModal(true)}
                variant="outline"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Excel
              </Button>
              <Button
                onClick={() => {
                  setEditingWorker(null)
                  setShowWorkerModal(true)
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Trabajador
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  value={workerSearchTerm}
                  onChange={(e) => setWorkerSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative w-full sm:w-48">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none z-10" />
                <select
                  value={workerCompanyFilter}
                  onChange={(e) => setWorkerCompanyFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="all">Todas las empresas</option>
                  {Array.from(new Set(trabajadores.map((t) => t.empresa)))
                    .sort()
                    .map((empresa) => (
                      <option key={empresa} value={empresa}>
                        {empresa}
                      </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {loadingTrabajadores ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando trabajadores...</p>
              </div>
            ) : filteredTrabajadores.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay trabajadores</h3>
                <p className="text-slate-600">No se encontraron trabajadores para los filtros seleccionados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTrabajadores.map((trabajador) => {
                  const isPasswordVisible = visiblePasswords.has(trabajador.id)

                  return (
                    <div
                      key={trabajador.id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-slate-900 text-lg">{trabajador.nombre_completo}</h4>

                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Empresa:</span> {trabajador.empresa}
                          </p>

                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Tipo Minuta:</span> {trabajador.tipo_minuta}
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Rol:</span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                trabajador.rol === "admin"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {trabajador.rol === "admin" ? "Admin" : "Usuario"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Contraseña:</span>
                            <span className="text-sm text-slate-900 font-mono">
                              {isPasswordVisible ? trabajador.contraseña : "••••••••"}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(trabajador.id)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              title={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                              {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setEditingWorker(trabajador)
                              setShowWorkerModal(true)
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar a ${trabajador.nombre_completo}?`)) {
                                handleDeleteWorker(trabajador.id)
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <WorkerModal
        isOpen={showWorkerModal}
        editingWorker={editingWorker}
        onClose={() => {
          setShowWorkerModal(false)
          setEditingWorker(null)
        }}
        onSubmit={(workerData) => {
          if (editingWorker) {
            handleUpdateWorker(editingWorker.id, workerData)
          } else {
            handleCreateWorker(workerData)
          }
          setShowWorkerModal(false)
          setEditingWorker(null)
        }}
      />

      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleBulkImport}
      />
    </div>
  )
}
