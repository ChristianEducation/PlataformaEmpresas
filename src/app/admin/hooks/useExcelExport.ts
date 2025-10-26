"use client"
import * as XLSX from "xlsx"
import type { Pedido, Trabajador } from "@/types/database"

interface PedidoCompleto extends Pedido {
  trabajador_info?: Trabajador
}

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

export function useExcelExport(
  selectedDate: string,
  pedidos: PedidoCompleto[],
  vistaCocina: VistaCocina,
  getFilteredPedidos: () => PedidoCompleto[],
) {
  const generateKitchenExcel = () => {
    const dateFormatted = new Date(selectedDate).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const wb = XLSX.utils.book_new()
    const wsData: (string | number)[][] = []

    wsData.push([`VISTA DIARIA PARA COCINA - ${dateFormatted.toUpperCase()}`])
    wsData.push([])
    wsData.push(["🌅 PEDIDOS TURNO DÍA"])
    wsData.push([])

    if (vistaCocina.dia.length > 0) {
      wsData.push(["🍽️ PLATO", "📋 CATEGORÍA", "🔢 CANTIDAD", "👥 TRABAJADORES"])
      vistaCocina.dia.forEach((plato) => {
        wsData.push([
          plato.descripcion_opcion,
          plato.categoria_opcion.toUpperCase(),
          plato.cantidad,
          plato.trabajadores.join(" • "),
        ])
      })
    } else {
      wsData.push(["❌ No hay pedidos para este turno"])
    }

    wsData.push([])
    wsData.push(["🌙 PEDIDOS TURNO NOCHE"])
    wsData.push([])

    if (vistaCocina.noche.length > 0) {
      wsData.push(["🍽️ PLATO", "📋 CATEGORÍA", "🔢 CANTIDAD", "👥 TRABAJADORES"])
      vistaCocina.noche.forEach((plato) => {
        wsData.push([
          plato.descripcion_opcion,
          plato.categoria_opcion.toUpperCase(),
          plato.cantidad,
          plato.trabajadores.join(" • "),
        ])
      })
    } else {
      wsData.push(["❌ No hay pedidos para este turno"])
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws["!cols"] = [{ width: 35 }, { width: 15 }, { width: 10 }, { width: 50 }]
    XLSX.utils.book_append_sheet(wb, ws, "Vista Cocina")
    XLSX.writeFile(wb, `vista_cocina_${selectedDate}.xlsx`)
  }

  const generateWorkersExcel = () => {
    const dateFormatted = new Date(selectedDate).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const wb = XLSX.utils.book_new()
    const wsData: (string | number)[][] = []

    wsData.push([`📋 PEDIDOS POR TRABAJADOR - ${dateFormatted.toUpperCase()}`])
    wsData.push([`Total de pedidos: ${pedidos.length}`])
    wsData.push([])
    wsData.push(["👤 TRABAJADOR", "🏢 EMPRESA", "⏰ TURNO", "🍽️ PLATO", "📝 NOTAS"])

    const sortedPedidos = [...pedidos].sort(
      (a, b) =>
        a.nombre_trabajador.localeCompare(b.nombre_trabajador) || a.turno_elegido.localeCompare(b.turno_elegido),
    )

    sortedPedidos.forEach((pedido) => {
      const turnoText = pedido.turno_elegido === "dia" ? "🌅 DÍA" : "🌙 NOCHE"
      const notasText = pedido.notas || "Sin notas"
      wsData.push([pedido.nombre_trabajador, pedido.empresa, turnoText, pedido.descripcion_opcion, notasText])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws["!cols"] = [{ width: 25 }, { width: 20 }, { width: 12 }, { width: 35 }, { width: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, "Por Trabajador")
    XLSX.writeFile(wb, `por_trabajador_${selectedDate}.xlsx`)
  }

  const generateShiftsExcel = () => {
    const dateFormatted = new Date(selectedDate).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const wb = XLSX.utils.book_new()
    const wsData: (string | number)[][] = []

    wsData.push([`⏰ PEDIDOS POR TURNO - ${dateFormatted.toUpperCase()}`])
    wsData.push([])

    const pedidosDia = pedidos.filter((p) => p.turno_elegido === "dia")
    wsData.push([`🌅 TURNO DÍA - ${pedidosDia.length} pedidos`])
    wsData.push([])

    if (pedidosDia.length > 0) {
      wsData.push(["👤 TRABAJADOR", "🏢 EMPRESA", "🍽️ PLATO", "📝 NOTAS"])
      pedidosDia.forEach((pedido) => {
        const notasText = pedido.notas || "Sin notas"
        wsData.push([pedido.nombre_trabajador, pedido.empresa, pedido.descripcion_opcion, notasText])
      })
    } else {
      wsData.push(["❌ No hay pedidos para este turno"])
    }

    wsData.push([])
    wsData.push([])

    const pedidosNoche = pedidos.filter((p) => p.turno_elegido === "noche")
    wsData.push([`🌙 TURNO NOCHE - ${pedidosNoche.length} pedidos`])
    wsData.push([])

    if (pedidosNoche.length > 0) {
      wsData.push(["👤 TRABAJADOR", "🏢 EMPRESA", "🍽️ PLATO", "📝 NOTAS"])
      pedidosNoche.forEach((pedido) => {
        const notasText = pedido.notas || "Sin notas"
        wsData.push([pedido.nombre_trabajador, pedido.empresa, pedido.descripcion_opcion, notasText])
      })
    } else {
      wsData.push(["❌ No hay pedidos para este turno"])
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws["!cols"] = [{ width: 25 }, { width: 20 }, { width: 35 }, { width: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, "Por Turno")
    XLSX.writeFile(wb, `por_turno_${selectedDate}.xlsx`)
  }

  const generateGeneralExcel = () => {
    const dataToExport = getFilteredPedidos()
    const dateFormatted = new Date(selectedDate).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const wb = XLSX.utils.book_new()
    const wsData: (string | number)[][] = []

    wsData.push([`📊 REPORTE GENERAL DE PEDIDOS - ${dateFormatted.toUpperCase()}`])
    wsData.push([`Total de pedidos: ${dataToExport.length}`])
    wsData.push([])
    wsData.push(["👤 TRABAJADOR", "🏢 EMPRESA", "⏰ TURNO", "🍽️ PLATO", "📋 CATEGORÍA", "📝 NOTAS", "📅 FECHA CREACIÓN"])

    dataToExport.forEach((pedido) => {
      const turnoText = pedido.turno_elegido === "dia" ? "🌅 DÍA" : "🌙 NOCHE"
      const notasText = pedido.notas || "Sin notas"
      const fechaCreacion = new Date(pedido.created_at).toLocaleString("es-ES")

      wsData.push([
        pedido.nombre_trabajador,
        pedido.empresa,
        turnoText,
        pedido.descripcion_opcion,
        pedido.categoria_opcion.toUpperCase(),
        notasText,
        fechaCreacion,
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws["!cols"] = [
      { width: 25 },
      { width: 20 },
      { width: 12 },
      { width: 35 },
      { width: 15 },
      { width: 30 },
      { width: 20 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, "Reporte General")
    XLSX.writeFile(wb, `pedidos_general_${selectedDate}.xlsx`)
  }

  const exportData = async (exportType: "general" | "kitchen" | "workers" | "shifts") => {
    try {
      switch (exportType) {
        case "kitchen":
          generateKitchenExcel()
          break
        case "workers":
          generateWorkersExcel()
          break
        case "shifts":
          generateShiftsExcel()
          break
        default:
          generateGeneralExcel()
      }
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  return {
    generateKitchenExcel,
    generateWorkersExcel,
    generateShiftsExcel,
    generateGeneralExcel,
    exportData,
  }
}
