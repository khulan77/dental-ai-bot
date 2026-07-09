-- =====================================================================
-- Rate limiting — Postgres дээр суурилсан (шинэ гадаад сервис хэрэггүй)
-- Supabase → SQL Editor → энэ файлыг хуулж RUN.
-- =====================================================================

create table if not exists public.rate_limits (
  key           text primary key,
  count         integer not null default 0,
  window_start  timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- Policy нэмэхгүй: зөвхөн service_role (admin client) хандах бөгөөд RLS-ийг тойрдог.

-- =====================================================================
-- check_rate_limit — атомик: тоолуурыг нэмж, хязгаараас доош эсэхийг буцаана.
--   p_key            : хязгаарлах түлхүүр (ж: "chat:1.2.3.4")
--   p_max            : цонхонд зөвшөөрөх дээд тоо
--   p_window_seconds : цонхны урт (секундээр)
--   → true бол зөвшөөрнө, false бол хэтэрсэн.
-- =====================================================================
create or replace function public.check_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
) returns boolean
language plpgsql
as $$
declare
  v_count int;
begin
  insert into public.rate_limits (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set
      count = case
        when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
          then 1
        else public.rate_limits.count + 1
      end,
      window_start = case
        when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
          then now()
        else public.rate_limits.window_start
      end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;
