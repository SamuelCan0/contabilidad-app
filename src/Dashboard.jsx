import { useState } from 'react'
import { formatoCorto, formatoMXN } from './categories.js'
import { nombreMes, porMes, totales } from './resumen.js'

const ALTO = 180
const MAX_MESES = 12

function Grafica({ meses }) {
  const [activo, setActivo] = useState(null)
  const visibles = meses.slice(-MAX_MESES)
  const max = Math.max(1, ...visibles.flatMap((m) => [m.ingresos, m.gastos]))
  const alto = (v) => (v / max) * ALTO

  return (
    <div className="grafica">
      <div className="leyenda">
        <span><i className="ingreso" /> Ingresos</span>
        <span><i className="gasto" /> Gastos</span>
      </div>
      <div className="barras" style={{ height: ALTO }}>
        {visibles.map((m) => (
          <div
            key={m.mes}
            className="mes"
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
      <div className="etiquetas">
        {visibles.map((m) => (
          <span key={m.mes}>{nombreMes(m.mes)}</span>
        ))}
      </div>
      <p className="detalle">
        {activo
          ? `${nombreMes(activo.mes)}: ingresos ${formatoMXN.format(activo.ingresos)} · gastos ${formatoMXN.format(activo.gastos)} · total ${formatoMXN.format(activo.total)}`
          : 'Toca un mes para ver el detalle.'}
      </p>
    </div>
  )
}

export default function Dashboard({ movimientos }) {
  const [mes, setMes] = useState('')
  const meses = porMes(movimientos)
  const filtrados = mes ? movimientos.filter((m) => m.fecha.startsWith(mes)) : movimientos
  const t = totales(filtrados)

  return (
    <>
      <div className="filtro">
        <select value={mes} onChange={(e) => setMes(e.target.value)}>
          <option value="">Todo el histórico</option>
          {[...meses].reverse().map((m) => (
            <option key={m.mes} value={m.mes}>
              {nombreMes(m.mes)}
            </option>
          ))}
        </select>
      </div>
      <div className="tarjetas">
        <div>
          <small>Ingresos</small>
          <strong>{formatoCorto.format(t.ingresos)}</strong>
        </div>
        <div>
          <small>Gastos</small>
          <strong>{formatoCorto.format(t.gastos)}</strong>
        </div>
        <div>
          <small>Total</small>
          <strong className={t.total < 0 ? 'negativo' : ''}>{formatoCorto.format(t.total)}</strong>
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
    </>
  )
}
