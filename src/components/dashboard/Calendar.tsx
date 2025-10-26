"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import OrderModal from "./OrderModal"
import type { Pedido, Shift, Menu } from "@/types/database"
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Clock, Edit, CalendarIcon } from "lucide-react"

interface CalendarProps {
  selectedShift: Shift | null
  currentDate: Date
  onDateChange: (date: Date) => void
}

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

export default function Calendar({ selectedShift, currentDate, onDateChange }: CalendarProps) {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState<Pedido[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!user || !profile || !selectedShift) return

    try {
      setLoading(true)
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // Map shift name to expected database value
      // Map shift name to expected database value
      const turnoElegido = mapShiftToTurno(selectedShift.name, selectedShift.start_time)
      // Build query - use nombre_trabajador as primary identifier
      let query = supabase
        .from("pedidos")
        .select("*")
        .eq("nombre_trabajador", profile.nombre_completo)
        .eq("turno_elegido", turnoElegido)
        .gte("fecha_entrega", startOfMonth.toISOString().split("T")[0])
        .lte("fecha_entrega", endOfMonth.toISOString().split("T")[0])
        .order("fecha_entrega", { ascending: true })

      // Only filter by RUT if it exists
      if (profile.rut) {
        query = query.eq("rut_trabajador", profile.rut)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching orders:", error)
        throw error
      }

      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }, [user, profile, selectedShift, currentDate])

  const fetchMenus = useCallback(async () => {
    if (!profile) return

    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("activa", true)
        .eq("tipo_minuta", profile.tipo_minuta)
        .gte("fecha", startOfMonth.toISOString().split("T")[0])
        .lte("fecha", endOfMonth.toISOString().split("T")[0])
        .order("fecha", { ascending: true })
        .order("categoria", { ascending: true })

      if (error) throw error
      setMenus(data || [])
    } catch (error) {
      console.error("Error fetching menus:", error)
    } finally {
      setLoading(false)
    }
  }, [currentDate, profile])

  useEffect(() => {
    if (selectedShift) {
      fetchOrders()
      fetchMenus()
    }
  }, [selectedShift, currentDate, user, profile, fetchOrders, fetchMenus])

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getOrderForDate = (date: Date): Pedido | null => {
    const dateStr = date.toISOString().split("T")[0]
    return orders.find((order) => order.fecha_entrega === dateStr) || null
  }

  const getMenusForDate = (date: Date): Menu[] => {
    if (!profile) return []

    const dateStr = date.toISOString().split("T")[0]
    return menus.filter((menu) => menu.fecha === dateStr && menu.tipo_minuta === profile.tipo_minuta)
  }

  const handleDayClick = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) return // No permitir seleccionar días pasados

    const existingOrder = getOrderForDate(date)
    setSelectedDate(date)
    setSelectedOrder(existingOrder)
    setShowOrderModal(true)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    onDateChange(newDate)
  }

  const getStatusIcon = () => {
    // Since pedidos table doesn't have status, we'll show a confirmed icon for existing orders
    return <CheckCircle className="w-4 h-4 text-emerald-600" />
  }

  const getStatusColor = () => {
    // Since pedidos table doesn't have status, we'll use a default confirmed style
    return "bg-emerald-50 border-emerald-200"
  }

  const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  if (!selectedShift) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Selecciona un turno</h3>
            <p className="text-slate-600 max-w-sm">
              Para comenzar a gestionar tus pedidos, primero debes seleccionar tu turno de trabajo
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <p className="text-sm text-slate-600">Selecciona un día para gestionar tu pedido</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth().map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-20" />
                  }

                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const isToday = date.getTime() === today.getTime()
                  const isPast = date < today
                  const order = getOrderForDate(date)
                  const hasMenus = getMenusForDate(date).length > 0

                  return (
                    <div
                      key={date.toISOString()}
                      className={`
                        h-20 border border-slate-200 rounded-xl p-2 transition-all duration-200 relative
                        ${
                          isPast
                            ? "bg-slate-50 cursor-not-allowed opacity-60"
                            : hasMenus
                              ? "cursor-pointer hover:shadow-md hover:border-indigo-300 bg-white"
                              : "bg-slate-50 cursor-not-allowed opacity-40"
                        }
                        ${isToday ? "ring-2 ring-indigo-500 border-indigo-500" : ""}
                        ${order ? getStatusColor() : ""}
                      `}
                      onClick={() => !isPast && hasMenus && handleDayClick(date)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between">
                          <span
                            className={`
                            text-sm font-medium
                            ${isToday ? "text-indigo-600" : isPast ? "text-slate-400" : "text-slate-900"}
                          `}
                          >
                            {date.getDate()}
                          </span>
                          {isToday && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                          {order ? (
                            <div className="flex items-center space-x-1">
                              {getStatusIcon()}
                              <Edit className="w-3 h-3 text-slate-500" />
                            </div>
                          ) : hasMenus && !isPast ? (
                            <Plus className="w-4 h-4 text-slate-400" />
                          ) : null}
                        </div>

                        {order && <div className="text-xs text-slate-600 truncate">{order.descripcion_opcion}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Modal */}
      {showOrderModal && selectedDate && selectedShift && (
        <OrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          selectedDate={selectedDate}
          selectedShift={selectedShift}
          existingOrder={selectedOrder}
          onOrderSaved={() => {
            fetchOrders()
            setShowOrderModal(false)
          }}
          availableMenus={getMenusForDate(selectedDate)}
        />
      )}
    </>
  )
}
