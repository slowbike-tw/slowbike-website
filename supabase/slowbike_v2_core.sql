create extension if not exists pgcrypto;

create table if not exists public.sb_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text not null default '',
  price integer not null default 0,
  "imagePath" text not null default '',
  summary text not null default '',
  specs text not null default '',
  highlights text not null default '',
  "salesCopy" text not null default '',
  status text not null default 'active',
  "sortOrder" integer not null default 100,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.sb_members (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text not null,
  "idNumber" text not null default '',
  "lineName" text not null default '',
  email text not null default '',
  address text not null default '',
  note text not null default '',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.sb_member_vehicles (
  id uuid primary key default gen_random_uuid(),
  "memberPhone" text not null default '',
  "ownerName" text not null default '',
  model text not null,
  color text not null default '',
  "frameNo" text not null default '',
  "motorNo" text not null default '',
  "batteryNo" text not null default '',
  "purchaseDate" text not null default '',
  "warrantyStart" text not null default '',
  "warrantyEnd" text not null default '',
  note text not null default '',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.sb_payment_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  title text not null,
  model text not null,
  color text not null default '',
  amount integer not null,
  "stockQuantity" integer not null default 1,
  "paymentMode" text not null default 'once',
  note text not null default '',
  status text not null default 'active',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.sb_orders (
  id uuid primary key default gen_random_uuid(),
  "merchantOrderNo" text not null unique,
  "paymentLinkToken" text not null default '',
  "buyerName" text not null default '',
  "buyerPhone" text not null default '',
  "buyerLineName" text not null default '',
  "buyerEmail" text not null default '',
  amount integer not null default 0,
  "paymentMode" text not null default 'once',
  status text not null default 'pending',
  "newebpayTradeNo" text not null default '',
  "respondCode" text not null default '',
  "paidAt" text not null default '',
  "rawResponse" text not null default '',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.sb_logistics_orders (
  id uuid primary key default gen_random_uuid(),
  "batchNo" text not null unique,
  "memberPhone" text not null default '',
  "customerName" text not null default '',
  "itemName" text not null,
  "chinaTrackingNos" text not null default '',
  "taiwanTrackingNos" text not null default '',
  "packageCount" integer not null default 1,
  "weightKg" text not null default '',
  volume text not null default '',
  "rmbCost" integer not null default 0,
  "twdCost" integer not null default 0,
  "exchangeRate" text not null default '',
  status text not null default '待入庫',
  "mergeSplitNote" text not null default '',
  note text not null default '',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.sb_logistics_files (
  id uuid primary key default gen_random_uuid(),
  "logisticsOrderId" uuid not null references public.sb_logistics_orders(id) on delete cascade,
  "fileKey" text not null,
  "fileName" text not null,
  "contentType" text not null default 'application/octet-stream',
  "fileSize" integer not null default 0,
  "publicUrl" text not null default '',
  note text not null default '',
  "createdAt" timestamptz not null default now()
);

create index if not exists sb_products_status_sort_idx on public.sb_products(status, "sortOrder");
create index if not exists sb_members_phone_idx on public.sb_members(phone);
create index if not exists sb_member_vehicles_phone_idx on public.sb_member_vehicles("memberPhone");
create index if not exists sb_orders_status_idx on public.sb_orders(status);
create index if not exists sb_logistics_orders_status_idx on public.sb_logistics_orders(status);

alter table public.sb_products enable row level security;
alter table public.sb_members enable row level security;
alter table public.sb_member_vehicles enable row level security;
alter table public.sb_payment_links enable row level security;
alter table public.sb_orders enable row level security;
alter table public.sb_logistics_orders enable row level security;
alter table public.sb_logistics_files enable row level security;

grant select on public.sb_products to anon, authenticated;
grant all on public.sb_products to service_role;
grant all on public.sb_members to service_role;
grant all on public.sb_member_vehicles to service_role;
grant all on public.sb_payment_links to service_role;
grant all on public.sb_orders to service_role;
grant all on public.sb_logistics_orders to service_role;
grant all on public.sb_logistics_files to service_role;

drop policy if exists "Public reads active products" on public.sb_products;
create policy "Public reads active products"
  on public.sb_products for select
  to anon, authenticated
  using (status = 'active');

insert into public.sb_products
  (slug, name, subtitle, price, "imagePath", summary, specs, highlights, "salesCopy", status, "sortOrder")
values
  (
    'noma',
    'NOMA',
    '生活代步車',
    29500,
    '/images/products/noma-main.jpg',
    '低跨點車架，前車籃加後座墊與腰靠，適合日常代步與生活使用。',
    '500W 電機
時速約 40 公里
15Ah 鋰電池
續航約 35 公里
升級油壓碟煞
前車籃
後座墊＋腰靠',
    '低跨點，上下車更輕鬆
前後置物與乘坐配置完整
適合通勤、買菜、日常代步',
    'NOMA 是 SlowBike 的生活代步車，重點不是追求速度，而是讓日常使用更輕鬆。',
    'active',
    1
  ),
  (
    'fold',
    'FOLD',
    '鋁合金折疊車',
    36500,
    '/images/products/fold-main.jpg',
    '鋁合金折疊車架，20 吋一體輪，適合日常代步、露營旅行與車廂收納。',
    '500W 電機
時速約 45 公里
15Ah 內置鋰電池
續航約 35 公里
升級油壓碟煞
20 吋一體輪
鋁合金折疊車架',
    '好收納、好攜帶
適合露營旅行與休旅車廂收納
奶油白車色，外型簡單俐落',
    'FOLD 是 SlowBike 的鋁合金折疊車，適合想要兼顧質感、收納與日常代步的使用者。',
    'active',
    2
  ),
  (
    'city',
    'CITY',
    '高規通勤車',
    38500,
    '/images/products/city-main.jpg',
    '1000W 高動力、20Ah 鋰電池，標配全鋁可調式液壓前叉，適合高規格通勤。',
    '1000W 電機
20Ah 鋰電池
時速約 55 公里
續航約 45 公里
升級油壓碟煞
標配全鋁可調式液壓前叉
中置籃
高碳鋼車架
一體輪
防盜遙控＋一鍵啟動
前後方向燈',
    '1000W 高動力
20Ah 大容量電池
適合高規格通勤與日常騎乘',
    'CITY 是 SlowBike 的高規通勤車，1000W 電機搭配 20Ah 鋰電池，重點是動力、續航與騎乘穩定性。',
    'active',
    3
  )
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('slowbike-logistics', 'slowbike-logistics', true)
on conflict (id) do update set public = true;
