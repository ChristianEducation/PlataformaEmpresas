"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Shield } from "lucide-react"
import { AdminSidebar } from "./components/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Check if user is admin
  useEffect(() => {
    if (!loading && user && profile) {
      const isAdmin = profile.rol?.toLowerCase() === "admin" || profile.rol?.toLowerCase() === "administrador"
      if (!isAdmin) {
        router.push("/dashboard")
      }
    }
  }, [user, profile, loading, router])

  const isAdmin = profile?.rol?.toLowerCase() === "admin" || profile?.rol?.toLowerCase() === "administrador"

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar currentPath={pathname} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
      </div>
    </div>
  )
}
