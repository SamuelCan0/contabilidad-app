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
