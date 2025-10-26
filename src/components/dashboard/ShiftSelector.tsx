'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Shift } from '@/types/database'
import { 
  X, 
  Sun, 
  Moon, 
  Clock, 
  CheckCircle2,
  Loader2
} from 'lucide-react'

interface ShiftSelectorProps {
  selectedShift: Shift | null
  onShiftSelect: (shift: Shift) => void
  onClose: () => void
}

export default function ShiftSelector({ selectedShift, onShiftSelect, onClose }: ShiftSelectorProps) {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tempSelectedShift, setTempSelectedShift] = useState<Shift | null>(selectedShift)

  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('is_active', true)
        .order('start_time')

      if (error) throw error
      setShifts(data || [])
    } catch (err: unknown) {
      setError('Error al cargar los turnos')
      console.error('Error fetching shifts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (tempSelectedShift) {
      onShiftSelect(tempSelectedShift)
      onClose()
    }
  }

  const getShiftIcon = (shiftName: string, startTime: string) => {
    const name = shiftName.toLowerCase()
    const time = startTime.toLowerCase()
    
    if (name.includes('día') || name.includes('dia') || time.includes('06:') || time.includes('6:')) {
      return Sun
    } else if (name.includes('noche') || time.includes('22:') || time.includes('10:')) {
      return Moon
    }
    return Clock
  }

  const getShiftColors = (shiftName: string, startTime: string) => {
    const name = shiftName.toLowerCase()
    const time = startTime.toLowerCase()
    
    if (name.includes('día') || name.includes('dia') || time.includes('06:') || time.includes('6:')) {
      return {
        bg: 'from-amber-500 to-orange-500',
        bgLight: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-800',
        ring: 'ring-amber-500/20'
      }
    } else if (name.includes('noche') || time.includes('22:') || time.includes('10:')) {
      return {
        bg: 'from-indigo-500 to-purple-600',
        bgLight: 'bg-indigo-50',
        border: 'border-indigo-300',
        text: 'text-indigo-800',
        ring: 'ring-indigo-500/20'
      }
    }
    return {
      bg: 'from-slate-500 to-slate-600',
      bgLight: 'bg-slate-50',
      border: 'border-slate-300',
      text: 'text-slate-800',
      ring: 'ring-slate-500/20'
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-t-lg pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  Seleccionar Turno
                </CardTitle>
                <p className="text-slate-200 text-xs">
                  Elige tu horario de trabajo
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Cargando turnos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-slate-600 mb-3">{error}</p>
              <Button onClick={fetchShifts} variant="outline" size="sm">
                Reintentar
              </Button>
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">No hay turnos disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Shift Options */}
              <div className="space-y-3">
                {shifts.map((shift) => {
                  const Icon = getShiftIcon(shift.name, shift.start_time)
                  const colors = getShiftColors(shift.name, shift.start_time)
                  const isSelected = tempSelectedShift?.id === shift.id
                  
                  return (
                    <div
                      key={shift.id}
                      onClick={() => setTempSelectedShift(shift)}
                      className={`
                        group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? `${colors.border} ${colors.bgLight} shadow-md ring-2 ${colors.ring}` 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Icon */}
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-200
                          ${isSelected 
                            ? `bg-gradient-to-br ${colors.bg}` 
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                          }
                        `}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 truncate">
                              {shift.name}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                            </span>
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
                          ${isSelected 
                            ? `border-emerald-500 bg-emerald-500` 
                            : 'border-slate-300'
                          }
                        `}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  {tempSelectedShift ? (
                    <span>{tempSelectedShift.name}</span>
                  ) : (
                    <span>Selecciona un turno</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    className="text-slate-700"
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    onClick={handleConfirm}
                    disabled={!tempSelectedShift}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
