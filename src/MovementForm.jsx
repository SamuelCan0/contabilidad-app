import { useState } from 'react'
import { CATEGORIAS } from './categories.js'
import { hoy } from './resumen.js'

const NOMBRES = { ingreso: 'Ingreso', gasto: 'Gasto', pendiente: 'Pendiente' }

const vacio = () => ({
  tipo: 'gasto',
  fecha: hoy(),
  monto: '',
  categoria: CATEGORIAS.gasto[0],
  nota: '',
})

export default function MovementForm({ inicial, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(inicial ?? vacio())

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value })

  const cambiarTipo = (tipo) =>
    setDatos({ ...datos, tipo, categoria: CATEGORIAS[tipo][0] })

  const enviar = (e) => {
    e.preventDefault()
    const monto = Number(datos.monto)
    if (!(monto > 0)) return
    onGuardar({ ...datos, monto })
    if (!inicial) setDatos({ ...vacio(), tipo: datos.tipo, categoria: datos.categoria })
  }

  return (
    <form className="form" onSubmit={enviar}>
      <div className="tipo">
        {Object.keys(NOMBRES).map((t) => (
          <button
            key={t}
            type="button"
            className={datos.tipo === t ? `activo ${t}` : ''}
            onClick={() => cambiarTipo(t)}
          >
            {NOMBRES[t]}
          </button>
        ))}
      </div>
      {datos.tipo === 'pendiente' && (
        <p className="aviso">Pago por cobrar. No cuenta en ingresos hasta que lo marques como pagado.</p>
      )}
      <div className="dos-columnas">
        <label>
          {datos.tipo === 'pendiente' ? 'Fecha del pedido' : 'Fecha'}
          <input type="date" value={datos.fecha} onChange={cambiar('fecha')} required />
        </label>
        <label>
          Monto (MXN)
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={datos.monto}
            onChange={cambiar('monto')}
            required
          />
        </label>
      </div>
      <label>
        Categoría
        <select value={datos.categoria} onChange={cambiar('categoria')}>
          {CATEGORIAS[datos.tipo].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Nota
        <input value={datos.nota} onChange={cambiar('nota')} placeholder="Opcional" />
      </label>
      <div className="acciones">
        <button type="submit" className="primario">
          {inicial ? 'Guardar cambios' : 'Agregar'}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
