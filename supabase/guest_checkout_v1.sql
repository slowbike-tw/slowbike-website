-- SlowBike guest checkout for admin-created draft orders.
-- Safe migration: no table rebuild, no data deletion, RLS remains enabled.

alter table public.customer_orders
  alter column auth_user_id drop not null;

grant select, insert, update on table public.customer_orders to service_role;
grant select, insert, update on table public.order_drafts to service_role;
grant select, insert, update on table public.member_profiles to service_role;
grant select, insert, update on table public.logistics_orders to service_role;
