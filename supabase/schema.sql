-- =====================================================================
-- Dental AI Bot — өгөгдлийн сангийн бүтэц (schema)
-- Шинэ Supabase project дээр: SQL Editor → энэ файлыг бүхэлд нь хуулж RUN.
-- Код дотор ашиглагдаж буй хүснэгт/багана/RPC-үүдээс сэргээв.
-- =====================================================================

-- Semantic cache-д ашиглах vector extension
create extension if not exists vector;

-- =====================================================================
-- clinics
-- =====================================================================
create table if not exists public.clinics (
  id                       uuid primary key default gen_random_uuid(),
  owner_id                 uuid references auth.users (id) on delete cascade,
  name                     text not null,
  slug                     text unique not null,
  google_calendar_id       text,
  google_refresh_token     text,
  business_hours           jsonb,
  services                 jsonb not null default '[]'::jsonb,
  bot_personality          text,
  owner_phone              text,
  owner_email              text,
  is_active                boolean not null default true,
  about                    text,
  address                  text,
  website                  text,
  facebook_url             text,
  instagram_url            text,
  latitude                 double precision,
  longitude                double precision,
  cover_image_url          text,
  created_at               timestamptz not null default now()
);

create index if not exists clinics_owner_id_idx on public.clinics (owner_id);
create index if not exists clinics_slug_idx on public.clinics (slug);

