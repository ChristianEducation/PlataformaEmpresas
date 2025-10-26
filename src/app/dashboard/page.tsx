"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Header from "@/components/dashboard/Header"
import Calendar from "@/components/dashboard/Calendar"
import ShiftSelector from "@/components/dashboard/ShiftSelector"
import PasswordChangeModal from "@/components/auth/PasswordChangeModal"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { supabase } from "@/lib/supabase"
import type { Shift } from "@/types/database"
import { Clock, CalendarIcon, ChefHat, Users, CheckCircle2 } from "lucide-react"

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  // Función para obtener la clave de localStorage específica del usuario
  const getStorageKey = () => {
    return profile ? `selectedShift_${profile.id}` : "selectedShift_default"
  }

  // Función para cargar el turno guardado
  const loadSavedShift = (): Shift | null => {
    if (typeof window === "undefined" || !profile) return null

    try {
      const savedShift = localStorage.getItem(getStorageKey())
      return savedShift ? JSON.parse(savedShift) : null
    } catch (error) {
      console.error("Error loading saved shift:", error)
      return null
    }
  }

  // Función para guardar el turno
  const saveShift = (shift: Shift | null) => {
    if (typeof window === "undefined" || !profile) return

    try {
      if (shift) {
        localStorage.setItem(getStorageKey(), JSON.stringify(shift))
      } else {
        localStorage.removeItem(getStorageKey())
      }
    } catch (error) {
      console.error("Error saving shift:", error)
    }
  }

  const [selectedShift, setSelectedShiftState] = useState<Shift | null>(null)
  const [showShiftSelector, setShowShiftSelector] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(() => {
    // Mostrar el mes próximo por defecto
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth
  })
  const [stats, setStats] = useState({
    totalOrders: 0,
    confirmedOrders: 0,
    pendingOrders: 0,
  })

  // Función personalizada para setear el turno que también lo guarda
  const setSelectedShift = (shift: Shift | null) => {
    setSelectedShiftState(shift)
    saveShift(shift)
  }

  // Cargar el turno guardado cuando el perfil esté disponible
  useEffect(() => {
    if (profile && !selectedShift) {
      const savedShift = loadSavedShift()
      if (savedShift) {
        setSelectedShiftState(savedShift)
        console.log("Turno cargado automáticamente:", savedShift.name)
      }
    }
  }, [profile])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Verificar si es el primer inicio de sesión
  useEffect(() => {
    if (profile && profile.sesion === null) {
      setShowPasswordModal(true)
    }
  }, [profile])

  // Function to map shift names to the expected database values
  const mapShiftToTurno = (shiftName: string, startTime?: string): string => {
    const name = shiftName.toLowerCase()
    if (name.includes("día") || name.includes("dia") || name.includes("day")) {
      return "dia"
    } else if (name.includes("noche") || name.includes("night")) {
      return "noche"
    }
    // Default fallback based on time
    if (
      startTime &&
      (startTime.includes("06:") || startTime.includes("6:") || startTime.includes("07:") || startTime.includes("7:"))
    ) {
      return "dia"
    } else {
      return "noche"
    }
  }

  const fetchStats = useCallback(async () => {
    if (!user || !selectedShift || !profile) return

    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // Map shift name to expected database value
      const turnoElegido = mapShiftToTurno(selectedShift.name, selectedShift.start_time)

      // Build query using the correct table and field names
      let query = supabase
        .from("pedidos")
        .select("id, created_at")
        .eq("nombre_trabajador", profile.nombre_completo)
        .eq("turno_elegido", turnoElegido)
        .gte("fecha_entrega", startOfMonth.toISOString().split("T")[0])
        .lte("fecha_entrega", endOfMonth.toISOString().split("T")[0])

      // Only filter by RUT if it exists
      if (profile.rut) {
        query = query.eq("rut_trabajador", profile.rut)
      }

      const { data, error } = await query

      if (error) throw error

      const orders = data || []

      // Since pedidos table doesn't have status field, all orders are considered confirmed
      setStats({
        totalOrders: orders.length,
        confirmedOrders: orders.length, // All orders in pedidos are confirmed
        pendingOrders: 0, // No pending orders in current schema
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }, [user, selectedShift, currentDate, profile])

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  useEffect(() => {
    if (user && selectedShift && profile) {
      fetchStats()
    }
  }, [user, selectedShift, currentDate, fetchStats, profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Plataforma de Pedidos de Almuerzo</h1>
                  <p className="text-slate-600 text-lg">
                    Bienvenido, <span className="font-semibold text-indigo-600">{profile?.nombre_completo}</span>
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-600">Sistema Activo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">{profile?.rol || "Empleado"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shift Selection Card */}
              <div className="text-right">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  {selectedShift ? (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">{selectedShift.name}</p>
                      <p className="text-xs text-slate-500">
                        {selectedShift.start_time} - {selectedShift.end_time}
                      </p>
                      {loadSavedShift() && <p className="text-xs text-green-600 mt-1">✓ Turno guardado</p>}
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700">Sin turno seleccionado</p>
                      <p className="text-xs text-slate-500">Selecciona tu turno de trabajo</p>
                    </div>
                  )}

                  <Button
                    onClick={() => setShowShiftSelector(true)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {selectedShift ? "Cambiar Turno" : "Seleccionar Turno"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 capitalize">
                    Calendario de Almuerzos - {getMonthName(currentDate)}
                  </h2>
                  <p className="text-slate-600">Planifica y gestiona tus pedidos de almuerzo del mes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {selectedShift && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total de Pedidos</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
                    <p className="text-xs text-slate-500 mt-1">Este mes</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Confirmados</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.confirmedOrders}</p>
                    <p className="text-xs text-slate-500 mt-1">Listos para entrega</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.pendingOrders}</p>
                    <p className="text-xs text-slate-500 mt-1">En proceso</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar */}
        <Calendar selectedShift={selectedShift} currentDate={currentDate} onDateChange={setCurrentDate} />
      </main>

      {/* Shift Selector Modal */}
      {showShiftSelector && (
        <ShiftSelector
          selectedShift={selectedShift}
          onShiftSelect={setSelectedShift}
          onClose={() => setShowShiftSelector(false)}
        />
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          title="Primer inicio de sesión"
        />
      )}
    </div>
  )
}
