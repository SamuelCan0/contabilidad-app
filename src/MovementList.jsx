import { formatoMXN } from './categories.js'
import { fechaCorta } from './resumen.js'

export default function MovementList({ movimientos, onEditar, onBorrar, onPagar }) {
  if (movimientos.length === 0) {
    return <p className="vacio">Aún no hay movimientos.</p>
  }

  return (
    <ul className="lista">
      <li className="encabezado" aria-hidden="true">
        <span>Fecha</span>
        <span>Nombre</span>
        <span>Categoría</span>
        <span className="monto">Monto</span>
        <span className="botones">Acciones</span>
      </li>
      {movimientos.map((m) => (
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
