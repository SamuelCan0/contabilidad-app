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

// Error con un mensaje que sí se le puede mostrar al usuario.
export class ErrorVisible extends Error {}

// Códigos de Supabase cuando la función marcar_pagado no existe en la base
// (no se corrió el SQL) o el caché de Supabase todavía no la ve.
const FUNCION_FALTANTE = ['PGRST202', '42883']

// Usa una función de Supabase para que cualquier usuario pueda cobrar un pendiente
// sin tener permiso de editar.
export async function marcarPagado(id, fecha) {
  const { data, error } = await supabase.rpc('marcar_pagado', { p_id: id, p_fecha: fecha })

  if (error && FUNCION_FALTANTE.includes(error.code)) {
    console.error('marcar_pagado no existe en Supabase:', error)
    return marcarPagadoDirecto(id, fecha)
  }
  if (error) {
    console.error('Error al marcar como pagado:', error)
    throw error
  }

  // Según la versión, Supabase regresa la fila sola o dentro de una lista.
  const fila = Array.isArray(data) ? data[0] : data
  if (!fila?.id) throw new ErrorVisible('Ese pago ya no está pendiente. Recarga la página.')
  return normalizar(fila)
}

// Plan B si falta la función: actualiza la fila directo. Solo funciona para el
// admin (las reglas de la base no dejan editar a los demás).
async function marcarPagadoDirecto(id, fecha) {
  const data = revisar(
    await supabase
      .from('movimientos')
      .update({ tipo: 'ingreso', fecha })
      .eq('id', id)
      .eq('tipo', 'pendiente')
      .select(CAMPOS),
  )
  if (!data?.length) {
    throw new ErrorVisible(
      'Falta activar "Marcar como pagado" en Supabase. Corre otra vez supabase/schema.sql en el SQL Editor.',
    )
  }
  return normalizar(data[0])
}
