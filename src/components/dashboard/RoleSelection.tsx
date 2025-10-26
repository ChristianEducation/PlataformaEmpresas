'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  User, 
  Shield, 
  LogOut,
  ArrowRight,
  ChefHat,
  Settings,
  Clock,
  Building2,
  Crown,
} from 'lucide-react'

export default function RoleSelection() {
  const { profile, signOut, loading } = useAuth()
  const router = useRouter()

  const handleEmployeeAccess = () => {
    router.push('/dashboard')
  }

  const handleAdminAccess = () => {
    router.push('/admin')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  // Verificar si el usuario es admin
  const isAdmin = profile?.rol?.toLowerCase() === 'admin' || profile?.rol?.toLowerCase() === 'administrador'
  const canAccessEmployee = true
  const canAccessAdmin = isAdmin

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!profile?.nombre_completo) return 'U'
    const names = profile.nombre_completo.split(' ')
    return names.length >= 2 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase()
  }

  // Función para obtener el color del rol
  const getRoleColor = (rol: string | null) => {
    switch (rol?.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'supervisor':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  // Función para obtener el nombre del rol
  const getRoleName = (rol: string | null) => {
    if (!rol) return 'Empleado'
    switch (rol.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'Administrador'
      case 'supervisor':
        return 'Supervisor'
      default:
        return 'Empleado'
    }
  }

  // Mostrar loading si aún está cargando
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Pedidos</h1>
                <p className="text-sm text-gray-600">Gestión de restaurante</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-4 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-700 font-semibold text-lg shadow-inner">
              {getUserInitials()}
            </div>
            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                ¡Bienvenido, {profile?.nombre_completo?.split(' ')[0] || 'Usuario'}!
              </h2>
              <div className="flex items-center space-x-3 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium border ${getRoleColor(profile?.rol || null)}`}>
                  {getRoleName(profile?.rol || null)}
                </span>
                {profile?.empresa && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Building2 className="w-3 h-3" />
                      <span>{profile.empresa}</span>
                    </div>
                  </>
                )}
                {profile?.rut && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{profile.rut}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Selecciona tu área de trabajo para acceder a las herramientas correspondientes
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className={`grid gap-8 mb-12 ${canAccessAdmin ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
          {/* Employee Portal */}
          {canAccessEmployee && (
            <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-500" />
              
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                  <ChefHat className="w-10 h-10 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Portal Empleado
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Gestiona pedidos, consulta el menú y administra las órdenes del día
                </p>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Pedidos en tiempo real</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleEmployeeAccess}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>Acceder al Portal</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Portal */}
          {canAccessAdmin && (
            <Card className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-500" />
              
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300 relative">
                  <Settings className="w-10 h-10 text-orange-600" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Panel Administrativo
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Supervisa operaciones, gestiona usuarios y consulta reportes del negocio
                </p>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Control total del sistema</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleAdminAccess}
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>Acceder al Panel</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Info Card */}
        {profile && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del usuario</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium text-gray-900">{profile.nombre_completo}</p>
                </div>
              </div>
              
              {profile.empresa && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Empresa</p>
                    <p className="font-medium text-gray-900">{profile.empresa}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="font-medium text-gray-900">{getRoleName(profile.rol)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Footer */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Sistema activo</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-sm text-gray-500">
              Conectado como {getRoleName(profile?.rol || null)}
            </span>
            {profile?.empresa && (
              <>
                <div className="w-px h-4 bg-gray-200" />
                <span className="text-sm text-gray-500">
                  {profile.empresa}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
