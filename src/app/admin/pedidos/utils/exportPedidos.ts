import ExcelJS from "exceljs"
import type { Pedido } from "@/types/database"

export async function exportarPedidosPorEmpresa(pedidos: Pedido[], fecha: string) {
  const [year, month, day] = fecha.split("-").map(Number)
  const dateFormatted = new Date(year, month - 1, day).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Agrupar por empresa
  const pedidosAgrupados = pedidos.reduce(
    (acc, pedido) => {
      const empresa = pedido.empresa || "Sin empresa"
      if (!acc[empresa]) {
        acc[empresa] = []
      }
      acc[empresa].push(pedido)
      return acc
    },
    {} as Record<string, Pedido[]>,
  )

  // Ordenar empresas alfabéticamente
  const empresasOrdenadas = Object.keys(pedidosAgrupados).sort((a, b) => a.localeCompare(b))

  const workbook = new ExcelJS.Workbook()

  // Crear una hoja por cada empresa
  empresasOrdenadas.forEach((empresa) => {
    const pedidosEmpresa = pedidosAgrupados[empresa]

    // Ordenar trabajadores alfabéticamente
    const pedidosOrdenados = pedidosEmpresa.sort((a, b) => a.nombre_trabajador.localeCompare(b.nombre_trabajador))

    const worksheet = workbook.addWorksheet(empresa.length > 31 ? empresa.substring(0, 31) : empresa)

    const titleRow = worksheet.addRow([`📋 PEDIDOS - ${empresa.toUpperCase()}`])
    worksheet.mergeCells(`A${titleRow.number}:B${titleRow.number}`)
    titleRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 }
    titleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF203864" }, // Azul oscuro
    }
    titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
    titleRow.height = 25

    const dateRow = worksheet.addRow([`Fecha: ${dateFormatted}`])
    worksheet.mergeCells(`A${dateRow.number}:B${dateRow.number}`)
    dateRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2F2F2" }, // Gris claro
    }
    dateRow.getCell(1).font = { size: 11 }

    const totalRow = worksheet.addRow([`Total: ${pedidosOrdenados.length} pedidos`])
    worksheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`)
    totalRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2F2F2" }, // Gris claro
    }
    totalRow.getCell(1).font = { size: 11 }

    // Línea vacía
    worksheet.addRow([])

    const headerRow = worksheet.addRow(["👤 Nombre Trabajador", "🍽️ Opción Elegida"])
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 }
    headerRow.alignment = { horizontal: "center", vertical: "middle" }
    headerRow.height = 20

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" }, // Azul medio
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFD0D0D0" } },
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
        left: { style: "thin", color: { argb: "FFD0D0D0" } },
        right: { style: "thin", color: { argb: "FFD0D0D0" } },
      }
    })

    pedidosOrdenados.forEach((pedido, index) => {
      const row = worksheet.addRow([pedido.nombre_trabajador, pedido.descripcion_opcion])

      const bgColor = index % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF"

      row.eachCell((cell) => {
        // Aplicar color de fondo
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        }

        // Aplicar bordes
        cell.border = {
          top: { style: "thin", color: { argb: "FFD0D0D0" } },
          bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
          left: { style: "thin", color: { argb: "FFD0D0D0" } },
          right: { style: "thin", color: { argb: "FFD0D0D0" } },
        }
      })
    })

    worksheet.getColumn(1).width = 30 // Nombre trabajador
    worksheet.getColumn(2).width = 40 // Opción elegida
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Pedidos_${fecha}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}
