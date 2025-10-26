"use client"

import { Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
  pedidosCount: number
}

export function DateSelector(props: DateSelectorProps) {
  return (
    <Card className="bg-white shadow-sm border border-slate-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <label className="text-sm font-medium text-slate-700">Fecha de consulta:</label>
            </div>
            <Input
              type="date"
              value={props.selectedDate}
              onChange={(e) => props.onDateChange(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="text-sm text-slate-600">
            Última actualización: {new Date().toLocaleTimeString("es-ES")} | {props.pedidosCount} pedidos cargados
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
