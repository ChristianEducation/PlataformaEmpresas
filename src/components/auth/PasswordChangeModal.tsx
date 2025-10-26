'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface PasswordChangeModalProps {
  onClose: () => void
  title?: string
}

export default function PasswordChangeModal({ onClose, title = "Primer inicio de sesión" }: PasswordChangeModalProps) {
  const { profile, refreshSession } = useAuth()
  
  // Estados para el formulario
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Estados para el proceso
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Validación de contraseña
  const isPasswordValid = newPassword.length >= 6
  const doPasswordsMatch = newPassword === confirmPassword
  const canSubmit = isPasswordValid && doPasswordsMatch && newPassword.trim() !== ''

  const updateSessionTimestamp = async (updatePassword = false) => {
    if (!profile) return
    
    setLoading(true)
    setError('')
    
    try {
      const updates = {
        sesion: new Date().toISOString(),
        ...(updatePassword && { contraseña: newPassword })
      }
      
      const { error } = await supabase
        .from('trabajadores')
        .update(updates)
        .eq('id', profile.id)
      
      if (error) throw error
      
      setSuccess(true)
      
      // Actualizar la sesión para reflejar los cambios
      if (refreshSession) {
        await refreshSession()
      }
      
      // Cerrar automáticamente después de un tiempo
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (err) {
      console.error('Error actualizando contraseña:', err)
      setError('Ha ocurrido un error al actualizar la contraseña. Por favor intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleChangePassword = async () => {
    if (!canSubmit) return
    await updateSessionTimestamp(true)
  }
  
  const handleKeepPassword = async () => {
    await updateSessionTimestamp(false)
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <CardHeader className="relative pb-2">
          <CardTitle className="text-xl font-bold text-slate-800">
            {title}
          </CardTitle>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </CardHeader>
        
        <CardContent>
          {!success ? (
            <>
              <p className="text-sm text-slate-600 mb-6">
                Es tu primer inicio de sesión. Te recomendamos cambiar tu contraseña 
                predeterminada por una contraseña personalizada para mayor seguridad.
              </p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                {/* Campo de nueva contraseña */}
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium text-slate-700 block">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} className="text-slate-400" />
                      ) : (
                        <Eye size={20} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                  {newPassword && !isPasswordValid && (
                    <p className="text-red-600 text-xs mt-1">
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  )}
                </div>
                
                {/* Campo de confirmar contraseña */}
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700 block">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} className="text-slate-400" />
                      ) : (
                        <Eye size={20} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && !doPasswordsMatch && (
                    <p className="text-red-600 text-xs mt-1">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button 
                  onClick={handleChangePassword} 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!canSubmit || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Cambiar Contraseña'
                  )}
                </Button>
                <Button 
                  onClick={handleKeepPassword} 
                  variant="outline" 
                  className="flex-1 border-slate-300"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'Mantener Contraseña Actual'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                ¡Actualización exitosa!
              </h3>
              <p className="text-slate-600 text-sm">
                Tu configuración ha sido actualizada correctamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
