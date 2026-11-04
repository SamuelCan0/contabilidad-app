-- Pega todo esto en Supabase → SQL Editor → New query → Run.

create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('ingreso', 'gasto', 'pendiente')),
  fecha date not null,
  monto numeric(12, 2) not null check (monto > 0),
  categoria text not null,
  cliente text not null default '',
  nota text not null default '',
  creado_por uuid references auth.users default auth.uid(),
  creado_en timestamptz not null default now()
);

-- Permisos:
--   * Todos los usuarios con sesión pueden ver y agregar movimientos.
--   * Todos pueden marcar un pendiente como pagado (función marcar_pagado, abajo).
--   * Solo info@figurart.org puede editar y borrar.
-- Si cambias el correo, cámbialo también en src/permisos.js.
alter table public.movimientos enable row level security;

drop policy if exists "socios pueden todo" on public.movimientos;

drop policy if exists "usuarios pueden ver" on public.movimientos;
create policy "usuarios pueden ver" on public.movimientos
  for select to authenticated
  using (true);

drop policy if exists "usuarios pueden agregar" on public.movimientos;
create policy "usuarios pueden agregar" on public.movimientos
  for insert to authenticated
  with check (true);

drop policy if exists "admin puede editar" on public.movimientos;
create policy "admin puede editar" on public.movimientos
  for update to authenticated
  using (lower(auth.jwt() ->> 'email') = 'info@figurart.org')
  with check (lower(auth.jwt() ->> 'email') = 'info@figurart.org');

drop policy if exists "admin puede borrar" on public.movimientos;
create policy "admin puede borrar" on public.movimientos
  for delete to authenticated
  using (lower(auth.jwt() ->> 'email') = 'info@figurart.org');

-- Si la tabla ya existía, esto permite el tipo 'pendiente' (pagos por cobrar).
alter table public.movimientos drop constraint if exists movimientos_tipo_check;
alter table public.movimientos add constraint movimientos_tipo_check
  check (tipo in ('ingreso', 'gasto', 'pendiente'));

-- Si la tabla ya existía, esto agrega el nombre del cliente o proveedor.
alter table public.movimientos add column if not exists cliente text not null default '';

-- Marcar como pagado: cualquier usuario con sesión puede convertir un pendiente
-- en ingreso. Solo cambia tipo y fecha; no permite editar nada más.
create or replace function public.marcar_pagado(p_id uuid, p_fecha date)
returns public.movimientos
language sql
security definer
set search_path = public
as $$
  update public.movimientos
     set tipo = 'ingreso', fecha = p_fecha
   where id = p_id and tipo = 'pendiente'
  returning *;
$$;

revoke all on function public.marcar_pagado(uuid, date) from public, anon;
grant execute on function public.marcar_pagado(uuid, date) to authenticated;
