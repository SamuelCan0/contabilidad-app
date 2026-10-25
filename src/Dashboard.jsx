import { useState } from 'react'
import { CATEGORIAS, formatoCorto, formatoMXN } from './categories.js'
import { fechaCorta, nombreMes, porMes, totales } from './resumen.js'

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

function Pendientes({ pendientes, periodo, onPagar }) {
  const suma = pendientes.reduce((a, m) => a + m.monto, 0)
  const ordenados = [...pendientes].sort((a, b) => a.fecha.localeCompare(b.fecha))

  return (
    <section className="area-pendientes">
      <div className="cabecera">
        <h2>Pagos pendientes</h2>
        <small>{periodo}</small>
      </div>
      {pendientes.length === 0 ? (
        <p className="vacio">No hay pagos pendientes.</p>
      ) : (
        <>
          <p className="pendientes-total">
            <strong>{formatoCorto.format(suma)}</strong> por cobrar en{' '}
            {pendientes.length} {pendientes.length === 1 ? 'pago' : 'pagos'}
          </p>
          <ul className="pendientes-lista">
            {ordenados.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{m.cliente || m.categoria}</strong>
                  <small>
                    {m.cliente && `${m.categoria} · `}
                    {fechaCorta(m.fecha)}
                    {m.nota && ` · ${m.nota}`}
                  </small>
                </div>
                <span className="monto">{formatoMXN.format(m.monto)}</span>
                <button type="button" className="pagar" onClick={() => onPagar(m)}>
                  Marcar como pagado
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default function Dashboard({ movimientos, onPagar }) {
  const [mes, setMes] = useState('')
  const meses = porMes(movimientos)
  // El filtro incluye meses que solo tienen pagos pendientes.
  const opciones = [...new Set(movimientos.map((m) => m.fecha.slice(0, 7)))].sort().reverse()
  const filtrados = mes ? movimientos.filter((m) => m.fecha.startsWith(mes)) : movimientos
  const pendientes = filtrados.filter((m) => m.tipo === 'pendiente')
  const t = totales(filtrados)
  const nIngresos = filtrados.filter((m) => m.tipo === 'ingreso').length
  const nGastos = filtrados.filter((m) => m.tipo === 'gasto').length
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
              {opciones.map((clave) => (
                <option key={clave} value={clave}>
                  {nombreMes(clave)}
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
            <span>{cuantos(nGastos)}</span>
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
      <Pendientes pendientes={pendientes} periodo={periodo} onPagar={onPagar} />
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
