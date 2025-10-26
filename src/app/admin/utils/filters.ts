import type { Pedido, Trabajador } from "@/types/database"

interface PedidoCompleto extends Pedido {
  trabajador_info?: Trabajador
}

export function getFilteredPedidos(
  pedidos: PedidoCompleto[],
  searchTerm: string,
  shiftFilter: string,
): PedidoCompleto[] {
  let filtered = pedidos

  if (searchTerm) {
    filtered = filtered.filter(
      (pedido) =>
        pedido.nombre_trabajador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pedido.rut_trabajador && pedido.rut_trabajador.includes(searchTerm)) ||
        pedido.descripcion_opcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.codigo_opcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.categoria_opcion.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  if (shiftFilter !== "all") {
    const turnoFilter = shiftFilter.toLowerCase() === "día" || shiftFilter.toLowerCase() === "dia" ? "dia" : "noche"
    filtered = filtered.filter((pedido) => pedido.turno_elegido === turnoFilter)
  }

  return filtered
}

export function getFilteredTrabajadores(
  trabajadores: Trabajador[],
  searchTerm: string,
  companyFilter: string,
): Trabajador[] {
  let filtered = trabajadores

  if (searchTerm) {
    filtered = filtered.filter(
      (trabajador) =>
        trabajador.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trabajador.empresa && trabajador.empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trabajador.rut && trabajador.rut.includes(searchTerm)),
    )
  }

  if (companyFilter !== "all") {
    filtered = filtered.filter((trabajador) => trabajador.empresa === companyFilter)
  }

  return filtered
}
