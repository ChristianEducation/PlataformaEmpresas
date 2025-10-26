import type { PedidoCocina, Trabajador } from "@/types/database"

interface PedidoCompleto extends PedidoCocina {
  trabajador_info?: Trabajador
}

interface PedidosPorEmpresa {
  empresa: string
  total: number
  dia: number
  noche: number
  trabajadores: string[]
}

interface PlatoPorTurno {
  descripcion_opcion: string
  codigo_opcion: string
  categoria_opcion: string
  cantidad: number
  trabajadores: string[]
}

interface OpcionConDesglose {
  descripcion: string
  cantidadTotal: number
  porEmpresa: {
    empresa: string
    cantidad: number
  }[]
}

interface ResumenCocina {
  minuta1: OpcionConDesglose[]
  minuta2: OpcionConDesglose[]
  totalMinuta1: number
  totalMinuta2: number
  totalGeneral: number
}

interface VistaCocina {
  dia: PlatoPorTurno[]
  noche: PlatoPorTurno[]
}

export function calculatePedidosPorEmpresa(pedidosData: PedidoCompleto[]): PedidosPorEmpresa[] {
  const empresasMap = new Map<string, { total: number; dia: number; noche: number; trabajadores: Set<string> }>()

  pedidosData.forEach((pedido) => {
    if (pedido.empresa) {
      const current = empresasMap.get(pedido.empresa) || {
        total: 0,
        dia: 0,
        noche: 0,
        trabajadores: new Set<string>(),
      }

      current.total += 1
      current.trabajadores.add(pedido.nombre_trabajador)

      if (pedido.turno_elegido === "dia") {
        current.dia += 1
      } else if (pedido.turno_elegido === "noche") {
        current.noche += 1
      }

      empresasMap.set(pedido.empresa, current)
    }
  })

  const empresasArray = Array.from(empresasMap.entries())
    .map(([empresa, stats]) => ({
      empresa,
      total: stats.total,
      dia: stats.dia,
      noche: stats.noche,
      trabajadores: Array.from(stats.trabajadores),
    }))
    .sort((a, b) => b.total - a.total)

  return empresasArray
}

export function calculateVistaCocina(pedidosData: PedidoCompleto[]): VistaCocina {
  const platosMap = new Map<
    string,
    Map<string, { cantidad: number; trabajadores: Set<string>; categoria: string; codigo: string }>
  >()

  pedidosData.forEach((pedido) => {
    const turno = pedido.turno_elegido
    const plato = pedido.descripcion_opcion

    if (!platosMap.has(turno)) {
      platosMap.set(turno, new Map())
    }

    const turnoMap = platosMap.get(turno)!
    const current = turnoMap.get(plato) || {
      cantidad: 0,
      trabajadores: new Set<string>(),
      categoria: pedido.categoria_opcion,
      codigo: pedido.codigo_opcion,
    }

    current.cantidad += 1
    current.trabajadores.add(pedido.nombre_trabajador)

    turnoMap.set(plato, current)
  })

  const dia: PlatoPorTurno[] = []
  const noche: PlatoPorTurno[] = []

  if (platosMap.has("dia")) {
    platosMap.get("dia")!.forEach((stats, plato) => {
      dia.push({
        descripcion_opcion: plato,
        codigo_opcion: stats.codigo,
        categoria_opcion: stats.categoria,
        cantidad: stats.cantidad,
        trabajadores: Array.from(stats.trabajadores),
      })
    })
  }

  if (platosMap.has("noche")) {
    platosMap.get("noche")!.forEach((stats, plato) => {
      noche.push({
        descripcion_opcion: plato,
        codigo_opcion: stats.codigo,
        categoria_opcion: stats.categoria,
        cantidad: stats.cantidad,
        trabajadores: Array.from(stats.trabajadores),
      })
    })
  }

  dia.sort((a, b) => a.categoria_opcion.localeCompare(b.categoria_opcion) || b.cantidad - a.cantidad)
  noche.sort((a, b) => a.categoria_opcion.localeCompare(b.categoria_opcion) || b.cantidad - a.cantidad)

  return { dia, noche }
}

