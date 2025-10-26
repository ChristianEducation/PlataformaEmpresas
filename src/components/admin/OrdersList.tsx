'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Pedido } from '@/types/database'
import { 
  CheckCircle2, 
  Package,
} from 'lucide-react'

interface OrdersListProps {
  selectedDate: string
  searchTerm: string
  shiftFilter?: string
}

export default function OrdersList({ selectedDate, searchTerm, shiftFilter }: OrdersListProps) {
  const [orders, setOrders] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('pedidos')
        .select('*')
        .eq('fecha_entrega', selectedDate)
        .order('created_at', { ascending: false })

      if (shiftFilter && shiftFilter !== 'all') {
        // Map filter to database values
        const turnoFilter = shiftFilter.toLowerCase() === 'día' || shiftFilter.toLowerCase() === 'dia' ? 'dia' : 'noche'
        query = query.eq('turno_elegido', turnoFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching orders:', error)
        throw error
      }

      let filteredOrders = data || []

      // Filtrar por término de búsqueda
      if (searchTerm) {
        filteredOrders = filteredOrders.filter(order =>
          order.nombre_trabajador.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.rut_trabajador && order.rut_trabajador.includes(searchTerm)) ||
          order.descripcion_opcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.empresa.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setOrders(filteredOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, searchTerm, shiftFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const getStatusColor = () => {
    // Since pedidos table doesn't have status, we'll use confirmed style
    return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }

  const getStatusText = () => {
    // Since pedidos table doesn't have status, we'll show "Confirmado"
    return 'Confirmado'
  }

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lista de Pedidos</CardTitle>
          <div className="text-sm text-slate-600">
            Total: {orders.length} pedidos
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos</h3>
            <p className="text-slate-600">No se encontraron pedidos para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center text-white font-semibold">
                      {order.nombre_trabajador.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{order.nombre_trabajador}</h4>
                      <p className="text-sm text-slate-600">
                        {order.rut_trabajador ? `${order.rut_trabajador} • ` : ''}
                        {order.turno_elegido === 'dia' ? 'Turno Día' : 'Turno Noche'} • {order.empresa}
                      </p>
                      <p className="text-sm font-medium text-slate-800 mt-1">
                        {order.descripcion_opcion} ({order.codigo_opcion})
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.categoria_opcion}
                      </p>
                      {order.notas && (
                        <p className="text-xs text-slate-500 mt-1">Nota: {order.notas}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{getStatusText()}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
