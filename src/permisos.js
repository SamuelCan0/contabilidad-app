// Única cuenta que puede editar, borrar y marcar pendientes como pagados.
// Debe coincidir con el correo en las políticas de supabase/schema.sql.
export const CORREO_ADMIN = 'info@figurart.org'

export const esAdmin = (correo) => (correo ?? '').toLowerCase() === CORREO_ADMIN
