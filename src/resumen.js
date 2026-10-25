const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const nombreMes = (clave) => {
  const [anio, mes] = clave.split('-')
  return `${MESES[Number(mes) - 1]} ${anio.slice(2)}`
}

// Fecha de hoy en hora local (toISOString usa UTC y en la noche de México ya da el día siguiente).
export const hoy = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const fechaCorta = (fecha) => {
  const [anio, mes, dia] = fecha.split('-')
  return `${Number(dia)} ${MESES[Number(mes) - 1]} ${anio}`
}

export function totales(movimientos) {
  let ingresos = 0
  let gastos = 0
  for (const m of movimientos) {
    if (m.tipo === 'ingreso') ingresos += m.monto
    else if (m.tipo === 'gasto') gastos += m.monto
  }
  return { ingresos, gastos, total: ingresos - gastos }
}

// Un renglón por mes con movimientos, del más viejo al más nuevo, con saldo acumulado.
// Los pagos pendientes no cuentan hasta que se cobran.
export function porMes(movimientos) {
  const grupos = new Map()
  for (const m of movimientos) {
    if (m.tipo === 'pendiente') continue
    const clave = m.fecha.slice(0, 7)
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(m)
  }
  let acumulado = 0
  return [...grupos.keys()].sort().map((mes) => {
    const t = totales(grupos.get(mes))
    acumulado += t.total
    return { mes, ...t, acumulado }
  })
}