export function calculateResumenCocina(pedidosData: PedidoCompleto[], trabajadores: Trabajador[]): ResumenCocina {
  // Crear mapa de trabajador_id -> tipo_minuta
  const trabajadorMap = new Map<number, number>()
  trabajadores.forEach((t) => {
    trabajadorMap.set(t.id, t.tipo_minuta)
  })

  console.log("[v0] Trabajadores en mapa:", trabajadorMap.size)
  console.log("[v0] Pedidos a procesar:", pedidosData.length)

  // Mapas para agrupar por tipo de minuta y opción
  const minuta1Map = new Map<string, Map<string, number>>() // opcion -> empresa -> cantidad
  const minuta2Map = new Map<string, Map<string, number>>()

  let pedidosSinTrabajadorId = 0
  let trabajadoresNoEncontrados = 0

  pedidosData.forEach((pedido) => {
    if (!pedido.trabajador_id) {
      pedidosSinTrabajadorId++
      console.warn("[v0] Pedido sin trabajador_id:", {
        nombre: pedido.nombre_trabajador,
        empresa: pedido.empresa,
        fecha: pedido.fecha_entrega,
      })
      return // Saltar este pedido
    }

    const tipoMinuta = trabajadorMap.get(pedido.trabajador_id)

    if (!tipoMinuta) {
      trabajadoresNoEncontrados++
      console.warn("[v0] Trabajador no encontrado en mapa:", {
        trabajador_id: pedido.trabajador_id,
        nombre: pedido.nombre_trabajador,
      })
      return // Saltar este pedido
    }

    const map = tipoMinuta === 1 ? minuta1Map : minuta2Map

    // Inicializar mapa de empresa si no existe
    if (!map.has(pedido.descripcion_opcion)) {
      map.set(pedido.descripcion_opcion, new Map())
    }

    const empresaMap = map.get(pedido.descripcion_opcion)!
    const currentCount = empresaMap.get(pedido.empresa) || 0
    empresaMap.set(pedido.empresa, currentCount + 1)
  })

  if (pedidosSinTrabajadorId > 0) {
    console.warn(`[v0] Total pedidos sin trabajador_id: ${pedidosSinTrabajadorId}`)
  }
  if (trabajadoresNoEncontrados > 0) {
    console.warn(`[v0] Total trabajadores no encontrados: ${trabajadoresNoEncontrados}`)
  }

  // Convertir a arrays con desglose por empresa
  const convertirAArray = (map: Map<string, Map<string, number>>): OpcionConDesglose[] => {
    return Array.from(map.entries())
      .map(([descripcion, empresaMap]) => {
        const porEmpresa = Array.from(empresaMap.entries())
          .map(([empresa, cantidad]) => ({ empresa, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad) // Ordenar empresas por cantidad

        const cantidadTotal = porEmpresa.reduce((sum, item) => sum + item.cantidad, 0)

        return {
          descripcion,
          cantidadTotal,
          porEmpresa,
        }
      })
      .sort((a, b) => b.cantidadTotal - a.cantidadTotal) // Ordenar opciones por cantidad total
  }

  const minuta1 = convertirAArray(minuta1Map)
  const minuta2 = convertirAArray(minuta2Map)

  const totalProcesados =
    minuta1.reduce((sum, item) => sum + item.cantidadTotal, 0) +
    minuta2.reduce((sum, item) => sum + item.cantidadTotal, 0)

  console.log("[v0] Pedidos procesados exitosamente:", totalProcesados)

  return {
    minuta1,
    minuta2,
    totalMinuta1: minuta1.reduce((sum, item) => sum + item.cantidadTotal, 0),
    totalMinuta2: minuta2.reduce((sum, item) => sum + item.cantidadTotal, 0),
    totalGeneral: totalProcesados,
  }
}
