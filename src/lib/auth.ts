import { supabase } from "./supabase"
import type { Trabajador, Empresa } from "@/types/database"

// Función para obtener el nombre completo (ya viene completo en la BD)
export function getFullName(trabajador: Trabajador): string {
  return trabajador.nombre_completo
}

// Función para obtener todas las empresas únicas
export async function getAllCompanies(): Promise<Empresa[]> {
  try {
    console.log("Fetching companies from Supabase...")

    const { data, error } = await supabase
      .from("trabajadores")
      .select("empresa")
      .eq("activo", true)
      .not("empresa", "is", null)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    // Agrupar por empresa y contar trabajadores
    const empresasMap = new Map<string, number>()

    data?.forEach((row) => {
      if (row.empresa) {
        const count = empresasMap.get(row.empresa) || 0
        empresasMap.set(row.empresa, count + 1)
      }
    })

    const empresas: Empresa[] = Array.from(empresasMap.entries())
      .map(([nombre, trabajadores_count]) => ({
        nombre,
        trabajadores_count,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))

    console.log("Companies fetched successfully:", empresas.length, "companies")
    return empresas
  } catch (error) {
    console.error("Error fetching companies:", error)
    return []
  }
}

// Función para obtener trabajadores por empresa
export async function getUsersByCompany(empresa: string): Promise<Trabajador[]> {
  try {
    console.log("Fetching trabajadores by company from Supabase...", empresa)

    const { data, error } = await supabase
      .from("trabajadores")
      .select("*")
      .eq("activo", true)
      .eq("empresa", empresa)
      .order("nombre_completo")

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log("Trabajadores by company fetched successfully:", data?.length || 0, "users")
    return data || []
  } catch (error) {
    console.error("Error fetching trabajadores by company:", error)
    return []
  }
}

// Función para obtener todos los trabajadores activos
export async function getAllUsers(): Promise<Trabajador[]> {
  try {
    console.log("Fetching trabajadores from Supabase...")

    const { data, error } = await supabase.from("trabajadores").select("*").eq("activo", true).order("nombre_completo")

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log("Trabajadores fetched successfully:", data?.length || 0, "users")
    return data || []
  } catch (error) {
    console.error("Error fetching trabajadores:", error)
    return []
  }
}

// Función de login que verifica nombre y contraseña
export async function signInWithCredentials(nombreCompleto: string, password: string) {
  try {
    console.log("Attempting to sign in with:", nombreCompleto)

    // Buscar el trabajador por nombre completo
    const { data: trabajador, error: trabajadorError } = await supabase
      .from("trabajadores")
      .select("*")
      .eq("nombre_completo", nombreCompleto)
      .eq("activo", true)
      .single()

    if (trabajadorError) {
      console.error("Trabajador error:", trabajadorError)
      throw new Error("Usuario no encontrado")
    }

    if (!trabajador) {
      throw new Error("Usuario no encontrado")
    }

    // Verificar contraseña contra la almacenada en la base de datos
    if (password !== trabajador.contraseña) {
      throw new Error("Contraseña incorrecta")
    }

    console.log("Login successful for:", trabajador.nombre_completo)

    // Crear sesión
    const sessionData = {
      user: {
        id: trabajador.id.toString(),
        email: `${trabajador.rut}@empresa.com`,
        user_metadata: {
          full_name: trabajador.nombre_completo,
          trabajador_id: trabajador.id,
          rut: trabajador.rut,
          rol: trabajador.rol,
          turno_habitual: trabajador.turno_habitual,
          empresa: trabajador.empresa,
        },
      },
      trabajador: trabajador,
    }

    localStorage.setItem("supabase_session", JSON.stringify(sessionData))

    // Disparar evento personalizado para notificar al AuthContext
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sessionUpdated"))
    }

    return { data: sessionData, error: null }
  } catch (error) {
    console.error("Error in signInWithCredentials:", error)
    throw error
  }
}

// Función para verificar la conexión con Supabase
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("trabajadores").select("count").limit(1)

    if (error) {
      console.error("Connection test failed:", error)
      return false
    }

    console.log("Supabase connection successful")
    return true
  } catch (error) {
    console.error("Connection test error:", error)
    return false
  }
}

// Función para obtener la sesión actual
export async function getCurrentSession() {
  try {
    const sessionData = localStorage.getItem("supabase_session")
    if (!sessionData) return null

    return JSON.parse(sessionData)
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Función para cerrar sesión
export async function signOut() {
  localStorage.removeItem("supabase_session")

  // Disparar evento personalizado para notificar al AuthContext
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sessionUpdated"))
  }

  window.location.href = "/login"
}

export async function signInWithEmail() {
  throw new Error("Login por email no implementado en este sistema")
}

export async function signUpWithEmail() {
  throw new Error("Registro no implementado en este sistema")
}

export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}

export async function getProfile(userId: string): Promise<Trabajador | null> {
  try {
    const { data, error } = await supabase.from("trabajadores").select("*").eq("id", Number.parseInt(userId)).single()

    if (error) {
      console.error("Error fetching trabajador:", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Error in getProfile:", error)
    return null
  }
}

export async function updateProfile(userId: string, updates: Partial<Trabajador>) {
  const { data, error } = await supabase
    .from("trabajadores")
    .update(updates)
    .eq("id", Number.parseInt(userId))
    .select()
    .single()

  if (error) throw error
  return data
}

// Mantener compatibilidad con función anterior
export async function signInWithName(nombreCompleto: string) {
  const expectedPassword = generatePassword(nombreCompleto)
  return signInWithCredentials(nombreCompleto, expectedPassword)
}

// Función para generar contraseña automática basada en nombre completo
function generatePassword(nombreCompleto: string): string {
  if (!nombreCompleto) return ""

  const nameParts = nombreCompleto.trim().split(" ")
  if (nameParts.length < 2) return ""

  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1] // Tomar el último apellido

  // Primera letra del nombre + apellido completo, todo en mayúsculas
  return (firstName.charAt(0) + lastName).toUpperCase()
}
