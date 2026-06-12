create extension if not exists pgcrypto;

create table if not exists public.logistics_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  business_type text not null,
  customer jsonb not null default '{}'::jsonb,
  product jsonb not null default '{}'::jsonb,
  tracking jsonb not null default '{}'::jsonb,
  packages jsonb not null default '[]'::jsonb,
  logistics_status text not null default '待出貨',
  assembly_method text not null default '不需組裝',
  assembly_status text not null default '不需組裝',
  assembly_store text not null default '',
  delivery_status text not null default '未交車',
  delivery_method text not null default '',
  created_by text not null default '',
  responsible_store text not null default '',
  logistics_party text not null default '',
  notes text not null default '',
  progress jsonb not null default '[]'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists logistics_orders_created_at_idx
  on public.logistics_orders (created_at desc);

create index if not exists logistics_orders_status_idx
  on public.logistics_orders (logistics_status);

alter table public.logistics_orders enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.logistics_orders to anon, authenticated;

drop policy if exists "V2 logistics orders read" on public.logistics_orders;
create policy "V2 logistics orders read"
  on public.logistics_orders for select
  to anon, authenticated
  using (true);

drop policy if exists "V2 logistics orders insert" on public.logistics_orders;
create policy "V2 logistics orders insert"
  on public.logistics_orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "V2 logistics orders update" on public.logistics_orders;
create policy "V2 logistics orders update"
  on public.logistics_orders for update
  to anon, authenticated
  using (true)
  with check (true);

create or replace function public.set_logistics_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists logistics_orders_updated_at on public.logistics_orders;
create trigger logistics_orders_updated_at
before update on public.logistics_orders
for each row execute function public.set_logistics_orders_updated_at();
