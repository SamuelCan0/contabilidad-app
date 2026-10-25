-- Pega todo esto en Supabase → SQL Editor → New query → Run.

create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('ingreso', 'gasto', 'pendiente')),
  fecha date not null,
  monto numeric(12, 2) not null check (monto > 0),
  categoria text not null,
  nota text not null default '',
  creado_por uuid references auth.users default auth.uid(),
  creado_en timestamptz not null default now()
);

-- Solo usuarios con sesión iniciada pueden ver y cambiar movimientos.
-- Los dos socios comparten todos los movimientos.
alter table public.movimientos enable row level security;

drop policy if exists "socios pueden todo" on public.movimientos;
create policy "socios pueden todo" on public.movimientos
  for all to authenticated
  using (true)
  with check (true);

-- Si la tabla ya existía, esto permite el tipo 'pendiente' (pagos por cobrar).
alter table public.movimientos drop constraint if exists movimientos_tipo_check;
alter table public.movimientos add constraint movimientos_tipo_check
  check (tipo in ('ingreso', 'gasto', 'pendiente'));
