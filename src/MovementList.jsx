import { formatoMXN } from './categories.js'

export default function MovementList({ movimientos, onEditar, onBorrar }) {
  if (movimientos.length === 0) {
    return <p className="vacio">Aún no hay movimientos.</p>
  }

  return (
    <ul className="lista">
      {movimientos.map((m) => (
        <li key={m.id}>
          <div>
            <strong>{m.categoria}</strong>
            <small>
              {m.fecha}
              {m.nota && ` · ${m.nota}`}
            </small>
          </div>
          <span className={m.tipo}>
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
