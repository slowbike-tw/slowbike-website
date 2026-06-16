create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  name text not null default '',
  category text not null default '',
  series text not null default '',
  english_series text not null default '',
  tagline text not null default '',
  description text not null default '',
  long_description text not null default '',
  price integer not null default 0,
  original_price integer,
  status text not null default 'draft',
  is_published boolean not null default false,
  show_on_home boolean not null default false,
  main_image text,
  gallery jsonb not null default '[]'::jsonb,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null default '',
  price integer not null default 0,
  battery text not null default '',
  motor text not null default '',
  range text not null default '',
  brakes text not null default '',
  note text not null default '',
  is_enabled boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null default '',
  color_code text not null default '#111111',
  image_url text,
  is_enabled boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_accessories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null default '',
  price integer not null default 0,
  description text not null default '',
  image_url text,
  is_enabled boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  usage text not null default 'gallery',
  image_url text not null default '',
  alt text not null default '',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_publish_sort_idx
  on public.products (is_published, sort_order);
create index if not exists product_variants_product_sort_idx
  on public.product_variants (product_id, sort_order);
create index if not exists product_colors_product_sort_idx
  on public.product_colors (product_id, sort_order);
create index if not exists product_accessories_product_sort_idx
  on public.product_accessories (product_id, sort_order);
create index if not exists product_images_product_sort_idx
  on public.product_images (product_id, sort_order);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_accessories enable row level security;
alter table public.product_images enable row level security;

grant select on table public.products to anon, authenticated;
grant select on table public.product_variants to anon, authenticated;
grant select on table public.product_colors to anon, authenticated;
grant select on table public.product_accessories to anon, authenticated;
grant select on table public.product_images to anon, authenticated;

grant select, insert, update, delete on table public.products to service_role;
grant select, insert, update, delete on table public.product_variants to service_role;
grant select, insert, update, delete on table public.product_colors to service_role;
grant select, insert, update, delete on table public.product_accessories to service_role;
grant select, insert, update, delete on table public.product_images to service_role;

drop policy if exists "Public reads published products" on public.products;
create policy "Public reads published products"
  on public.products for select
  to anon, authenticated
  using (is_published = true and status = 'published');

drop policy if exists "Public reads product variants" on public.product_variants;
create policy "Public reads product variants"
  on public.product_variants for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products
      where products.id = product_variants.product_id
        and products.is_published = true
        and products.status = 'published'
    )
  );

drop policy if exists "Public reads product colors" on public.product_colors;
create policy "Public reads product colors"
  on public.product_colors for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products
      where products.id = product_colors.product_id
        and products.is_published = true
        and products.status = 'published'
    )
  );

drop policy if exists "Public reads product accessories" on public.product_accessories;
create policy "Public reads product accessories"
  on public.product_accessories for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products
      where products.id = product_accessories.product_id
        and products.is_published = true
        and products.status = 'published'
    )
  );

drop policy if exists "Public reads product images" on public.product_images;
create policy "Public reads product images"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
        and products.is_published = true
        and products.status = 'published'
    )
  );
