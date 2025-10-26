import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { TrendingUp } from "lucide-react"
import type { TopOpcion } from "../types"

interface Top5OpcionesProps {
  opciones: TopOpcion[]
}

export function Top5Opciones({ opciones }: Top5OpcionesProps) {
  if (opciones.length === 0) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Top 5 Opciones Más Pedidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
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
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Top 5 Opciones Más Pedidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {opciones.map((opcion, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{opcion.descripcion}</p>
                  <p className="text-xs text-slate-500">{opcion.porcentaje}% del total</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                {opcion.cantidad}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
