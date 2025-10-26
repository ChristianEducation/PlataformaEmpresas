import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { BarChart3, TrendingUp } from "lucide-react"

interface AdminStats {
  totalPedidos: number
  pedidosDia: number
  pedidosNoche: number
  empresasActivas: number
  trabajadoresActivos: number
  pedidosHoy: number
  pedidosEsteMes: number
}

interface OverviewTabProps {
  stats: AdminStats
}

export function OverviewTab({ stats }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Distribución por Turno</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium">Turno Día</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold">{stats.pedidosDia}</span>
                <span className="text-sm text-slate-500 ml-2">
                  ({stats.totalPedidos > 0 ? Math.round((stats.pedidosDia / stats.totalPedidos) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Turno Noche</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold">{stats.pedidosNoche}</span>
                <span className="text-sm text-slate-500 ml-2">
                  ({stats.totalPedidos > 0 ? Math.round((stats.pedidosNoche / stats.totalPedidos) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Resumen Rápido</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pedidos totales del día:</span>
              <span className="font-semibold">{stats.totalPedidos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Empresas participantes:</span>
              <span className="font-semibold">{stats.empresasActivas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Trabajadores activos:</span>
              <span className="font-semibold">{stats.trabajadoresActivos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Promedio por empresa:</span>
              <span className="font-semibold">
                {stats.empresasActivas > 0 ? Math.round(stats.totalPedidos / stats.empresasActivas) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Turno más activo:</span>
              <span className="font-semibold">
                {stats.pedidosDia > stats.pedidosNoche
                  ? "Día"
                  : stats.pedidosNoche > stats.pedidosDia
                    ? "Noche"
                    : "Empate"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