-- =====================================================================
-- doctors
-- =====================================================================
create table if not exists public.doctors (
  id             uuid primary key default gen_random_uuid(),
  clinic_id      uuid not null references public.clinics (id) on delete cascade,
  name           text not null,
  specialty      text,
  bio            text,
  email          text,                        -- цаг захиалгын мэдэгдэл хүлээн авах хаяг
  avatar_url     text,
  custom_hours   jsonb,                       -- null бол clinic default цаг
  service_ids    jsonb not null default '[]'::jsonb,  -- empty array бол бүх үйлчилгээ
  is_active      boolean not null default true,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists doctors_clinic_id_idx on public.doctors (clinic_id);

-- =====================================================================
-- branches — эмнэлгийн салбар (олон хаяг). Салбаргүй эмнэлэг ажиллана.
-- =====================================================================
create table if not exists public.branches (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references public.clinics (id) on delete cascade,
  name            text not null,
  address         text,
  phone           text,
  business_hours  jsonb,                       -- null бол clinic default цаг
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists branches_clinic_id_idx on public.branches (clinic_id);

-- doctor_branches — эмч ↔ салбар (олон-олон)
create table if not exists public.doctor_branches (
  doctor_id  uuid not null references public.doctors (id)  on delete cascade,
  branch_id  uuid not null references public.branches (id) on delete cascade,
  primary key (doctor_id, branch_id)
);

create index if not exists doctor_branches_branch_idx on public.doctor_branches (branch_id);

-- =====================================================================
-- appointments
-- =====================================================================
create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  clinic_id         uuid not null references public.clinics (id) on delete cascade,
  doctor_id         uuid references public.doctors (id) on delete set null,
  branch_id         uuid references public.branches (id) on delete set null,
  customer_name     text not null,
  customer_phone    text,
  service           text,
  scheduled_at      timestamptz not null,
  duration_minutes  integer not null default 30,
  status            text not null default 'pending'
                      check (status in ('pending','confirmed','reminded','completed','no_show','cancelled')),
  -- Үйлчлүүлэгч захиалгаа шалгах богино код (жнь "K7QM4X")
  booking_code      text,
  google_event_id   text,
  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists appointments_clinic_id_idx on public.appointments (clinic_id);
create index if not exists appointments_scheduled_idx on public.appointments (clinic_id, scheduled_at);
create index if not exists appointments_phone_idx on public.appointments (clinic_id, customer_phone);
create unique index if not exists appointments_booking_code_idx
  on public.appointments (booking_code)
  where booking_code is not null;

-- =====================================================================
-- response_cache  (semantic AI cache)
-- =====================================================================
create table if not exists public.response_cache (
  id                   uuid primary key default gen_random_uuid(),
  clinic_id            uuid not null references public.clinics (id) on delete cascade,
  question             text,
  question_normalized  text,
  question_embedding   vector(1536),          -- OpenAI text-embedding-3-small
  reply                text,
  hit_count            integer not null default 0,
  expires_at           timestamptz not null default (now() + interval '30 days'),
  created_at           timestamptz not null default now()
);

create index if not exists response_cache_lookup_idx
  on public.response_cache (clinic_id, question_normalized);

-- Vector similarity index (cosine)
create index if not exists response_cache_embedding_idx
  on public.response_cache using ivfflat (question_embedding vector_cosine_ops)
  with (lists = 100);

-- =====================================================================
-- RPC: increment_cache_hit
-- =====================================================================
create or replace function public.increment_cache_hit(p_cache_id uuid)
returns void
language sql
as $$
  update public.response_cache
  set hit_count = hit_count + 1
  where id = p_cache_id;
$$;

-- =====================================================================
-- RPC: search_cache — cosine similarity-аар ойролцоо асуулт хайх
-- =====================================================================
create or replace function public.search_cache(
  p_clinic_id       uuid,
  p_query_embedding vector(1536),
  p_threshold       float,
  p_limit           int
)
returns table (
  id         uuid,
  reply      text,
  question   text,
  similarity float
)
language sql
stable
as $$
  select
    c.id,
    c.reply,
    c.question,
    1 - (c.question_embedding <=> p_query_embedding) as similarity
  from public.response_cache c
  where c.clinic_id = p_clinic_id
    and c.expires_at > now()
    and c.question_embedding is not null
    and 1 - (c.question_embedding <=> p_query_embedding) >= p_threshold
  order by c.question_embedding <=> p_query_embedding asc
  limit p_limit;
$$;

-- =====================================================================
-- Row Level Security
--   Backend үйлдлүүд service_role (admin client)-аар ажилладаг тул
--   RLS-ийг тойрдог. Доорх policy-ууд нь dashboard дахь хэрэглэгчийн
--   session client-д (owner_id = өөрийн id) зориулагдсан.
-- =====================================================================
alter table public.clinics        enable row level security;
alter table public.doctors        enable row level security;
alter table public.branches       enable row level security;
alter table public.doctor_branches enable row level security;
alter table public.appointments   enable row level security;
alter table public.response_cache enable row level security;

-- clinics: эзэн зөвхөн өөрийн клиникээ
create policy "clinics owner all" on public.clinics
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Бусад хүснэгт: эзэмшдэг клиникээрээ дамжуулан хандах
create policy "doctors owner all" on public.doctors
  for all using (exists (select 1 from public.clinics c where c.id = doctors.clinic_id and c.owner_id = auth.uid()));

create policy "branches owner all" on public.branches
  for all using (exists (select 1 from public.clinics c where c.id = branches.clinic_id and c.owner_id = auth.uid()));

create policy "doctor_branches owner all" on public.doctor_branches
  for all using (exists (
    select 1 from public.branches b join public.clinics c on c.id = b.clinic_id
    where b.id = doctor_branches.branch_id and c.owner_id = auth.uid()));

create policy "appointments owner all" on public.appointments
  for all using (exists (select 1 from public.clinics c where c.id = appointments.clinic_id and c.owner_id = auth.uid()));

create policy "response_cache owner all" on public.response_cache
  for all using (exists (select 1 from public.clinics c where c.id = response_cache.clinic_id and c.owner_id = auth.uid()));

-- =====================================================================
-- Rate limiting (Postgres-д суурилсан) — дэлгэрэнгүйг rate-limit.sql харна уу
-- =====================================================================
create table if not exists public.rate_limits (
  key           text primary key,
  count         integer not null default 0,
  window_start  timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- Policy нэмэхгүй: зөвхөн service_role хандана (RLS-ийг тойрдог).

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
