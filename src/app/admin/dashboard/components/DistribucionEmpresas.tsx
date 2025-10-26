import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Building2, Users } from "lucide-react"
import type { EmpresaStats } from "../types"

interface DistribucionEmpresasProps {
  empresas: EmpresaStats[]
}

export function DistribucionEmpresas({ empresas }: DistribucionEmpresasProps) {
  if (empresas.length === 0) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Distribución por Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No hay pedidos para mostrar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Distribución por Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Empresa</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Pedidos</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Trabajadores</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {empresas.map((empresa, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">{empresa.empresa}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                        {empresa.cantidadPedidos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                        <Users className="w-3 h-3" />
                        {empresa.cantidadTrabajadores}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
