import { useState } from 'react'
import { supabase } from './supabase.js'
import Logo from './Logo.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const entrar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos.')
    setCargando(false)
  }

  return (
    <main className="login">
      <section>
        <div className="marca">
          <Logo className="logo" />
          <h1>Contabilidad</h1>
        </div>
        <h2>Iniciar sesión</h2>
        <form className="form" onSubmit={entrar}>
          <label>
            Correo
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="acciones">
            <button type="submit" className="primario" disabled={cargando}>
              {cargando ? 'Entrando…' : 'Entrar'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
