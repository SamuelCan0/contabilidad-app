import { formatoMXN } from './categories.js'
import { fechaCorta } from './resumen.js'

export default function MovementList({ movimientos, onEditar, onBorrar, onPagar }) {
  if (movimientos.length === 0) {
    return <p className="vacio">Aún no hay movimientos.</p>
  }

  return (
    <ul className="lista">
      {movimientos.map((m) => (
        <li key={m.id} className={m.tipo === 'pendiente' ? 'pendiente' : undefined}>
          <span className="fecha">{fechaCorta(m.fecha)}</span>
          <div className="concepto">
            <strong>
              <i className={`punto ${m.tipo}`} aria-hidden="true" />
              {m.categoria}
              {m.tipo === 'pendiente' && <span className="etiqueta-pendiente">Pendiente</span>}
            </strong>
            <small>
              <span className="fecha-movil">{fechaCorta(m.fecha)}</span>
              {m.nota && <span className="fecha-movil"> · </span>}
              {m.nota}
            </small>
          </div>
          <span className={`monto ${m.tipo}`}>
            {m.tipo === 'gasto' ? '−' : m.tipo === 'ingreso' ? '+' : ''}
            {formatoMXN.format(m.monto)}
          </span>
          <div className="botones">
            {m.tipo === 'pendiente' && (
              <button type="button" className="pagar" onClick={() => onPagar(m)}>
                Marcar como pagado
              </button>
            )}
            <button type="button" onClick={() => onEditar(m)}>
              Editar
            </button>
            <button
              type="button"
              onClick={() => confirm('¿Borrar este movimiento?') && onBorrar(m.id)}
            >
              Borrar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
