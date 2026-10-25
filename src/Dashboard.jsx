import { useState } from 'react'
import { CATEGORIAS, formatoCorto, formatoMXN } from './categories.js'
import { nombreMes, porMes, totales } from './resumen.js'

const ALTO = 220
const MAX_MESES = 12
const GUIAS = 4

const formatoEje = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  notation: 'compact',
  maximumFractionDigits: 1,
})

// Redondea el paso del eje a 1, 2 o 5 × 10ⁿ para que las guías tengan números limpios.
function pasoBonito(valor) {
  const base = 10 ** Math.floor(Math.log10(valor))
  const n = valor / base
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * base
}

function Grafica({ meses }) {
  const [activo, setActivo] = useState(null)
  const visibles = meses.slice(-MAX_MESES)
  const max = Math.max(1, ...visibles.flatMap((m) => [m.ingresos, m.gastos]))
  const tope = pasoBonito(max / GUIAS) * GUIAS
  const alto = (v) => (v / tope) * ALTO

  return (
    <div className="grafica">
      <div className="grafica-cabecera">
        <h3>Ingresos y gastos por mes</h3>
        <div className="leyenda">
          <span><i className="ingreso" />Ingresos</span>
          <span><i className="gasto" />Gastos</span>
        </div>
      </div>
      <div className="lienzo">
        {Array.from({ length: GUIAS + 1 }, (_, i) => (
          <div key={i} className="guia" style={{ bottom: (i / GUIAS) * ALTO }}>
            <span>{formatoEje.format((i / GUIAS) * tope)}</span>
          </div>
        ))}
        <div className="barras" style={{ height: ALTO }}>
          {visibles.map((m) => (
            <div
              key={m.mes}
              className={activo?.mes === m.mes ? 'mes activo' : 'mes'}
              onMouseEnter={() => setActivo(m)}
              onMouseLeave={() => setActivo(null)}
              onClick={() => setActivo(m)}
            >
              <div className="par">
                <div className="barra ingreso" style={{ height: alto(m.ingresos) }} />
                <div className="barra gasto" style={{ height: alto(m.gastos) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="etiquetas">
        {visibles.map((m) => (
          <span key={m.mes}>
            {nombreMes(m.mes).split(' ')[0]}
            <small> {m.mes.slice(2, 4)}</small>
          </span>
        ))}
      </div>
      <p className="detalle">
        {activo
          ? `${nombreMes(activo.mes)}: ingresos ${formatoMXN.format(activo.ingresos)} · gastos ${formatoMXN.format(activo.gastos)} · total ${formatoMXN.format(activo.total)}`
          : 'Pasa el cursor o toca un mes para ver el detalle.'}
      </p>
    </div>
  )
}

function PorCategoria({ movimientos, tipo }) {
  const sumas = new Map(CATEGORIAS[tipo].map((c) => [c, 0]))
  for (const m of movimientos) {
    if (m.tipo === tipo) sumas.set(m.categoria, (sumas.get(m.categoria) ?? 0) + m.monto)
  }
  const total = [...sumas.values()].reduce((a, b) => a + b, 0)
  const filas = [...sumas].sort((a, b) => b[1] - a[1])

  return (
    <div>
      <h3>{tipo === 'ingreso' ? 'Ingresos' : 'Gastos'}</h3>
      <ul>
        {filas.map(([categoria, suma]) => {
          const pct = total ? (suma / total) * 100 : 0
          return (
            <li key={categoria}>
              <div className="categoria-fila">
                <span>{categoria}</span>
                <span>
                  {formatoCorto.format(suma)}
                  <small>{Math.round(pct)}%</small>
                </span>
              </div>
              <div className="pista">
                <div className={`relleno ${tipo}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const cuantos = (n) => `${n} ${n === 1 ? 'movimiento' : 'movimientos'}`

export default function Dashboard({ movimientos }) {
  const [mes, setMes] = useState('')
  const meses = porMes(movimientos)
  const filtrados = mes ? movimientos.filter((m) => m.fecha.startsWith(mes)) : movimientos
  const t = totales(filtrados)
  const nIngresos = filtrados.filter((m) => m.tipo === 'ingreso').length
  const margen = t.ingresos > 0 ? Math.round((t.total / t.ingresos) * 100) : null
  const periodo = mes ? nombreMes(mes) : 'todo el histórico'

  return (
    <>
      <section className="area-resumen">
        <div className="cabecera">
          <h2>Resumen</h2>
          <div className="filtro">
            <select value={mes} onChange={(e) => setMes(e.target.value)} aria-label="Periodo">
              <option value="">Todo el histórico</option>
              {[...meses].reverse().map((m) => (
                <option key={m.mes} value={m.mes}>
                  {nombreMes(m.mes)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="tarjetas">
          <div className="indicador ingreso">
            <small>Ingresos</small>
            <strong>{formatoCorto.format(t.ingresos)}</strong>
            <span>{cuantos(nIngresos)}</span>
          </div>
          <div className="indicador gasto">
            <small>Gastos</small>
            <strong>{formatoCorto.format(t.gastos)}</strong>
            <span>{cuantos(filtrados.length - nIngresos)}</span>
          </div>
          <div className="indicador total">
            <small>Total</small>
            <strong className={t.total < 0 ? 'negativo' : ''}>{formatoCorto.format(t.total)}</strong>
            <span>{margen === null ? periodo : `Margen ${margen}%`}</span>
          </div>
        </div>
        {meses.length > 0 && <Grafica meses={meses} />}
        {meses.length > 0 && (
          <details className="tabla">
            <summary>Ver tabla por mes</summary>
            <table>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Ingresos</th>
                  <th>Gastos</th>
                  <th>Total</th>
                  <th>Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {[...meses].reverse().map((m) => (
                  <tr key={m.mes}>
                    <td>{nombreMes(m.mes)}</td>
                    <td>{formatoCorto.format(m.ingresos)}</td>
                    <td>{formatoCorto.format(m.gastos)}</td>
                    <td>{formatoCorto.format(m.total)}</td>
                    <td>{formatoCorto.format(m.acumulado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </section>
      <section className="area-categorias">
        <div className="cabecera">
          <h2>Por categoría</h2>
          <small>{periodo}</small>
        </div>
        <div className="categorias">
          <PorCategoria movimientos={filtrados} tipo="ingreso" />
          <PorCategoria movimientos={filtrados} tipo="gasto" />
        </div>
      </section>
    </>
  )
}
