-- Server-side commerce APIs use SUPABASE_SERVICE_ROLE_KEY through PostgREST.
-- The service_role bypasses RLS, but still needs table-level privileges.

grant usage on schema public to service_role;

grant select, insert, update on table public.customer_orders to service_role;
grant select, insert, update on table public.order_drafts to service_role;
grant select, insert, update on table public.member_profiles to service_role;
grant select, insert, update, delete on table public.logistics_orders to service_role;
grant select, insert, update on table public.payment_settings to service_role;

grant execute on function public.finalize_paid_order(text, jsonb) to service_role;
