import { useEffect, useState } from 'react'
import Dashboard from './Dashboard.jsx'
import Login from './Login.jsx'
import Logo from './Logo.jsx'
import MovementForm from './MovementForm.jsx'
import MovementList from './MovementList.jsx'
import { hoy } from './resumen.js'
import {
  actualizarMovimiento,
  borrarMovimiento,
  cargarMovimientos,
  crearMovimiento,
} from './storage.js'
import { supabase } from './supabase.js'
import './App.css'

function App() {
  const [sesion, setSesion] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (sesion === undefined) return <p className="cargando">Cargando…</p>
  if (!sesion) return <Login />
  return <Contabilidad correo={sesion.user.email} />
}

function Contabilidad({ correo }) {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    cargarMovimientos()
      .then(setMovimientos)
      .catch(() => setError('No se pudieron cargar los movimientos.'))
      .finally(() => setCargando(false))
  }, [])

  const intentar = async (accion) => {
    setError('')
    try {
      await accion()
    } catch {
      setError('No se guardó el cambio. Revisa tu conexión e intenta de nuevo.')
    }
  }

  const ordenados = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha))

  const agregar = (m) =>
    intentar(async () => {
      const nuevo = await crearMovimiento(m)
      setMovimientos((prev) => [...prev, nuevo])
    })

  const actualizar = (m) =>
    intentar(async () => {
      const guardado = await actualizarMovimiento(m)
      setMovimientos((prev) => prev.map((x) => (x.id === guardado.id ? guardado : x)))
      setEditando(null)
    })

  // Un pendiente cobrado se vuelve ingreso con la fecha de hoy.
  const pagar = (m) =>
    intentar(async () => {
      const guardado = await actualizarMovimiento({ ...m, tipo: 'ingreso', fecha: hoy() })
      setMovimientos((prev) => prev.map((x) => (x.id === guardado.id ? guardado : x)))
      if (editando?.id === guardado.id) setEditando(null)
    })

  const borrar = (id) =>
    intentar(async () => {
      await borrarMovimiento(id)
      setMovimientos((prev) => prev.filter((m) => m.id !== id))
    })

  return (
    <>
      <header className="barra-superior">
        <a
          className="marca"
          href="#"
          aria-label="Ir al inicio"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <Logo className="logo" />
          <h1>Contabilidad</h1>
        </a>
        <div className="usuario">
          <small>{correo}</small>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Salir
          </button>
        </div>
      </header>
      <main className="contenido">
        {error && <p className="error">{error}</p>}
        <div className="tablero">
          {cargando ? (
            <section className="area-resumen">
              <p className="vacio">Cargando…</p>
            </section>
          ) : (
            <Dashboard movimientos={movimientos} onPagar={pagar} />
          )}
          <section className="area-form">
            <div className="cabecera">
              <h2>{editando ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
            </div>
            <MovementForm
              key={editando?.id ?? 'nuevo'}
              inicial={editando}
              onGuardar={editando ? actualizar : agregar}
              onCancelar={editando ? () => setEditando(null) : undefined}
            />
          </section>
          <section className="area-movimientos">
            <div className="cabecera">
              <h2>Movimientos</h2>
              <small>{movimientos.length} en total</small>
            </div>
            <MovementList
              movimientos={ordenados}
              onEditar={setEditando}
              onBorrar={borrar}
              onPagar={pagar}
            />
          </section>
        </div>
      </main>
    </>
  )
}

export default App
