import { ClipboardList, Sun, Moon, Building2, Users, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

interface AdminStats {
  totalPedidos: number
  pedidosDia: number
  pedidosNoche: number
  empresasActivas: number
  trabajadoresActivos: number
  pedidosHoy: number
  pedidosEsteMes: number
}

interface StatsCardsProps {
  stats: AdminStats
}

export function StatsCards(props: StatsCardsProps) {
  const { stats } = props

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6 mb-8">
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Fecha</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalPedidos}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Turno Día</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pedidosDia}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Turno Noche</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pedidosNoche}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Moon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Empresas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.empresasActivas}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Trabajadores</p>
              <p className="text-2xl font-bold text-slate-900">{stats.trabajadoresActivos}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Hoy</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pedidosHoy}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Este Mes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pedidosEsteMes}</p>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
