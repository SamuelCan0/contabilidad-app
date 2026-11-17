import { useState } from 'react'
import { formatoMXN } from './categories.js'
import { fechaCorta } from './resumen.js'

const POR_PAGINA = 10

// Números de página a mostrar: siempre la primera, la última y las vecinas de la actual.
function numerosDePagina(actual, total) {
  const paginas = []
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - actual) <= 1) paginas.push(p)
    else if (paginas[paginas.length - 1] !== '…') paginas.push('…')
  }
  return paginas
}

export default function MovementList({ movimientos, onEditar, onBorrar, onPagar }) {
  const [pagina, setPagina] = useState(1)

  if (movimientos.length === 0) {
    return <p className="vacio">Aún no hay movimientos.</p>
  }

  const totalPaginas = Math.ceil(movimientos.length / POR_PAGINA)
  // Si se borran movimientos y la página ya no existe, se muestra la última.
  const actual = Math.min(pagina, totalPaginas)
  const inicio = (actual - 1) * POR_PAGINA
  const visibles = movimientos.slice(inicio, inicio + POR_PAGINA)

  return (
    <>
      <ul className="lista">
        <li className="encabezado" aria-hidden="true">
          <span>Fecha</span>
          <span>Nombre</span>
          <span>Categoría</span>
          <span className="monto">Monto</span>
          <span className="botones">Acciones</span>
        </li>
        {visibles.map((m) => (
          <li key={m.id} className={m.tipo === 'pendiente' ? 'pendiente' : undefined}>
            <span className="fecha">{fechaCorta(m.fecha)}</span>
            <div className="concepto">
              <strong>
                <i className={`punto ${m.tipo}`} aria-hidden="true" />
                {m.cliente || <span className="sin-nombre">Sin nombre</span>}
                {m.tipo === 'pendiente' && <span className="etiqueta-pendiente">Pendiente</span>}
              </strong>
              <small>
                <span className="solo-movil">
                  {m.categoria} · {fechaCorta(m.fecha)}
                  {m.nota && ' · '}
                </span>
                {m.nota}
              </small>
            </div>
            <span className="categoria">{m.categoria}</span>
            <span className={`monto ${m.tipo}`}>
              {m.tipo === 'gasto' ? '−' : m.tipo === 'ingreso' ? '+' : ''}
              {formatoMXN.format(m.monto)}
            </span>
            <div className="botones">
              {onPagar && m.tipo === 'pendiente' && (
                <button type="button" className="pagar" onClick={() => onPagar(m)}>
                  Marcar como pagado
                </button>
              )}
              {onEditar && (
                <button type="button" onClick={() => onEditar(m)}>
                  Editar
                </button>
              )}
              {onBorrar && (
                <button
                  type="button"
                  onClick={() => confirm('¿Borrar este movimiento?') && onBorrar(m.id)}
                >
                  Borrar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {totalPaginas > 1 && (
        <nav className="paginacion" aria-label="Páginas de movimientos">
          <small>
            {inicio + 1}–{inicio + visibles.length} de {movimientos.length}
          </small>
          <div>
            <button type="button" aria-label="Página anterior" disabled={actual === 1} onClick={() => setPagina(actual - 1)}>
              ‹<span className="texto"> Anterior</span>
            </button>
            {numerosDePagina(actual, totalPaginas).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="puntos">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={p === actual ? 'activa' : undefined}
                  aria-current={p === actual ? 'page' : undefined}
                  onClick={() => setPagina(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button type="button" aria-label="Página siguiente" disabled={actual === totalPaginas} onClick={() => setPagina(actual + 1)}>
              <span className="texto">Siguiente </span>›
            </button>
          </div>
        </nav>
      )}
    </>
  )
}
