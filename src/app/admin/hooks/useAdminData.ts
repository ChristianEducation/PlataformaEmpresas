"use client"
import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Pedido, Trabajador } from "@/types/database"

interface PedidoCompleto extends Pedido {
  trabajador_info?: Trabajador
  trabajador_id?: number // Agregado para cruzar con trabajadores
}

interface AdminStats {
  totalPedidos: number
  pedidosDia: number
  pedidosNoche: number
  empresasActivas: number
  trabajadoresActivos: number
  pedidosHoy: number
  pedidosEsteMes: number
}

export function useAdminData(selectedDate: string) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [pedidos, setPedidos] = useState<PedidoCompleto[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalPedidos: 0,
    pedidosDia: 0,
    pedidosNoche: 0,
    empresasActivas: 0,
    trabajadoresActivos: 0,
    pedidosHoy: 0,
    pedidosEsteMes: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(false)

  const fetchTrabajadores = useCallback(async () => {
    try {
      setLoadingTrabajadores(true)
      const { data, error } = await supabase
        .from("trabajadores")
        .select("*")
        .eq("activo", true)
        .order("nombre_completo")

      if (error) throw error
      setTrabajadores(data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching trabajadores:", error)
      return []
    } finally {
      setLoadingTrabajadores(false)
    }
  }, [])

  const fetchPedidos = useCallback(
    async (trabajadoresList: Trabajador[]) => {
      try {
        console.log("Fetching pedidos for date:", selectedDate)

        const { data: pedidosData, error: pedidosError } = await supabase
          .from("pedidos")
          .select("*, trabajador_id")
          .eq("fecha_entrega", selectedDate)
          .order("created_at", { ascending: false })

        if (pedidosError) {
          console.error("Error fetching pedidos:", pedidosError)
          throw pedidosError
        }

        console.log("Pedidos fetched:", pedidosData?.length || 0)

        const pedidosCompletos: PedidoCompleto[] =
          pedidosData?.map((pedido) => {
            const trabajadorInfo = trabajadoresList.find(
              (t) =>
                t.nombre_completo === pedido.nombre_trabajador ||
                (pedido.rut_trabajador && t.rut === pedido.rut_trabajador),
            )

            return {
              ...pedido,
              trabajador_info: trabajadorInfo,
            }
          }) || []

        setPedidos(pedidosCompletos)
        return pedidosCompletos
      } catch (error) {
        console.error("Error fetching pedidos:", error)
        return []
      }
    },
    [selectedDate],
  )

  const fetchStats = useCallback(
    async (trabajadoresList: Trabajador[]) => {
      try {
        const { data: selectedDateData, error: selectedDateError } = await supabase
          .from("pedidos")
          .select("turno_elegido, empresa")
          .eq("fecha_entrega", selectedDate)

        if (selectedDateError) throw selectedDateError

        const today = new Date().toISOString().split("T")[0]
        const { data: todayData, error: todayError } = await supabase
          .from("pedidos")
          .select("id")
          .eq("fecha_entrega", today)

        if (todayError) throw todayError

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]

        const { data: monthData, error: monthError } = await supabase
          .from("pedidos")
          .select("id")
          .gte("fecha_entrega", startOfMonth)
          .lte("fecha_entrega", endOfMonth)

        if (monthError) throw monthError

        const total = selectedDateData?.length || 0
        const diaCount = selectedDateData?.filter((p) => p.turno_elegido === "dia").length || 0
        const nocheCount = selectedDateData?.filter((p) => p.turno_elegido === "noche").length || 0
        const empresasUnicas = new Set(selectedDateData?.map((p) => p.empresa).filter(Boolean))

        setStats({
          totalPedidos: total,
          pedidosDia: diaCount,
          pedidosNoche: nocheCount,
          empresasActivas: empresasUnicas.size,
          trabajadoresActivos: trabajadoresList.length,
          pedidosHoy: todayData?.length || 0,
          pedidosEsteMes: monthData?.length || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    },
    [selectedDate],
  )

  const fetchAllData = useCallback(async () => {
    setLoadingStats(true)
    try {
      const trabajadoresList = await fetchTrabajadores()
      await Promise.all([fetchPedidos(trabajadoresList), fetchStats(trabajadoresList)])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoadingStats(false)
    }
  }, [fetchTrabajadores, fetchPedidos, fetchStats])

  return {
    trabajadores,
    pedidos,
    stats,
    loadingStats,
    loadingTrabajadores,
    fetchTrabajadores,
    fetchPedidos,
    fetchStats,
    fetchAllData,
    setTrabajadores,
    setPedidos,
  }
}
