import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Building2, Sun, Moon, ClipboardList } from "lucide-react"

interface PedidosPorEmpresa {
  empresa: string
  total: number
  dia: number
  noche: number
  trabajadores: string[]
}

interface CompaniesTabProps {
  pedidosPorEmpresa: PedidosPorEmpresa[]
  selectedDate: string
}

export function CompaniesTab({ pedidosPorEmpresa, selectedDate }: CompaniesTabProps) {
  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <span>Pedidos por Empresa</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pedidosPorEmpresa.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay datos</h3>
            <p className="text-slate-600">No se encontraron pedidos para la fecha seleccionada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosPorEmpresa.map((empresa, index) => (
              <div
                key={empresa.empresa}
                className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xl">{empresa.empresa}</h4>
                      <p className="text-sm text-slate-600">
                        {empresa.trabajadores.length} trabajadores han pedido •{" "}
                        {new Date(selectedDate).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="flex items-center space-x-2 mb-1">
                        <Sun className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-slate-600">Día</span>
                      </div>
                      <span className="text-2xl font-bold text-amber-600">{empresa.dia}</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center space-x-2 mb-1">
                        <Moon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-slate-600">Noche</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">{empresa.noche}</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center space-x-2 mb-1">
                        <ClipboardList className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium text-slate-600">Total</span>
                      </div>
                      <span className="text-3xl font-bold text-indigo-600">{empresa.total}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Distribución por turno</span>
                    <span>{empresa.total} pedidos</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500"
                        style={{ width: `${empresa.total > 0 ? (empresa.dia / empresa.total) * 100 : 0}%` }}
                      ></div>
                      <div
                        className="bg-purple-500"
                        style={{ width: `${empresa.total > 0 ? (empresa.noche / empresa.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Trabajadores list */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Trabajadores que pidieron:</p>
                  <div className="flex flex-wrap gap-2">
                    {empresa.trabajadores.map((trabajador, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm border border-slate-200"
                      >
                        {trabajador}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
