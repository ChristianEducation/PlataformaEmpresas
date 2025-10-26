"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Eye, EyeOff } from "lucide-react"
import type { Trabajador } from "@/types/database"

interface WorkerModalProps {
  isOpen: boolean
  editingWorker: Trabajador | null
  onClose: () => void
  onSubmit: (workerData: {
    nombre_completo: string
    empresa: string
    tipo_minuta: number
    contraseña?: string
    rol?: string
  }) => void
}

export function WorkerModal({ isOpen, editingWorker, onClose, onSubmit }: WorkerModalProps) {
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const isEditMode = editingWorker !== null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {isEditMode ? "Editar Trabajador" : "Agregar Nuevo Trabajador"}
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const workerData: any = {
              nombre_completo: formData.get("nombre_completo") as string,
              empresa: formData.get("empresa") as string,
              tipo_minuta: Number.parseInt(formData.get("tipo_minuta") as string) || 1,
              rol: formData.get("rol") as string,
            }

            if (isEditMode) {
              workerData.contraseña = formData.get("contraseña") as string
            }

            onSubmit(workerData)
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo *</label>
              <Input
                name="nombre_completo"
                type="text"
                required
                defaultValue={editingWorker?.nombre_completo || ""}
                placeholder="Ej: Juan Pérez González"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Empresa *</label>
              <Input
                name="empresa"
                type="text"
                required
                defaultValue={editingWorker?.empresa || ""}
                placeholder="Ej: METALMECANICA TORMENTAL"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Minuta *</label>
              <Input
                name="tipo_minuta"
                type="number"
                min="1"
                max="9"
                required
                defaultValue={editingWorker?.tipo_minuta || 1}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rol *</label>
              <select
                name="rol"
                required
                defaultValue={editingWorker?.rol || "usuario"}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña *</label>
                <div className="relative">
                  <Input
                    name="contraseña"
                    type={showPassword ? "text" : "password"}
                    required
                    defaultValue={editingWorker?.contraseña || ""}
                    placeholder="Ingrese contraseña"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isEditMode ? "Actualizar" : "Crear"} Trabajador
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
