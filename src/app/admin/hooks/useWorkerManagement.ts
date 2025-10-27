"use client"
import { supabase } from "@/lib/supabase"

interface WorkerData {
  nombre_completo: string
  empresa: string
  tipo_minuta: number
  contraseña?: string
  rol?: string
}

interface BulkImportResult {
  imported: number
  duplicates: number
  errors: string[]
}

export function useWorkerManagement(onSuccess?: () => void) {
  const handleCreateWorker = async (workerData: WorkerData) => {
    try {
      const { data, error } = await supabase
        .from("trabajadores")
        .insert([
          {
            nombre_completo: workerData.nombre_completo,
            empresa: workerData.empresa,
            tipo_minuta: workerData.tipo_minuta,
            rol: workerData.rol || "usuario",
          },
        ])
        .select()
        .single()

      if (error) throw error

      console.log("Worker created successfully:", data)
      if (onSuccess) onSuccess()
      return data
    } catch (error) {
      console.error("Error creating worker:", error)
      throw error
    }
  }

  const handleUpdateWorker = async (workerId: number, workerData: WorkerData) => {
    try {
      const updateData: Partial<{
        nombre_completo: string
        empresa: string
        tipo_minuta: number
        contraseña: string
        rol: string
      }> = {
        nombre_completo: workerData.nombre_completo,
        empresa: workerData.empresa,
        tipo_minuta: workerData.tipo_minuta,
      }

      if (workerData.contraseña) {
        updateData.contraseña = workerData.contraseña
      }

      if (workerData.rol) {
        updateData.rol = workerData.rol
      }

      const { data, error } = await supabase
        .from("trabajadores")
        .update(updateData)
        .eq("id", workerId)
        .select()
        .single()

      if (error) throw error

      console.log("Worker updated successfully:", data)
      if (onSuccess) onSuccess()
      return data
    } catch (error) {
      console.error("Error updating worker:", error)
      throw error
    }
  }

  const handleDeleteWorker = async (workerId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este trabajador?")) return

    try {
      const { error } = await supabase.from("trabajadores").update({ activo: false }).eq("id", workerId)

      if (error) throw error

      console.log("Worker deleted successfully")
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error deleting worker:", error)
      throw error
    }
  }

  const handleBulkCreateWorkers = async (
    workers: Array<{ nombre_completo: string; empresa: string }>,
    tipo_minuta: number,
  ): Promise<BulkImportResult> => {
    const result: BulkImportResult = {
      imported: 0,
      duplicates: 0,
      errors: [],
    }

    try {
      for (const worker of workers) {
        // Check for duplicates
        const { data: existing } = await supabase
          .from("trabajadores")
          .select("id")
          .eq("nombre_completo", worker.nombre_completo)
          .eq("empresa", worker.empresa)
          .maybeSingle()

        if (existing) {
          result.duplicates++
          continue
        }

        // Insert worker
        const { error } = await supabase.from("trabajadores").insert([
          {
            nombre_completo: worker.nombre_completo,
            empresa: worker.empresa,
            tipo_minuta: tipo_minuta,
            rol: "usuario",
          },
        ])

        if (error) {
          result.errors.push(`Error al importar ${worker.nombre_completo}: ${error.message}`)
        } else {
          result.imported++
        }
      }

      console.log("Bulk import completed:", result)
      if (onSuccess) onSuccess()
      return result
    } catch (error) {
      console.error("Error in bulk import:", error)
      throw error
    }
  }

  return {
    handleCreateWorker,
    handleUpdateWorker,
    handleDeleteWorker,
    handleBulkCreateWorkers,
  }
}
