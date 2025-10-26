export interface DashboardMetrics {
  totalPedidos: number
  totalTrabajadores: number
  totalEmpresas: number
  minutaM1: number
  minutaM2: number
}

export interface TopOpcion {
  descripcion: string
  cantidad: number
  porcentaje: number
}

export interface EmpresaStats {
  empresa: string
  cantidadPedidos: number
  cantidadTrabajadores: number
}
