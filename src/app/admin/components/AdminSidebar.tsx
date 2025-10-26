"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Crown, LayoutDashboard, ChefHat, ClipboardList, Users, FileText, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface AdminSidebarProps {
  currentPath: string
}

export function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      description: "Vista general",
    },
    {
      name: "Vista Cocina",
      path: "/admin/cocina",
      icon: ChefHat,
      description: "Planilla operativa",
    },
    {
      name: "Pedidos",
      path: "/admin/pedidos",
      icon: ClipboardList,
      description: "Lista detallada",
    },
    {
      name: "Trabajadores",
      path: "/admin/trabajadores",
      icon: Users,
      description: "Gestión de trabajadores",
    },
    {
      name: "Minutas",
      path: "/admin/minutas",
      icon: FileText,
      description: "Programación de menús",
    },
  ]

  const handleLogout = () => {
    router.push("/role-selection")
  }

  const isActive = (path: string) => {
    return currentPath === path
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
      >
        {isOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Admin Panel</h2>
                <p className="text-xs text-slate-500">Gestión de pedidos</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                    ${
                      active
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "text-slate-700 hover:bg-slate-50 border border-transparent"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-orange-600" : "text-slate-500"}`} />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${active ? "text-orange-700" : "text-slate-900"}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Volver al menú
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
