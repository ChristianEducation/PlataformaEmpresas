import type { Pedido, Trabajador } from "@/types/database"
import type { DashboardMetrics, TopOpcion, EmpresaStats } from "../types"

export function calculateDashboardMetrics(pedidos: Pedido[], trabajadores: Trabajador[]): DashboardMetrics {
  const totalPedidos = pedidos.length

  // Trabajadores únicos que tienen pedidos
  const trabajadoresUnicos = new Set(pedidos.map((p) => p.nombre_trabajador))
  const totalTrabajadores = trabajadoresUnicos.size

  // Empresas únicas
  const empresasUnicas = new Set(pedidos.map((p) => p.empresa))
  const totalEmpresas = empresasUnicas.size

  // Contar por tipo de minuta
  let minutaM1 = 0
  let minutaM2 = 0

  pedidos.forEach((pedido) => {
    // Buscar el trabajador para obtener su tipo_minuta
    const trabajador = trabajadores.find((t) => t.nombre_completo === pedido.nombre_trabajador)
    if (trabajador) {
      if (trabajador.tipo_minuta === 1) {
        minutaM1++
      } else if (trabajador.tipo_minuta === 2) {
        minutaM2++
      }
    }
  })

  return {
    totalPedidos,
    totalTrabajadores,
    totalEmpresas,
    minutaM1,
    minutaM2,
  }
}

export function getTop5Opciones(pedidos: Pedido[]): TopOpcion[] {
  // Agrupar por descripción de opción
  const opcionesMap = new Map<string, number>()

  pedidos.forEach((pedido) => {
    const descripcion = pedido.descripcion_opcion
    opcionesMap.set(descripcion, (opcionesMap.get(descripcion) || 0) + 1)
  })

  // Convertir a array y ordenar por cantidad
  const opciones = Array.from(opcionesMap.entries())
    .map(([descripcion, cantidad]) => ({
      descripcion,
      cantidad,
      porcentaje: pedidos.length > 0 ? Math.round((cantidad / pedidos.length) * 100) : 0,
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  return opciones
}

export function getDistribucionEmpresas(pedidos: Pedido[]): EmpresaStats[] {
  // Agrupar por empresa
  const empresasMap = new Map<string, { pedidos: Set<number>; trabajadores: Set<string> }>()

  pedidos.forEach((pedido) => {
    const empresa = pedido.empresa
    if (!empresasMap.has(empresa)) {
      empresasMap.set(empresa, {
        pedidos: new Set(),
        trabajadores: new Set(),
      })
    }

    const stats = empresasMap.get(empresa)!
    stats.pedidos.add(pedido.id)
    stats.trabajadores.add(pedido.nombre_trabajador)
  })

  // Convertir a array y ordenar por cantidad de pedidos
  const empresas = Array.from(empresasMap.entries())
    .map(([empresa, stats]) => ({
      empresa,
      cantidadPedidos: stats.pedidos.size,
      cantidadTrabajadores: stats.trabajadores.size,
    }))
    .sort((a, b) => b.cantidadPedidos - a.cantidadPedidos)

  return empresas
}
