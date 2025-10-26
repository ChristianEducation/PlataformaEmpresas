"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Upload, FileSpreadsheet } from "lucide-react"
import { parseExcelToMenus } from "../utils/excelParser"
import type { Menu } from "@/types/database"

interface UploadMinutaProps {
  onPreviewReady: (data: Menu[]) => void
  disabled?: boolean
}

export function UploadMinuta({ onPreviewReady, disabled }: UploadMinutaProps) {
  const [file, setFile] = useState<File | null>(null)
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [tipoMinuta, setTipoMinuta] = useState("1")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
    }
  }

  const handleProcess = async () => {
    if (!file) {
      setError("Selecciona un archivo Excel")
      return
    }

    if (!month || !year) {
      setError("Selecciona mes y año")
      return
    }

    setProcessing(true)
    setError("")

    try {
      const menus = await parseExcelToMenus(
        file,
        Number.parseInt(month),
        Number.parseInt(year),
        Number.parseInt(tipoMinuta),
      )

      if (menus.length === 0) {
        setError("No se encontraron datos válidos en el Excel")
        setProcessing(false)
        return
      }

      onPreviewReady(menus)
      setFile(null)
      setMonth("")
      setYear("")
      setTipoMinuta("1")
    } catch (err) {
      console.error("Error processing Excel:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el archivo Excel")
    } finally {
      setProcessing(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i)
  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  return (
    <Card className="border border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <CardTitle className="text-lg text-slate-900">Cargar Nueva Minuta</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Archivo Excel</label>
            <div className="flex items-center gap-3">
              <label
                className={`flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">{file ? file.name : "Seleccionar archivo"}</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={disabled}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mes</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Seleccionar</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Año</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Seleccionar</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo Minuta</label>
              <select
                value={tipoMinuta}
                onChange={(e) => setTipoMinuta(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="1">Tipo 1</option>
                <option value="2">Tipo 2</option>
                <option value="3">Tipo 3</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            onClick={handleProcess}
            disabled={!file || !month || !year || processing || disabled}
            className="w-full"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Procesar Excel
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
