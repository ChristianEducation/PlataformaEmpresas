import * as XLSX from "xlsx"
import type { Menu } from "@/types/database"

const CATEGORIA_MAP: Record<string, string> = {
  MENU: "1",
  ESPECIAL: "2",
  "PROTEINA ENSALADA": "3",
  HIPO: "4",
  "COLACION ESPECIAL": "5",
  "DIETA BLANDA": "6",
}

const DIA_SEMANA_MAP: Record<string, string> = {
  LUNES: "lunes",
  MARTES: "martes",
  MIERCOLES: "miercoles",
  JUEVES: "jueves",
  VIERNES: "viernes",
  SABADO: "sabado",
  DOMINGO: "domingo",
}

export async function parseExcelToMenus(file: File, month: number, year: number, tipoMinuta: number): Promise<Menu[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]

        if (jsonData.length < 2) {
          throw new Error("El Excel no tiene suficientes datos")
        }

        const headers = jsonData[0] as string[]
        const categoryColumn = jsonData.slice(1).map((row) => row[0])

        const menus: Menu[] = []

        for (let colIdx = 1; colIdx < headers.length; colIdx++) {
          const header = headers[colIdx]
          if (!header || typeof header !== "string") continue

          const headerParts = header.trim().split(" ")
          if (headerParts.length < 2) continue

          const diaSemanaRaw = headerParts[0].toUpperCase()
          const numeroDia = Number.parseInt(headerParts[1])

          if (!DIA_SEMANA_MAP[diaSemanaRaw] || isNaN(numeroDia)) continue

          const diaSemana = DIA_SEMANA_MAP[diaSemanaRaw]
          const fecha = `${year}-${String(month).padStart(2, "0")}-${String(numeroDia).padStart(2, "0")}`

          for (let rowIdx = 1; rowIdx < jsonData.length; rowIdx++) {
            const categoria = categoryColumn[rowIdx - 1]
            if (!categoria || typeof categoria !== "string") continue

            const categoriaTrimmed = categoria.trim().toUpperCase()

            if (categoriaTrimmed === "POSTRE") continue

            const codigoOpcion = CATEGORIA_MAP[categoriaTrimmed]
            if (!codigoOpcion) continue

            const descripcion = jsonData[rowIdx][colIdx]
            if (!descripcion || typeof descripcion !== "string") continue

            const descripcionTrimmed = descripcion.trim()
            if (descripcionTrimmed === "" || descripcionTrimmed.toUpperCase() === "NO APLICA") continue

            menus.push({
              id: 0,
              fecha,
              dia_semana: diaSemana,
              numero_dia: numeroDia,
              codigo_opcion: codigoOpcion,
              descripcion_opcion: descripcionTrimmed,
              categoria: categoriaTrimmed,
              activa: true,
              created_at: new Date().toISOString(),
              tipo_minuta: tipoMinuta,
            })
          }
        }

        resolve(menus)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"))
    }

    reader.readAsBinaryString(file)
  })
}
