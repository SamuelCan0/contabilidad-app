import { useEffect, useState } from 'react'

export const LIMITE_MS = 10 * 60 * 1000 // 10 min sin actividad → cerrar sesión
export const AVISO_MS = 60 * 1000 // avisar 1 min antes
const CLAVE = 'figurart-ultima-actividad'
const EVENTOS = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'wheel', 'touchstart']

const leer = () => {
  try {
    return Number(window.sessionStorage.getItem(CLAVE)) || 0
  } catch {
    return 0
  }
}

const guardar = (t) => {
  try {
    window.sessionStorage.setItem(CLAVE, String(t))
  } catch {
    // sin sessionStorage solo se pierde el control tras un refresh
  }
}

export const olvidarActividad = () => {
  try {
    window.sessionStorage.removeItem(CLAVE)
  } catch {
    // nada que borrar
  }
}

// ¿La última actividad guardada (antes de un refresh) ya pasó el límite?
export const sesionVencida = () => {
  const ultima = leer()
  return ultima > 0 && Date.now() - ultima >= LIMITE_MS
}

// Cuenta el tiempo sin actividad. Devuelve los segundos que faltan para
// cerrar la sesión cuando queda menos de 1 min, o null si no hay que avisar.
// Cualquier click, tecla, scroll o movimiento reinicia la cuenta.
export function useInactividad(alVencer) {
  const [restante, setRestante] = useState(null)

  useEffect(() => {
    let ultima = Date.now()
    let anterior = 0
    guardar(ultima)

    const actividad = () => {
      const ahora = Date.now()
      // Si ya se venció (p. ej. al volver de otra pestaña), no se revive.
      if (ahora - ultima >= LIMITE_MS) return revisar()
      // pointermove y scroll disparan muchas veces; basta con 1 por segundo
      if (ahora - anterior < 1000) return
      anterior = ahora
      ultima = ahora
      guardar(ahora)
      setRestante(null)
    }

    // Revisamos el reloj cada segundo en vez de un solo setTimeout largo:
    // los navegadores frenan los timers en pestañas de fondo o con la
    // compu suspendida, y así la cuenta sigue siendo exacta.
    const revisar = () => {
      const pasado = Date.now() - ultima
      if (pasado >= LIMITE_MS) {
        clearInterval(reloj)
        olvidarActividad()
        alVencer()
      } else if (pasado >= LIMITE_MS - AVISO_MS) {
        setRestante(Math.ceil((LIMITE_MS - pasado) / 1000))
      }
    }

    const reloj = setInterval(revisar, 1000)
    EVENTOS.forEach((e) => window.addEventListener(e, actividad, { passive: true, capture: true }))
    document.addEventListener('visibilitychange', revisar)
    return () => {
      clearInterval(reloj)
      EVENTOS.forEach((e) => window.removeEventListener(e, actividad, { capture: true }))
      document.removeEventListener('visibilitychange', revisar)
    }
  }, [alVencer])

  return restante
}
