import ExcelJS from "exceljs"
import { supabase } from "@/lib/supabase"
import { calculateResumenCocina } from "../../utils/calculations"
import type { Trabajador } from "@/types/database"

interface PedidoCompleto {
  trabajador_id?: number
  nombre_trabajador: string
  rut_trabajador: string | null
  turno_elegido: string
  fecha_entrega: string
  dia_semana: string
  numero_dia: number
  codigo_opcion: string
  descripcion_opcion: string
  categoria_opcion: string
  notas: string | null
  created_at: string
  empresa: string
}

export async function exportCocinaWeek(weekDates: string[], trabajadores: Trabajador[]) {
  const workbook = new ExcelJS.Workbook()

  // Colores de la paleta verde
  const headerColor = "166534" // Verde oscuro
  const minuta1Color = "16a34a" // Verde medio
  const minuta2Color = "22c55e" // Verde claro

  // Procesar cada día de la semana
  for (const date of weekDates) {
    // Obtener pedidos del día
    const { data: pedidosData } = await supabase
      .from("pedidos")
      .select("*, trabajador_id")
      .eq("fecha_entrega", date)
      .order("created_at", { ascending: false })

    const pedidos: PedidoCompleto[] = pedidosData || []
    const resumen = calculateResumenCocina(pedidos, trabajadores)

    const [year, month, day] = date.split("-")
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
    const dayName = dateObj.toLocaleDateString("es-ES", { weekday: "long" })
    const dayMonth = dateObj.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
    const sheetName = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayMonth.replace("/", "-")}`

    const worksheet = workbook.addWorksheet(sheetName)

    let currentRow = 1

    // Header principal
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
    const headerCell = worksheet.getCell(`A${currentRow}`)
    headerCell.value = `Resumen Cocina - ${sheetName}`
    headerCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } }
    headerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: headerColor },
    }
    headerCell.alignment = { vertical: "middle", horizontal: "center" }
    worksheet.getRow(currentRow).height = 30
    currentRow++

    // Total de pedidos
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
    const totalCell = worksheet.getCell(`A${currentRow}`)
    totalCell.value = `Total: ${resumen.totalGeneral} pedidos`
    totalCell.font = { bold: true, size: 12 }
    totalCell.alignment = { vertical: "middle", horizontal: "center" }
    worksheet.getRow(currentRow).height = 25
    currentRow++

    currentRow++ // Espacio

    // Minuta Tipo 1
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
    const minuta1Header = worksheet.getCell(`A${currentRow}`)
    minuta1Header.value = `MINUTA TIPO 1 (${resumen.totalMinuta1} pedidos)`
    minuta1Header.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } }
    minuta1Header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: minuta1Color },
    }
    minuta1Header.alignment = { vertical: "middle", horizontal: "center" }
    worksheet.getRow(currentRow).height = 25
    currentRow++

    // Headers de columnas para Minuta 1
    const headers1 = ["Opción", "Cantidad", "Empresa", "Cantidad por Empresa"]
    headers1.forEach((header, idx) => {
      const cell = worksheet.getCell(currentRow, idx + 1)
      cell.value = header
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: minuta1Color },
      }
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })
    currentRow++

    // Datos Minuta 1
    resumen.minuta1.forEach((opcion) => {
      opcion.porEmpresa.forEach((empresa, idx) => {
        const row = worksheet.getRow(currentRow)

        if (idx === 0) {
          row.getCell(1).value = opcion.descripcion
          row.getCell(2).value = opcion.cantidadTotal
        }

        row.getCell(3).value = empresa.empresa
        row.getCell(4).value = empresa.cantidad

        // Aplicar estilos solo a celdas con datos
        ;[1, 2, 3, 4].forEach((colNum) => {
          const cell = row.getCell(colNum)
          if (cell.value) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F0FDF4" }, // Verde muy claro
            }
            cell.border = {
              top: { style: "thin", color: { argb: "D1D5DB" } },
              left: { style: "thin", color: { argb: "D1D5DB" } },
              bottom: { style: "thin", color: { argb: "D1D5DB" } },
              right: { style: "thin", color: { argb: "D1D5DB" } },
            }
            cell.alignment = { vertical: "middle", horizontal: idx < 2 ? "left" : "center" }
          }
        })

        currentRow++
      })
    })

    currentRow++ // Espacio

    // Minuta Tipo 2
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
    const minuta2Header = worksheet.getCell(`A${currentRow}`)
    minuta2Header.value = `MINUTA TIPO 2 (${resumen.totalMinuta2} pedidos)`
    minuta2Header.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } }
    minuta2Header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: minuta2Color },
    }
    minuta2Header.alignment = { vertical: "middle", horizontal: "center" }
    worksheet.getRow(currentRow).height = 25
    currentRow++

    // Headers de columnas para Minuta 2
    const headers2 = ["Opción", "Cantidad", "Empresa", "Cantidad por Empresa"]
    headers2.forEach((header, idx) => {
      const cell = worksheet.getCell(currentRow, idx + 1)
      cell.value = header
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: minuta2Color },
      }
      cell.alignment = { vertical: "middle", horizontal: "center" }
    })
    currentRow++

    // Datos Minuta 2
    resumen.minuta2.forEach((opcion) => {
      opcion.porEmpresa.forEach((empresa, idx) => {
        const row = worksheet.getRow(currentRow)

        if (idx === 0) {
          row.getCell(1).value = opcion.descripcion
          row.getCell(2).value = opcion.cantidadTotal
        }

        row.getCell(3).value = empresa.empresa
        row.getCell(4).value = empresa.cantidad

        // Aplicar estilos solo a celdas con datos
        ;[1, 2, 3, 4].forEach((colNum) => {
          const cell = row.getCell(colNum)
          if (cell.value) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F0FDF4" }, // Verde muy claro
            }
            cell.border = {
              top: { style: "thin", color: { argb: "D1D5DB" } },
              left: { style: "thin", color: { argb: "D1D5DB" } },
              bottom: { style: "thin", color: { argb: "D1D5DB" } },
              right: { style: "thin", color: { argb: "D1D5DB" } },
            }
            cell.alignment = { vertical: "middle", horizontal: idx < 2 ? "left" : "center" }
          }
        })

        currentRow++
      })
    })

    // Ajustar anchos de columna
    worksheet.getColumn(1).width = 40
    worksheet.getColumn(2).width = 15
    worksheet.getColumn(3).width = 30
    worksheet.getColumn(4).width = 20
  }

  // Generar archivo
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  const [year1, month1, day1] = weekDates[0].split("-")
  const firstDate = new Date(Number(year1), Number(month1) - 1, Number(day1))
  const [year2, month2, day2] = weekDates[6].split("-")
  const lastDate = new Date(Number(year2), Number(month2) - 1, Number(day2))
  const fileName = `Resumen_Cocina_Semana_${firstDate.getDate()}-${lastDate.getDate()}_${firstDate.toLocaleDateString("es-ES", { month: "short" })}_${firstDate.getFullYear()}.xlsx`

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  window.URL.revokeObjectURL(url)
}

export async function exportCocinaDay(date: string, trabajadores: Trabajador[]) {
  const workbook = new ExcelJS.Workbook()

  // Colores de la paleta verde
  const headerColor = "166534" // Verde oscuro
  const minuta1Color = "16a34a" // Verde medio
  const minuta2Color = "22c55e" // Verde claro

  // Obtener pedidos del día
  const { data: pedidosData } = await supabase
    .from("pedidos")
    .select("*, trabajador_id")
    .eq("fecha_entrega", date)
    .order("created_at", { ascending: false })

  const pedidos: PedidoCompleto[] = pedidosData || []
  const resumen = calculateResumenCocina(pedidos, trabajadores)

  const [year, month, day] = date.split("-")
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
  const dayName = dateObj.toLocaleDateString("es-ES", { weekday: "long" })
  const dayMonth = dateObj.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
  const sheetName = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayMonth.replace("/", "-")}`

  const worksheet = workbook.addWorksheet(sheetName)

  let currentRow = 1

  // Header principal
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
  const headerCell = worksheet.getCell(`A${currentRow}`)
  headerCell.value = `Resumen Cocina - ${sheetName}`
  headerCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } }
  headerCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: headerColor },
  }
  headerCell.alignment = { vertical: "middle", horizontal: "center" }
  worksheet.getRow(currentRow).height = 30
  currentRow++

  // Total de pedidos
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
  const totalCell = worksheet.getCell(`A${currentRow}`)
  totalCell.value = `Total: ${resumen.totalGeneral} pedidos`
  totalCell.font = { bold: true, size: 12 }
  totalCell.alignment = { vertical: "middle", horizontal: "center" }
  worksheet.getRow(currentRow).height = 25
  currentRow++

  currentRow++ // Espacio

  // Minuta Tipo 1
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
  const minuta1Header = worksheet.getCell(`A${currentRow}`)
  minuta1Header.value = `MINUTA TIPO 1 (${resumen.totalMinuta1} pedidos)`
  minuta1Header.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } }
  minuta1Header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: minuta1Color },
  }
  minuta1Header.alignment = { vertical: "middle", horizontal: "center" }
  worksheet.getRow(currentRow).height = 25
  currentRow++

  // Headers de columnas para Minuta 1
  const headers1 = ["Opción", "Cantidad", "Empresa", "Cantidad por Empresa"]
  headers1.forEach((header, idx) => {
    const cell = worksheet.getCell(currentRow, idx + 1)
    cell.value = header
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: minuta1Color },
    }
    cell.alignment = { vertical: "middle", horizontal: "center" }
  })
  currentRow++

  // Datos Minuta 1
  resumen.minuta1.forEach((opcion) => {
    opcion.porEmpresa.forEach((empresa, idx) => {
      const row = worksheet.getRow(currentRow)

      if (idx === 0) {
        row.getCell(1).value = opcion.descripcion
        row.getCell(2).value = opcion.cantidadTotal
      }

      row.getCell(3).value = empresa.empresa
      row.getCell(4).value = empresa.cantidad

      // Aplicar estilos solo a celdas con datos
      ;[1, 2, 3, 4].forEach((colNum) => {
        const cell = row.getCell(colNum)
        if (cell.value) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F0FDF4" },
          }
          cell.border = {
            top: { style: "thin", color: { argb: "D1D5DB" } },
            left: { style: "thin", color: { argb: "D1D5DB" } },
            bottom: { style: "thin", color: { argb: "D1D5DB" } },
            right: { style: "thin", color: { argb: "D1D5DB" } },
          }
          cell.alignment = { vertical: "middle", horizontal: idx < 2 ? "left" : "center" }
        }
      })

      currentRow++
    })
  })

  currentRow++ // Espacio

  // Minuta Tipo 2
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
  const minuta2Header = worksheet.getCell(`A${currentRow}`)
  minuta2Header.value = `MINUTA TIPO 2 (${resumen.totalMinuta2} pedidos)`
  minuta2Header.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } }
  minuta2Header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: minuta2Color },
  }
  minuta2Header.alignment = { vertical: "middle", horizontal: "center" }
  worksheet.getRow(currentRow).height = 25
  currentRow++

  // Headers de columnas para Minuta 2
  const headers2 = ["Opción", "Cantidad", "Empresa", "Cantidad por Empresa"]
  headers2.forEach((header, idx) => {
    const cell = worksheet.getCell(currentRow, idx + 1)
    cell.value = header
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: minuta2Color },
    }
    cell.alignment = { vertical: "middle", horizontal: "center" }
  })
  currentRow++

  // Datos Minuta 2
  resumen.minuta2.forEach((opcion) => {
    opcion.porEmpresa.forEach((empresa, idx) => {
      const row = worksheet.getRow(currentRow)

      if (idx === 0) {
        row.getCell(1).value = opcion.descripcion
        row.getCell(2).value = opcion.cantidadTotal
      }

      row.getCell(3).value = empresa.empresa
      row.getCell(4).value = empresa.cantidad

      // Aplicar estilos solo a celdas con datos
      ;[1, 2, 3, 4].forEach((colNum) => {
        const cell = row.getCell(colNum)
        if (cell.value) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F0FDF4" },
          }
          cell.border = {
            top: { style: "thin", color: { argb: "D1D5DB" } },
            left: { style: "thin", color: { argb: "D1D5DB" } },
            bottom: { style: "thin", color: { argb: "D1D5DB" } },
            right: { style: "thin", color: { argb: "D1D5DB" } },
          }
          cell.alignment = { vertical: "middle", horizontal: idx < 2 ? "left" : "center" }
        }
      })

      currentRow++
    })
  })

  // Ajustar anchos de columna
  worksheet.getColumn(1).width = 40
  worksheet.getColumn(2).width = 15
  worksheet.getColumn(3).width = 30
  worksheet.getColumn(4).width = 20

  // Generar archivo
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  const fileName = `Resumen_Cocina_${sheetName}.xlsx`

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  window.URL.revokeObjectURL(url)
}
