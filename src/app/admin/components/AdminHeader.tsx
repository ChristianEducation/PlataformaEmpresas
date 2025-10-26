"use client"

import { Button } from "@/components/ui/Button"
import { ArrowLeft, Crown, Download, RefreshCw } from "lucide-react"

interface AdminHeaderProps {
  selectedDate: string
  exportType: string
  loadingStats: boolean
  onBack: () => void
  onExportTypeChange: (type: string) => void
  onExport: () => void
  onRefresh: () => void
}

// Placeholder - will be populated in Phase 3
export function AdminHeader(props: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={props.onBack}
          className="border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span>Panel de Administración</span>
          </h1>
          <p className="text-slate-600 mt-1">
            Gestión de pedidos de almuerzo -{" "}
            {new Date(props.selectedDate).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <select
          value={props.exportType}
          onChange={(e) => props.onExportTypeChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="general">📊 Exportar General</option>
          <option value="kitchen">🍳 Vista Cocina</option>
          <option value="workers">👥 Por Trabajador</option>
          <option value="shifts">⏰ Por Turno</option>
        </select>
        <Button
          onClick={props.onExport}
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
        <Button
          onClick={props.onRefresh}
          disabled={props.loadingStats}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${props.loadingStats ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>
    </div>
  )
}
