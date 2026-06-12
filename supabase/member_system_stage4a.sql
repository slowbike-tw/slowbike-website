alter table public.logistics_orders
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table public.logistics_orders
  add column if not exists customer_order_id uuid;

alter table public.logistics_orders
  add column if not exists logistics_source text not null default '後台人工';

alter table public.logistics_orders
  add column if not exists source_order_no text not null default '';

alter table public.logistics_orders
  add column if not exists customer_phone text not null default '';

alter table public.logistics_orders
  add column if not exists customer_email text not null default '';

create index if not exists logistics_orders_auth_user_id_idx
  on public.logistics_orders (auth_user_id);

create table if not exists public.order_drafts (
  id uuid primary key default gen_random_uuid(),
  confirmation_token uuid not null unique default gen_random_uuid(),
  draft_no text not null unique,
  auth_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text not null default '',
  items jsonb not null default '[]'::jsonb,
  total integer not null default 0,
  notes text not null default '',
  status text not null default 'draft',
  created_by text not null default '',
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_drafts_contact_required
    check (customer_email <> '' or customer_phone <> '')
);

create index if not exists order_drafts_auth_user_id_idx
  on public.order_drafts (auth_user_id, created_at desc);

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  source_draft_id uuid unique references public.order_drafts(id) on delete set null,
  order_no text not null unique,
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  shipping_fee integer not null default 0,
  total integer not null default 0,
  currency text not null default 'TWD',
  order_status text not null default 'inquiry',
  payment_status text not null default 'unpaid',
  delivery_method text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_orders_auth_user_id_idx
  on public.customer_orders (auth_user_id, created_at desc);

create table if not exists public.member_warranties (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  customer_order_id uuid references public.customer_orders(id) on delete set null,
  product_name text not null,
  serial_number text,
  warranty_data jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_warranties_auth_user_id_idx
  on public.member_warranties (auth_user_id, created_at desc);

alter table public.customer_orders enable row level security;
alter table public.member_warranties enable row level security;
alter table public.order_drafts enable row level security;

grant select on table public.logistics_orders to authenticated;
grant select, insert, update on table public.customer_orders to authenticated;
grant select on table public.member_warranties to authenticated;
grant insert on table public.order_drafts to anon, authenticated;
grant select on table public.order_drafts to authenticated;

drop policy if exists "Staff create order drafts" on public.order_drafts;
create policy "Staff create order drafts"
  on public.order_drafts for insert
  to anon, authenticated
  with check (auth_user_id is null and status = 'draft');

drop policy if exists "Members read claimed drafts" on public.order_drafts;
create policy "Members read claimed drafts"
  on public.order_drafts for select
  to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists "V2 logistics orders read" on public.logistics_orders;
create policy "V2 logistics orders read"
  on public.logistics_orders for select
  to anon
  using (true);

drop policy if exists "V2 logistics orders insert" on public.logistics_orders;
create policy "V2 logistics orders insert"
  on public.logistics_orders for insert
  to anon
  with check (true);

drop policy if exists "V2 logistics orders update" on public.logistics_orders;
create policy "V2 logistics orders update"
  on public.logistics_orders for update
  to anon
  using (true)
  with check (true);

drop policy if exists "Members read own orders" on public.customer_orders;
create policy "Members read own orders"
  on public.customer_orders for select
  to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists "Members create own orders" on public.customer_orders;
create policy "Members create own orders"
  on public.customer_orders for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

drop policy if exists "Members update own orders" on public.customer_orders;
create policy "Members update own orders"
  on public.customer_orders for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

drop policy if exists "Members read own warranties" on public.member_warranties;
create policy "Members read own warranties"
  on public.member_warranties for select
  to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists "Members read own logistics" on public.logistics_orders;
create policy "Members read own logistics"
  on public.logistics_orders for select
  to authenticated
  using (auth.uid() = auth_user_id);

create or replace function public.get_order_draft_by_token(draft_token uuid)
returns setof public.order_drafts
language sql
security definer
set search_path = public
as $$
  select *
  from public.order_drafts
  where confirmation_token = draft_token
    and status not in ('cancelled', 'paid')
  limit 1;
$$;

revoke all on function public.get_order_draft_by_token(uuid) from public;
grant execute on function public.get_order_draft_by_token(uuid) to anon, authenticated;

create or replace function public.claim_order_draft(draft_token uuid)
returns setof public.order_drafts
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  draft public.order_drafts;
  current_email text;
  current_phone text;
begin
  if auth.uid() is null then
    raise exception '請先登入會員';
  end if;

  select lower(coalesce(email, '')),
         regexp_replace(
           coalesce(phone, raw_user_meta_data->>'phone', ''),
           '[^0-9+]',
           '',
           'g'
         )
  into current_email, current_phone
  from auth.users
  where id = auth.uid();

  select *
  into draft
  from public.order_drafts
  where confirmation_token = draft_token
  for update;

  if draft.id is null or draft.status in ('cancelled', 'paid') then
    raise exception '訂單草稿不存在或已失效';
  end if;

  if draft.auth_user_id is not null and draft.auth_user_id <> auth.uid() then
    raise exception '此訂單已綁定其他會員';
  end if;

  if not (
    (draft.customer_email <> '' and lower(draft.customer_email) = current_email)
    or
    (
      draft.customer_phone <> ''
      and regexp_replace(draft.customer_phone, '[^0-9+]', '', 'g') = current_phone
    )
  ) then
    raise exception '登入 Email 或手機與訂單草稿不符';
  end if;

  update public.order_drafts
  set auth_user_id = auth.uid(),
      status = 'awaiting_payment',
      claimed_at = coalesce(claimed_at, now()),
      updated_at = now()
  where id = draft.id
  returning * into draft;

  return next draft;
end;
$$;

revoke all on function public.claim_order_draft(uuid) from public;
grant execute on function public.claim_order_draft(uuid) to authenticated;
