import * as XLSX from "xlsx"

export interface ParsedWorker {
  nombre_completo: string
  empresa: string
}

export interface ParseResult {
  workers: ParsedWorker[]
  errors: string[]
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        const workers: ParsedWorker[] = []
        const errors: string[] = []

        // Skip header row (index 0)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]

          // Skip empty rows
          if (!row || row.length === 0 || (!row[0] && !row[1])) {
            continue
          }

          const nombre = row[0]?.toString().trim()
          const empresa = row[1]?.toString().trim()

          // Validate required fields
          if (!nombre) {
            errors.push(`Fila ${i + 1}: Nombre vacío`)
            continue
          }

          if (!empresa) {
            errors.push(`Fila ${i + 1}: Empresa vacía`)
            continue
          }

          workers.push({
            nombre_completo: nombre,
            empresa: empresa,
          })

          // Limit to 500 workers
          if (workers.length >= 500) {
            errors.push("Límite de 500 trabajadores alcanzado. Los demás fueron ignorados.")
            break
          }
        }

        resolve({ workers, errors })
      } catch {
        resolve({
          workers: [],
          errors: ["Error al leer el archivo Excel. Verifica que el formato sea correcto."],
        })
      }
    }

    reader.onerror = () => {
      resolve({
        workers: [],
        errors: ["Error al leer el archivo. Intenta nuevamente."],
      })
    }

    reader.readAsBinaryString(file)
  })
}

export function generateExcelTemplate(): void {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Nombre Completo", "Empresa"],
    ["Juan Pérez González", "ABC Corp"],
    ["María López Silva", "XYZ Ltd"],
    ["Pedro Soto Ramírez", "DEF Inc"],
  ])

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Trabajadores")

  // Generate blob and download manually (works in browser)
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([wbout], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "plantilla_trabajadores.xlsx"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
