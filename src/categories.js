export const CATEGORIAS = {
  ingreso: ['Venta tianguis', 'Pedido personalizado', 'Inversionista'],
  gasto: ['Compras', 'Luz', 'Insumos'],
}

// Un pago pendiente es un ingreso por cobrar: al pagarse se vuelve ingreso.
CATEGORIAS.pendiente = CATEGORIAS.ingreso

export const formatoMXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export const formatoCorto = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})
