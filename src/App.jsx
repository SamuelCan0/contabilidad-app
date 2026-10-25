import { useEffect, useState } from 'react'
import MovementForm from './MovementForm.jsx'
import MovementList from './MovementList.jsx'
import { cargarMovimientos, guardarMovimientos } from './storage.js'
import './App.css'

function App() {
  const [movimientos, setMovimientos] = useState(cargarMovimientos)
  const [editando, setEditando] = useState(null)

  useEffect(() => guardarMovimientos(movimientos), [movimientos])

  const ordenados = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha))

  const agregar = (m) => setMovimientos([...movimientos, { ...m, id: crypto.randomUUID() }])

  const actualizar = (m) => {
    setMovimientos(movimientos.map((x) => (x.id === m.id ? m : x)))
    setEditando(null)
  }

  const borrar = (id) => setMovimientos(movimientos.filter((m) => m.id !== id))

  return (
    <main>
      <h1>Contabilidad</h1>
      <section>
        <h2>{editando ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
        <MovementForm
          key={editando?.id ?? 'nuevo'}
          inicial={editando}
          onGuardar={editando ? actualizar : agregar}
          onCancelar={editando ? () => setEditando(null) : undefined}
        />
      </section>
      <section>
        <h2>Movimientos</h2>
        <MovementList movimientos={ordenados} onEditar={setEditando} onBorrar={borrar} />
      </section>
    </main>
  )
}

export default App
