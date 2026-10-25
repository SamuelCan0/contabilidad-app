export const CATEGORIAS = {
  ingreso: ['Venta tianguis', 'Pedido personalizado', 'Inversionista'],
  gasto: ['Compras', 'Luz', 'Insumos'],
}

export const formatoMXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})
