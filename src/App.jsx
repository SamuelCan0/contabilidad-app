import { useCallback, useEffect, useState } from 'react'
import Dashboard from './Dashboard.jsx'
import { olvidarActividad, sesionVencida, useInactividad } from './inactividad.js'
import Login from './Login.jsx'
import Logo from './Logo.jsx'
import MovementForm from './MovementForm.jsx'
import MovementList from './MovementList.jsx'
import { CORREO_ADMIN, esAdmin } from './permisos.js'
import { hoy } from './resumen.js'
import {
  actualizarMovimiento,
  borrarMovimiento,
  cargarMovimientos,
  crearMovimiento,
  marcarPagado,
} from './storage.js'
import { supabase } from './supabase.js'
import './App.css'

function App() {
  const [sesion, setSesion] = useState(undefined)
  const [porInactividad, setPorInactividad] = useState(false)

  // scope 'local' cierra solo este navegador; no saca al socio de sus otros equipos.
  const cerrarPorInactividad = useCallback(() => {
    setPorInactividad(true)
    supabase.auth.signOut({ scope: 'local' })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      // Refresh después de 10 min sin actividad: también se cierra.
      if (data.session && sesionVencida()) {
        olvidarActividad()
        cerrarPorInactividad()
        setSesion(null)
        return
      }
      setSesion(data.session)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSesion(s)
      if (s) setPorInactividad(false)
    })
    return () => data.subscription.unsubscribe()
  }, [cerrarPorInactividad])

  if (sesion === undefined) return <p className="cargando">Cargando…</p>
  if (!sesion) return <Login porInactividad={porInactividad} />
  return <Contabilidad correo={sesion.user.email} alVencer={cerrarPorInactividad} />
}

function Contabilidad({ correo, alVencer }) {
  const restante = useInactividad(alVencer)
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)
  const puedeEditar = esAdmin(correo)

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
      const guardado = await marcarPagado(m.id, hoy())
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
          <button
            type="button"
            onClick={() => {
              olvidarActividad()
              supabase.auth.signOut({ scope: 'local' })
            }}
          >
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
            {!puedeEditar && (
              <p className="aviso permisos">
                Tu cuenta puede agregar movimientos y marcar pendientes como pagados. Para editar o borrar, pídelo a{' '}
                {CORREO_ADMIN}.
              </p>
            )}
            <MovementList
              movimientos={ordenados}
              onEditar={puedeEditar ? setEditando : undefined}
              onBorrar={puedeEditar ? borrar : undefined}
              onPagar={pagar}
            />
          </section>
        </div>
      </main>
      {restante !== null && (
        <div className="inactividad" role="alertdialog" aria-live="assertive" aria-labelledby="inactividad-titulo">
          <section>
            <h2 id="inactividad-titulo">¿Sigues ahí?</h2>
            <p>
              Por seguridad, tu sesión se cerrará en <strong>{restante} s</strong> por inactividad.
            </p>
            <button type="button" className="primario">
              Seguir aquí
            </button>
          </section>
        </div>
      )}
    </>
  )
}

export default App
