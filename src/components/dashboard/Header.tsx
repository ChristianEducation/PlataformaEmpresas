'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Building2,
  Key
} from 'lucide-react'
import PasswordChangeModal from '@/components/auth/PasswordChangeModal'

export default function Header() {
  const { profile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  const getUserInitials = () => {
    if (!profile?.nombre_completo) return 'U'
    const names = profile.nombre_completo.split(' ')
    return names.length >= 2 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase()
  }

  const getRoleBadgeColor = (rol: string | null | undefined) => {
    switch (rol?.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'supervisor':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900">
                  Sistema de Pedidos
                </h1>
                <p className="text-sm text-slate-500">
                  Gestión de Almuerzos
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                    {getUserInitials()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-slate-900">
                      {profile?.nombre_completo || 'Usuario'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getRoleBadgeColor(profile?.rol)}`}>
                        {profile?.rol || 'Empleado'}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {profile?.nombre_completo || 'Usuario'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {profile?.rut || 'Sin RUT'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getRoleBadgeColor(profile?.rol)}`}>
                            {profile?.rol || 'Empleado'}
                          </span>
                          {profile?.turno_habitual && (
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                              {profile.turno_habitual}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="pt-2 border-b border-slate-100 pb-2">
                    <button
                      onClick={() => {
                        setShowPasswordModal(true)
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <Key className="w-4 h-4" />
                      <span>Cambiar Contraseña</span>
                    </button>
                  </div>
                  
                  {/* Sign Out */}
                  <div className="pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-slate-600"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-4">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 px-2">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                  {getUserInitials()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {profile?.nombre_completo || 'Usuario'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getRoleBadgeColor(profile?.rol)}`}>
                      {profile?.rol || 'Empleado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowPasswordModal(true)
                    setShowMobileMenu(false)
                  }}
                  className="w-full flex items-center space-x-3 px-2 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-150"
                >
                  <Key className="w-4 h-4" />
                  <span>Cambiar Contraseña</span>
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal 
          onClose={() => setShowPasswordModal(false)}
          title="Cambio de Contraseña"
        />
      )}
    </header>
  )
}
