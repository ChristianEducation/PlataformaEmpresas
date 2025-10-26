import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ChefHat, Sun, Moon, Utensils } from "lucide-react"

interface PlatoPorTurno {
  descripcion_opcion: string
  codigo_opcion: string
  categoria_opcion: string
  cantidad: number
  trabajadores: string[]
}

interface VistaCocina {
  dia: PlatoPorTurno[]
  noche: PlatoPorTurno[]
}

interface KitchenTabProps {
  vistaCocina: VistaCocina
  selectedDate: string
  getCategoryColor: (categoria: string) => string
}

export function KitchenTab({ vistaCocina, selectedDate, getCategoryColor }: KitchenTabProps) {
  return (
    <div className="space-y-6">
      {/* Vista Cocina Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <ChefHat className="w-8 h-8" />
            <span>Vista Diaria para Cocina</span>
          </CardTitle>
          <p className="text-orange-100">
            Resumen de platos agrupados por turno y cantidad -{" "}
            {new Date(selectedDate).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </CardHeader>
      </Card>

      {/* Turno Día */}
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <CardTitle className="text-xl flex items-center space-x-3">
            <Sun className="w-6 h-6" />
            <span>Pedidos - Turno Día</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {vistaCocina.dia.reduce((total, plato) => total + plato.cantidad, 0)} pedidos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {vistaCocina.dia.length === 0 ? (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos para este turno</h3>
              <p className="text-slate-600">No se registraron pedidos para el turno de día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vistaCocina.dia.map((plato, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {plato.cantidad}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{plato.descripcion_opcion}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(plato.categoria_opcion)}`}
                          >
                            {plato.categoria_opcion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Trabajadores ({plato.trabajadores.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plato.trabajadores.map((trabajador, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-sm border border-amber-200"
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

      {/* Turno Noche */}
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardTitle className="text-xl flex items-center space-x-3">
            <Moon className="w-6 h-6" />
            <span>Pedidos - Turno Noche</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {vistaCocina.noche.reduce((total, plato) => total + plato.cantidad, 0)} pedidos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {vistaCocina.noche.length === 0 ? (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos para este turno</h3>
              <p className="text-slate-600">No se registraron pedidos para el turno de noche</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vistaCocina.noche.map((plato, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {plato.cantidad}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{plato.descripcion_opcion}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(plato.categoria_opcion)}`}
                          >
                            {plato.categoria_opcion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Trabajadores ({plato.trabajadores.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plato.trabajadores.map((trabajador, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-sm border border-purple-200"
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
    </div>
  )
}
