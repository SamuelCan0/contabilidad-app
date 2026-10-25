// Por ahora los movimientos viven en el navegador.
// En el paso 4 este módulo se cambia por Supabase sin tocar los componentes.
const KEY = 'contabilidad.movimientos'

export function cargarMovimientos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function guardarMovimientos(movimientos) {
  localStorage.setItem(KEY, JSON.stringify(movimientos))
}
