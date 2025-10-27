"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, Download, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { parseExcelFile, generateExcelTemplate, type ParsedWorker } from "../utils/excelParser"

interface ImportExcelModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (workers: ParsedWorker[], tipoMinuta: number) => Promise<void>
}

export function ImportExcelModal({ isOpen, onClose, onImport }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [workers, setWorkers] = useState<ParsedWorker[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [tipoMinuta, setTipoMinuta] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setIsProcessing(true)

    const result = await parseExcelFile(selectedFile)
    setWorkers(result.workers)
    setErrors(result.errors)
    setIsProcessing(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
      handleFileSelect(droppedFile)
    } else {
      setErrors(["Por favor, sube un archivo Excel (.xlsx o .xls)"])
    }
  }

  const handleImport = async () => {
    if (workers.length === 0) return

    setIsProcessing(true)
    try {
      await onImport(workers, tipoMinuta)
      onClose()
      // Reset state
      setFile(null)
      setWorkers([])
      setErrors([])
      setTipoMinuta(1)
    } catch {
      setErrors(["Error al importar trabajadores. Intenta nuevamente."])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Importar Trabajadores en Masa</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Upload File */}
          <div className="space-y-3">
            <h3 className="font-medium text-slate-900">Paso 1: Subir archivo Excel</h3>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
              }`}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 font-medium mb-1">
                {file ? file.name : "Arrastra tu archivo Excel o haz click para subir"}
              </p>
              <p className="text-sm text-slate-500">Formato: .xlsx, .xls</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) handleFileSelect(selectedFile)
                }}
                className="hidden"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">Formato esperado del Excel:</p>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-slate-300 text-sm bg-white">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-700">
                        Nombre Completo
                      </th>
                      <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-700">
                        Empresa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2 text-slate-600">Juan Pérez González</td>
                      <td className="border border-slate-300 px-4 py-2 text-slate-600">ABC Corp</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2 text-slate-600">María López Silva</td>
                      <td className="border border-slate-300 px-4 py-2 text-slate-600">XYZ Ltd</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2 text-slate-600">Pedro Soto Ramírez</td>
                      <td className="border border-slate-300 px-4 py-2 text-slate-600">DEF Inc</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Button onClick={generateExcelTemplate} variant="outline" size="sm" className="mt-2 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Descargar plantilla Excel
              </Button>
            </div>
          </div>

          {/* Step 2: Configuration */}
          {workers.length > 0 && (
            <>
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <h3 className="font-medium text-slate-900">Paso 2: Configuración general</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Minuta (para todos) *</label>
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={tipoMinuta}
                    onChange={(e) => setTipoMinuta(Number.parseInt(e.target.value) || 1)}
                    className="w-32"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Rol:</span> usuario (automático)
                  </p>
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Contraseña:</span> generada automáticamente por Supabase
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <h3 className="font-medium text-slate-900">
                  Preview ({workers.length} trabajador{workers.length !== 1 ? "es" : ""})
                </h3>

                <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {workers.slice(0, 10).map((worker, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-slate-700">
                        {worker.nombre_completo} - {worker.empresa}
                      </span>
                    </div>
                  ))}
                  {workers.length > 10 && (
                    <p className="text-sm text-slate-500 italic">... y {workers.length - 10} más</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center text-red-800 font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>Advertencias:</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end space-x-3">
          <Button onClick={onClose} variant="outline" disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={workers.length === 0 || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isProcessing
              ? "Importando..."
              : `Importar ${workers.length} trabajador${workers.length !== 1 ? "es" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
