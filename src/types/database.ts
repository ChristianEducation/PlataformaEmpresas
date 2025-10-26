export interface Database {
  public: {
    Tables: {
      trabajadores: {
        Row: {
          id: number
          empresa_id: number | null
          empresa: string | null
          nombre_completo: string
          rut: string
          turno_habitual: string | null
          activo: boolean
          created_at: string
          contraseña: string
          rol: string | null
          sesion: string | null
          tipo_minuta: number
        }
        Insert: {
          id?: number
          empresa_id?: number | null
          empresa?: string | null
          nombre_completo: string
          rut: string
          turno_habitual?: string | null
          activo?: boolean
          created_at?: string
          contraseña: string
          rol?: string | null
          sesion?: string | null
          tipo_minuta: number
        }
        Update: {
          id?: number
          empresa_id?: number | null
          empresa?: string | null
          nombre_completo?: string
          rut?: string
          turno_habitual?: string | null
          activo?: boolean
          created_at?: string
          contraseña?: string
          rol?: string | null
          sesion?: string | null
          tipo_minuta?: number
        }
      }
      shifts: {
        Row: {
          id: string
          name: string
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
        }
      }
      pedidos: {
        Row: {
          id: number
          nombre_trabajador: string
          rut_trabajador: string | null
          turno_elegido: string
          fecha_entrega: string
          dia_semana: string
          numero_dia: number
          codigo_opcion: string
          descripcion_opcion: string
          categoria_opcion: string
          notas: string | null
          created_at: string
          empresa: string
        }
        Insert: {
          id?: number
          nombre_trabajador: string
          rut_trabajador?: string | null
          turno_elegido: string
          fecha_entrega: string
          dia_semana: string
          numero_dia: number
          codigo_opcion: string
          descripcion_opcion: string
          categoria_opcion: string
          notas?: string | null
          created_at?: string
          empresa: string
        }
        Update: {
          id?: number
          nombre_trabajador?: string
          rut_trabajador?: string | null
          turno_elegido?: string
          fecha_entrega?: string
          dia_semana?: string
          numero_dia?: number
          codigo_opcion?: string
          descripcion_opcion?: string
          categoria_opcion?: string
          notas?: string | null
          created_at?: string
          empresa?: string
        }
      }
      menus: {
        Row: {
          id: number
          fecha: string
          dia_semana: string
          numero_dia: number
          codigo_opcion: string
          descripcion_opcion: string
          categoria: string
          activa: boolean
          created_at: string
          tipo_minuta: number
        }
        Insert: {
          id?: number
          fecha: string
          dia_semana: string
          numero_dia: number
          codigo_opcion: string
          descripcion_opcion: string
          categoria: string
          activa?: boolean
          created_at?: string
          tipo_minuta: number
        }
        Update: {
          id?: number
          fecha?: string
          dia_semana?: string
          numero_dia?: number
          codigo_opcion?: string
          descripcion_opcion?: string
          categoria?: string
          activa?: boolean
          created_at?: string
          tipo_minuta?: number
        }
      }
    }
  }
}

export type Trabajador = Database["public"]["Tables"]["trabajadores"]["Row"]
export type Shift = Database["public"]["Tables"]["shifts"]["Row"]
export type Pedido = Database["public"]["Tables"]["pedidos"]["Row"]
export type Menu = Database["public"]["Tables"]["menus"]["Row"]

// Keep Order as alias for backward compatibility, but map to Pedido
export type Order = Pedido

// Nueva interfaz para empresas
export interface Empresa {
  nombre: string
  trabajadores_count: number
}

// Alias para compatibilidad
export type Profile = Trabajador
export type Funcionario = Trabajador

export interface PedidoCocina {
  nombre_trabajador: string
  fecha_entrega: string
  dia_semana: string
  numero_dia: number
  codigo_opcion: string
  descripcion_opcion: string
  empresa: string
  trabajador_id: number | null
}
