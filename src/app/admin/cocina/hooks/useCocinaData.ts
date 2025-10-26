"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { PedidoCocina, Trabajador } from "@/types/database"

interface UseCocinaDataReturn {
  pedidos: PedidoCocina[]
  trabajadores: Trabajador[]
  loading: boolean
  error: string | null
}

export function useCocinaData(selectedDate: string, viewMode: "day" | "week"): UseCocinaDataReturn {
  const [pedidos, setPedidos] = useState<PedidoCocina[]>([])
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        console.log("[v0] Iniciando fetchData - Modo:", viewMode, "Fecha:", selectedDate)

        // Fetch trabajadores con solo los campos necesarios
        const { data: trabajadoresData, error: trabajadoresError } = await supabase
          .from("trabajadores")
          .select("id, nombre_completo, tipo_minuta")
          .eq("activo", true)

        if (trabajadoresError) {
          console.error("[v0] Error fetching trabajadores:", trabajadoresError)
          setError("Error al cargar trabajadores")
          return
        }

        console.log("[v0] Trabajadores cargados:", trabajadoresData?.length)

        // Construir query de pedidos según modo de vista
        let query = supabase.from("pedidos").select(`
          nombre_trabajador,
          fecha_entrega,
          dia_semana,
          numero_dia,
          codigo_opcion,
          descripcion_opcion,
          empresa,
          trabajador_id
        `)

        if (viewMode === "day") {
          // Vista diaria: solo pedidos de la fecha seleccionada
          console.log("[v0] Modo diario - Fecha:", selectedDate)
          query = query.eq("fecha_entrega", selectedDate)
        } else {
          // Vista semanal: calcular rango Lunes a Domingo
          const date = new Date(selectedDate)
          const day = date.getDay()
          const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Ajustar al lunes
          const monday = new Date(date.setDate(diff))

          const weekStart = monday.toISOString().split("T")[0]

          const sunday = new Date(monday)
          sunday.setDate(monday.getDate() + 6)
          const weekEnd = sunday.toISOString().split("T")[0]

          console.log("[v0] Modo semanal - Rango:", weekStart, "a", weekEnd)

          query = query.gte("fecha_entrega", weekStart).lte("fecha_entrega", weekEnd)
        }

        const { data: pedidosData, error: pedidosError } = await query.order("numero_dia", { ascending: true })

        if (pedidosError) {
          console.error("[v0] Error fetching pedidos:", pedidosError)
          setError("Error al cargar pedidos")
          return
        }

        console.log("[v0] Pedidos cargados:", pedidosData?.length)
        console.log("[v0] Pedidos con trabajador_id:", pedidosData?.filter((p) => p.trabajador_id).length)
        console.log("[v0] Pedidos SIN trabajador_id:", pedidosData?.filter((p) => !p.trabajador_id).length)

        if (pedidosData && pedidosData.length > 0) {
          console.log("[v0] Muestra primer pedido:", pedidosData[0])
        }

        setPedidos(pedidosData || [])
        setTrabajadores((trabajadoresData as Trabajador[]) || [])
      } catch (err) {
        console.error("[v0] Error en fetchData:", err)
        setError("Error inesperado al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDate, viewMode])

  return { pedidos, trabajadores, loading, error }
}
