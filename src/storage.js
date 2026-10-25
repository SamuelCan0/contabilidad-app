import { supabase } from './supabase.js'

const CAMPOS = 'id, tipo, fecha, monto, categoria, cliente, nota'

// Supabase regresa numeric como texto; lo convertimos a número.
const normalizar = (m) => ({ ...m, monto: Number(m.monto), cliente: m.cliente ?? '' })

function revisar({ data, error }) {
  if (error) throw error
  return data
}

export async function cargarMovimientos() {
  const data = revisar(await supabase.from('movimientos').select(CAMPOS))
  return data.map(normalizar)
}

export async function crearMovimiento({ tipo, fecha, monto, categoria, cliente, nota }) {
  const data = revisar(
    await supabase
      .from('movimientos')
      .insert({ tipo, fecha, monto, categoria, cliente, nota })
      .select(CAMPOS)
      .single(),
  )
  return normalizar(data)
}

export async function actualizarMovimiento({ id, tipo, fecha, monto, categoria, cliente, nota }) {
  const data = revisar(
    await supabase
      .from('movimientos')
      .update({ tipo, fecha, monto, categoria, cliente, nota })
      .eq('id', id)
      .select(CAMPOS)
      .single(),
  )
  return normalizar(data)
}

export async function borrarMovimiento(id) {
  revisar(await supabase.from('movimientos').delete().eq('id', id))
}
