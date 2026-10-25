import { formatoMXN } from './categories.js'
import { fechaCorta } from './resumen.js'

export default function MovementList({ movimientos, onEditar, onBorrar }) {
  if (movimientos.length === 0) {
    return <p className="vacio">Aún no hay movimientos.</p>
  }

  return (
    <ul className="lista">
      {movimientos.map((m) => (
        <li key={m.id}>
          <span className="fecha">{fechaCorta(m.fecha)}</span>
          <div className="concepto">
            <strong>
              <i className={`punto ${m.tipo}`} aria-hidden="true" />
              {m.categoria}
            </strong>
            <small>
              <span className="fecha-movil">{fechaCorta(m.fecha)}</span>
              {m.nota && <span className="fecha-movil"> · </span>}
              {m.nota}
            </small>
          </div>
          <span className={`monto ${m.tipo}`}>
            {m.tipo === 'gasto' ? '−' : '+'}
            {formatoMXN.format(m.monto)}
          </span>
          <div className="botones">
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
