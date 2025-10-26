"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Pedido, Trabajador } from "@/types/database"
import { calculateDashboardMetrics, getTop5Opciones, getDistribucionEmpresas } from "../utils/calculations"
import type { DashboardMetrics, TopOpcion, EmpresaStats } from "../types"

interface UseDashboardDataReturn {
  pedidos: Pedido[]
  trabajadores: Trabajador[]
  metrics: DashboardMetrics
  top5Opciones: TopOpcion[]
  distribucionEmpresas: EmpresaStats[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboardData(selectedDate: string): UseDashboardDataReturn {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPedidos: 0,
    totalTrabajadores: 0,
    totalEmpresas: 0,
    minutaM1: 0,
    minutaM2: 0,
  })
  const [top5Opciones, setTop5Opciones] = useState<TopOpcion[]>([])
  const [distribucionEmpresas, setDistribucionEmpresas] = useState<EmpresaStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch trabajadores
      const { data: trabajadoresData, error: trabajadoresError } = await supabase
        .from("trabajadores")
        .select("id, nombre_completo, tipo_minuta, empresa")
        .eq("activo", true)

      if (trabajadoresError) {
        console.error("Error fetching trabajadores:", trabajadoresError)
        setError("Error al cargar trabajadores")
        return
      }

      // Fetch pedidos del día seleccionado
      const { data: pedidosData, error: pedidosError } = await supabase
        .from("pedidos")
        .select("*")
        .eq("fecha_entrega", selectedDate)
        .order("nombre_trabajador", { ascending: true })

      if (pedidosError) {
        console.error("Error fetching pedidos:", pedidosError)
        setError("Error al cargar pedidos")
        return
      }

      setPedidos(pedidosData || [])
      setTrabajadores((trabajadoresData as Trabajador[]) || [])

      // Calcular métricas
      const calculatedMetrics = calculateDashboardMetrics(pedidosData || [], trabajadoresData || [])
      setMetrics(calculatedMetrics)

      // Calcular top 5 opciones
      const top5 = getTop5Opciones(pedidosData || [])
      setTop5Opciones(top5)

      // Calcular distribución por empresa
      const distribucion = getDistribucionEmpresas(pedidosData || [])
      setDistribucionEmpresas(distribucion)
    } catch (err) {
      console.error("Error en fetchData:", err)
      setError("Error inesperado al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    pedidos,
    trabajadores,
    metrics,
    top5Opciones,
    distribucionEmpresas,
    loading,
    error,
    refetch: fetchData,
  }
}
