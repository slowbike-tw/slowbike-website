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

grant delete on table public.logistics_orders to anon;

drop policy if exists "V2 logistics orders delete" on public.logistics_orders;
create policy "V2 logistics orders delete"
  on public.logistics_orders for delete
  to anon
  using (true);

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

create table if not exists public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  line_id text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_profiles_contact_required
    check (email <> '' or phone <> '')
);

create unique index if not exists member_profiles_email_unique_idx
  on public.member_profiles (lower(email))
  where email <> '';

create unique index if not exists member_profiles_phone_unique_idx
  on public.member_profiles (
    regexp_replace(phone, '[^0-9+]', '', 'g')
  )
  where phone <> '';

alter table public.order_drafts
  add column if not exists order_source text not null default '後台人工',
  add column if not exists business_type text not null default '標準車款',
  add column if not exists member_profile_id uuid references public.member_profiles(id) on delete set null,
  add column if not exists line_id text not null default '',
  add column if not exists product_summary text not null default '',
  add column if not exists custom_details jsonb not null default '{}'::jsonb,
  add column if not exists logistics_template jsonb not null default '{}'::jsonb,
  add column if not exists deposit_amount integer not null default 0,
  add column if not exists balance_amount integer not null default 0,
  add column if not exists delivery_method text not null default '',
  add column if not exists assembly_method text not null default '',
  add column if not exists assembly_store text not null default '',
  add column if not exists shipping_address text not null default '',
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists responsible_store text not null default '',
  add column if not exists linked_logistics_order_id uuid references public.logistics_orders(id) on delete set null;

alter table public.customer_orders
  add column if not exists order_source text not null default '官網訂單',
  add column if not exists business_type text not null default '標準車款',
  add column if not exists member_profile_id uuid references public.member_profiles(id) on delete set null,
  add column if not exists customer_name text not null default '',
  add column if not exists customer_phone text not null default '',
  add column if not exists customer_email text not null default '',
  add column if not exists line_id text not null default '',
  add column if not exists product_summary text not null default '',
  add column if not exists custom_details jsonb not null default '{}'::jsonb,
  add column if not exists deposit_amount integer not null default 0,
  add column if not exists balance_amount integer not null default 0,
  add column if not exists checkout_url_token uuid,
  add column if not exists created_by text not null default '',
  add column if not exists responsible_store text not null default '',
  add column if not exists linked_logistics_order_id uuid references public.logistics_orders(id) on delete set null;

alter table public.member_profiles enable row level security;
grant select on table public.member_profiles to authenticated;

alter table public.logistics_orders
  add column if not exists member_id uuid references public.member_profiles(id) on delete set null,
  add column if not exists order_id uuid references public.customer_orders(id) on delete set null;

create index if not exists logistics_orders_member_id_idx
  on public.logistics_orders (member_id);

create index if not exists logistics_orders_order_id_idx
  on public.logistics_orders (order_id);

drop policy if exists "Members read own profile" on public.member_profiles;
create policy "Members read own profile"
  on public.member_profiles for select
  to authenticated
  using (auth.uid() = auth_user_id);

create or replace function public.create_order_draft(draft_data jsonb)
returns setof public.order_drafts
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.member_profiles;
  created_draft public.order_drafts;
  normalized_email text := lower(trim(coalesce(draft_data->>'customer_email', '')));
  normalized_phone text := regexp_replace(
    coalesce(draft_data->>'customer_phone', ''),
    '[^0-9+]',
    '',
    'g'
  );
begin
  if normalized_email = '' and normalized_phone = '' then
    raise exception 'Email 或手機至少需要填寫一項';
  end if;

  select *
  into profile
  from public.member_profiles
  where
    (normalized_email <> '' and lower(email) = normalized_email)
    or
    (
      normalized_phone <> ''
      and regexp_replace(phone, '[^0-9+]', '', 'g') = normalized_phone
    )
  order by created_at
  limit 1;

  if profile.id is null then
    insert into public.member_profiles (name, phone, email, line_id)
    values (
      coalesce(draft_data->>'customer_name', ''),
      coalesce(draft_data->>'customer_phone', ''),
      normalized_email,
      coalesce(draft_data->>'line_id', '')
    )
    returning * into profile;
  else
    update public.member_profiles
    set name = coalesce(nullif(draft_data->>'customer_name', ''), name),
        phone = coalesce(nullif(draft_data->>'customer_phone', ''), phone),
        email = coalesce(nullif(normalized_email, ''), email),
        line_id = coalesce(nullif(draft_data->>'line_id', ''), line_id),
        updated_at = now()
    where id = profile.id
    returning * into profile;
  end if;

  insert into public.order_drafts (
    confirmation_token,
    draft_no,
    order_source,
    business_type,
    member_profile_id,
    customer_name,
    customer_email,
    customer_phone,
    line_id,
    product_summary,
    custom_details,
    logistics_template,
    items,
    total,
    deposit_amount,
    balance_amount,
    delivery_method,
    assembly_method,
    assembly_store,
    shipping_address,
    notes,
    payment_status,
    status,
    created_by,
    responsible_store
  )
  values (
    (draft_data->>'confirmation_token')::uuid,
    draft_data->>'draft_no',
    coalesce(draft_data->>'order_source', '後台人工'),
    draft_data->>'business_type',
    profile.id,
    draft_data->>'customer_name',
    normalized_email,
    draft_data->>'customer_phone',
    coalesce(draft_data->>'line_id', ''),
    coalesce(draft_data->>'product_summary', ''),
    coalesce(draft_data->'custom_details', '{}'::jsonb),
    coalesce(draft_data->'logistics_template', '{}'::jsonb),
    coalesce(draft_data->'items', '[]'::jsonb),
    coalesce((draft_data->>'total')::integer, 0),
    coalesce((draft_data->>'deposit_amount')::integer, 0),
    coalesce((draft_data->>'balance_amount')::integer, 0),
    coalesce(draft_data->>'delivery_method', ''),
    coalesce(draft_data->>'assembly_method', ''),
    coalesce(draft_data->>'assembly_store', ''),
    coalesce(draft_data->>'shipping_address', ''),
    coalesce(draft_data->>'notes', ''),
    'unpaid',
    'draft',
    coalesce(draft_data->>'created_by', ''),
    coalesce(draft_data->>'responsible_store', '')
  )
  returning * into created_draft;

  return next created_draft;
end;
$$;

revoke all on function public.create_order_draft(jsonb) from public;
grant execute on function public.create_order_draft(jsonb) to anon, authenticated;

create or replace function public.claim_order_draft(draft_token uuid)
returns setof public.order_drafts
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  draft public.order_drafts;
  profile public.member_profiles;
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

  select *
  into profile
  from public.member_profiles
  where id = draft.member_profile_id
  for update;

  if profile.auth_user_id is not null and profile.auth_user_id <> auth.uid() then
    raise exception '此客戶資料已綁定其他會員';
  end if;

  update public.member_profiles
  set auth_user_id = auth.uid(),
      updated_at = now()
  where id = profile.id;

  update public.order_drafts
  set auth_user_id = auth.uid(),
      status = 'awaiting_payment',
      payment_status = 'unpaid',
      claimed_at = coalesce(claimed_at, now()),
      updated_at = now()
  where id = draft.id
  returning * into draft;

  return next draft;
end;
$$;

revoke all on function public.claim_order_draft(uuid) from public;
grant execute on function public.claim_order_draft(uuid) to authenticated;
