import { createClient } from '@supabase/supabase-js'

// La sesión vive en sessionStorage: sobrevive a un refresh, pero se borra al
// cerrar la pestaña, así que al volver a entrar se pide la contraseña.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { storage: window.sessionStorage, persistSession: true } },
)

// Versiones anteriores guardaban la sesión en localStorage (no se borraba al
// cerrar la pestaña). La quitamos para que no quede un token olvidado.
try {
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
    .forEach((k) => window.localStorage.removeItem(k))
} catch {
  // Navegador sin acceso a localStorage: no hay nada que limpiar.
}
