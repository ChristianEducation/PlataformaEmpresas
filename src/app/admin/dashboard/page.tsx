"use client"

import { useState, useEffect } from "react"
import { useAdminData } from "../hooks/useAdminData"
import { DateSelector } from "../components/DateSelector"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { LayoutDashboard } from "lucide-react"
import { useDashboardData } from "./hooks/useDashboardData"
import { MetricsCards } from "./components/MetricsCards"
import { Top5Opciones } from "./components/Top5Opciones"
import { DistribucionEmpresas } from "./components/DistribucionEmpresas"
import { ControlPedidos } from "./components/ControlPedidos"

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })

  const { pedidos, fetchAllData } = useAdminData(selectedDate)
  const { metrics, top5Opciones, distribucionEmpresas, loading } = useDashboardData(selectedDate)

  useEffect(() => {
    fetchAllData()
  }, [selectedDate, fetchAllData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            <CardTitle className="text-xl text-slate-900">Dashboard - Resumen General</CardTitle>
          </div>
        </CardHeader>
      </Card>

      <ControlPedidos />

      <DateSelector selectedDate={selectedDate} pedidosCount={pedidos.length} onDateChange={setSelectedDate} />

      <MetricsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Top5Opciones opciones={top5Opciones} />
        <DistribucionEmpresas empresas={distribucionEmpresas} />
      </div>
    </div>
  )
}
