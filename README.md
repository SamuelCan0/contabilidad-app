# Contabilidad

App web para registrar ingresos y gastos del negocio y verlos en un dashboard.
Hecha con React + Vite. Los datos viven en Supabase.

## Correr en tu compu

```
npm install
npm run dev
```

## Configurar Supabase (una sola vez)

1. En Supabase → SQL Editor, pega y corre `supabase/schema.sql`.
2. En Authentication → Sign In / Providers, apaga "Allow new users to sign up".
3. En Authentication → Users → Add user, crea un usuario por socio (correo y contraseña).

## Publicar en Vercel

Importa el repo en vercel.com. Vercel detecta Vite solo. Las variables de `.env` ya vienen en el repo.

## Seguridad de la sesión

- **10 min sin actividad:** la sesión se cierra sola. Un minuto antes sale el aviso "¿Sigues ahí?". Cualquier click, tecla, scroll o movimiento del mouse reinicia la cuenta (`src/inactividad.js`).
- **Cerrar la pestaña:** la sesión se guarda en `sessionStorage`, no en `localStorage`. Un refresh la conserva; cerrar la pestaña o el navegador la borra y al volver pide correo y contraseña.
- **Contraseñas:** la app nunca guarda contraseñas. Las maneja Supabase Auth, que las almacena cifradas con bcrypt (hash con sal, no se pueden leer ni de vuelta). Ni el admin del proyecto puede verlas; solo se pueden cambiar. Viajan por HTTPS.
