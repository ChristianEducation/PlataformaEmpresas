import { Card, CardContent } from "@/components/ui/Card"
import { Package, Users, Building2, ChefHat } from "lucide-react"
import type { DashboardMetrics } from "../types"

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Pedidos</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.totalPedidos}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Trabajadores</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.totalTrabajadores}</p>
              <p className="text-xs text-slate-500 mt-1">Con pedidos hoy</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Empresas</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.totalEmpresas}</p>
              <p className="text-xs text-slate-500 mt-1">Trabajadores activos</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Minutas</p>
              <div className="flex items-center gap-3 mt-2">
                <div>
                  <p className="text-sm text-slate-600">M1</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.minutaM1}</p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <p className="text-sm text-slate-600">M2</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.minutaM2}</p>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
