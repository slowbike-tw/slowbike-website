create extension if not exists pgcrypto;

alter table public.customer_orders
  add column if not exists member_id uuid references public.member_profiles(id) on delete set null,
  add column if not exists customer_name text not null default '',
  add column if not exists customer_phone text not null default '',
  add column if not exists customer_email text not null default '',
  add column if not exists line_id text not null default '',
  add column if not exists order_source text not null default '官網訂單',
  add column if not exists business_type text not null default '標準車款',
  add column if not exists total_amount integer not null default 0,
  add column if not exists delivery_fee integer not null default 0,
  add column if not exists address text not null default '',
  add column if not exists note text not null default '',
  add column if not exists payment_method text not null default 'credit',
  add column if not exists newebpay_trade_no text,
  add column if not exists newebpay_response jsonb not null default '{}'::jsonb,
  add column if not exists checkout_token uuid not null default gen_random_uuid(),
  add column if not exists linked_logistics_order_id uuid references public.logistics_orders(id) on delete set null,
  add column if not exists created_by text not null default '',
  add column if not exists responsible_store text not null default '';

create unique index if not exists customer_orders_checkout_token_idx
  on public.customer_orders (checkout_token);

create table if not exists public.payment_settings (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null default '',
  bank_code text not null default '',
  account_name text not null default '',
  account_number text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_settings enable row level security;
grant select on table public.payment_settings to anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update on table public.customer_orders to service_role;
grant select, insert, update on table public.order_drafts to service_role;
grant select, insert, update on table public.member_profiles to service_role;
grant select, insert, update, delete on table public.logistics_orders to service_role;
grant select, insert, update on table public.payment_settings to service_role;

drop policy if exists "Public reads payment settings" on public.payment_settings;
create policy "Public reads payment settings"
  on public.payment_settings for select
  to anon, authenticated
  using (true);

create or replace function public.finalize_paid_order(
  target_order_no text,
  payment_response jsonb default '{}'::jsonb
)
returns setof public.customer_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.customer_orders;
  logistics_id uuid;
  logistics_no text;
  template jsonb;
  first_item jsonb;
  product_type text;
  assembly_method_value text;
  assembly_status_value text;
  delivery_status_value text;
  logistics_status_value text;
begin
  select * into target
  from public.customer_orders
  where order_no = target_order_no
  for update;

  if target.id is null then
    raise exception '找不到訂單';
  end if;

  if target.payment_status = 'paid' then
    return next target;
    return;
  end if;

  first_item := coalesce(target.items->0, '{}'::jsonb);

  if target.business_type = '大陸產品代購' then
    product_type := '一般商品代購';
    logistics_status_value := '待採購';
    assembly_method_value := '不需組裝';
    assembly_status_value := '不適用';
    delivery_status_value := '不適用';
    template := jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid(),
        'name', '商品',
        'itemType', '其他',
        'customItemName', coalesce(first_item->>'productName', '商品'),
        'handler', '四葉物流',
        'handlerUnit', '四葉物流',
        'shippingMethod', '',
        'status', '待採購',
        'trackingNumber', '',
        'note', ''
      )
    );
  elsif target.business_type = '大陸電動車運輸' then
    product_type := '代購代運電動車';
    logistics_status_value := '待收貨';
    assembly_method_value := '門市組裝';
    assembly_status_value := '待組裝';
    delivery_status_value := '未交車';
    template := jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid(), 'name', '車輪', 'itemType', '車輪', 'handler', '四葉物流', 'handlerUnit', '四葉物流', 'shippingMethod', '', 'status', '待收貨', 'trackingNumber', '', 'note', ''),
      jsonb_build_object('id', gen_random_uuid(), 'name', '車架', 'itemType', '車架', 'handler', '四葉物流', 'handlerUnit', '四葉物流', 'shippingMethod', '', 'status', '待收貨', 'trackingNumber', '', 'note', ''),
      jsonb_build_object('id', gen_random_uuid(), 'name', '電池', 'itemType', '電池', 'handler', '三哥國際物流', 'handlerUnit', '三哥國際物流', 'shippingMethod', '', 'status', '待收貨', 'trackingNumber', '', 'note', '')
    );
  else
    product_type := case when target.business_type = '客製車款' then '客製車款' else '標準車款' end;
    logistics_status_value := case when target.business_type = '客製車款' then '待製作' else '待出貨' end;
    assembly_method_value := '門市組裝';
    assembly_status_value := '待組裝';
    delivery_status_value := '未交車';
    template := jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid(), 'name', '車輪', 'itemType', '車輪', 'handler', 'SlowBike 營運管理端', 'handlerUnit', 'SlowBike 營運管理端', 'shippingMethod', '', 'status', logistics_status_value, 'trackingNumber', '', 'note', ''),
      jsonb_build_object('id', gen_random_uuid(), 'name', '車架', 'itemType', '車架', 'handler', 'SlowBike 營運管理端', 'handlerUnit', 'SlowBike 營運管理端', 'shippingMethod', '', 'status', logistics_status_value, 'trackingNumber', '', 'note', ''),
      jsonb_build_object('id', gen_random_uuid(), 'name', '電池', 'itemType', '電池', 'handler', 'SlowBike 營運管理端', 'handlerUnit', 'SlowBike 營運管理端', 'shippingMethod', '', 'status', logistics_status_value, 'trackingNumber', '', 'note', '')
    );
  end if;

  logistics_id := gen_random_uuid();
  logistics_no := 'LOG-' || target.order_no;

  insert into public.logistics_orders (
    id, member_id, order_id, auth_user_id, customer_order_id,
    logistics_source, source_order_no, customer_phone, customer_email,
    order_no, business_type, customer, product, tracking, packages,
    logistics_status, assembly_method, assembly_status, assembly_store,
    delivery_status, delivery_method, created_by, responsible_store,
    logistics_party, notes, progress, photos
  ) values (
    logistics_id, target.member_id, target.id, target.auth_user_id, target.id,
    '官網訂單', target.order_no, target.customer_phone, target.customer_email,
    logistics_no,
    case
      when target.business_type in ('標準車款', '客製車款') then '標準車款 / 客製車款'
      when target.business_type = '大陸電動車運輸' then '代購代運電動車'
      else '一般商品及特殊商品代購'
    end,
    jsonb_build_object(
      'name', target.customer_name,
      'phone', target.customer_phone,
      'email', target.customer_email,
      'lineId', target.line_id,
      'address', target.address,
      'note', target.note
    ),
    jsonb_build_object(
      'type', product_type,
      'name', coalesce(first_item->>'productName', 'SlowBike 訂單'),
      'specification', coalesce(first_item->>'specification', ''),
      'color', coalesce(first_item->>'color', ''),
      'battery', '',
      'note', ''
    ),
    '{}'::jsonb, template, logistics_status_value,
    assembly_method_value, assembly_status_value, target.responsible_store,
    delivery_status_value, target.delivery_method, target.created_by,
    target.responsible_store, '', target.note, '[]'::jsonb, '[]'::jsonb
  );

  update public.customer_orders
  set payment_status = 'paid',
      order_status = 'paid',
      newebpay_trade_no = coalesce(
        payment_response->'Result'->>'TradeNo',
        payment_response->>'TradeNo',
        newebpay_trade_no
      ),
      newebpay_response = payment_response,
      linked_logistics_order_id = logistics_id,
      updated_at = now()
  where id = target.id
  returning * into target;

  if target.source_draft_id is not null then
    update public.order_drafts
    set status = 'paid',
        payment_status = 'paid',
        linked_logistics_order_id = logistics_id,
        updated_at = now()
    where id = target.source_draft_id;
  end if;

  return next target;
end;
$$;

revoke all on function public.finalize_paid_order(text, jsonb) from public;
grant execute on function public.finalize_paid_order(text, jsonb) to service_role;
