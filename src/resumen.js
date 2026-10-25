const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const nombreMes = (clave) => {
  const [anio, mes] = clave.split('-')
  return `${MESES[Number(mes) - 1]} ${anio.slice(2)}`
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
    else gastos += m.monto
  }
  return { ingresos, gastos, total: ingresos - gastos }
}

// Un renglón por mes con movimientos, del más viejo al más nuevo, con saldo acumulado.
export function porMes(movimientos) {
  const grupos = new Map()
  for (const m of movimientos) {
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
