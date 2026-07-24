-- =====================================================================
-- Салбар (branches) — олон хаягтай эмнэлэгт зориулав
-- Байгаа Supabase project дээр: SQL Editor → энэ файлыг RUN.
-- Салбаргүй эмнэлэг хуучинчлан ажиллана (booking clinic default руу шилжинэ).
-- =====================================================================

-- ---------------------------------------------------------------------
-- branches — эмнэлгийн салбар (хаяг) бүр
-- ---------------------------------------------------------------------
create table if not exists public.branches (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references public.clinics (id) on delete cascade,
  name            text not null,                       -- "Төв салбар", "2-р салбар"
  address         text,
  phone           text,
  business_hours  jsonb,                               -- null бол clinic default цаг
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists branches_clinic_id_idx on public.branches (clinic_id);

-- ---------------------------------------------------------------------
-- doctor_branches — эмч ↔ салбар (олон-олон холбоос)
-- Нэг эмч олон салбарт харьяалагдаж болно.
-- ---------------------------------------------------------------------
create table if not exists public.doctor_branches (
  doctor_id  uuid not null references public.doctors (id)  on delete cascade,
  branch_id  uuid not null references public.branches (id) on delete cascade,
  primary key (doctor_id, branch_id)
);

create index if not exists doctor_branches_branch_idx on public.doctor_branches (branch_id);

-- ---------------------------------------------------------------------
-- appointments.branch_id — захиалга аль салбарт хийгдсэн
-- Nullable: салбаргүй эмнэлэг болон чат захиалга null үлдэнэ.
-- ---------------------------------------------------------------------
alter table public.appointments
  add column if not exists branch_id uuid references public.branches (id) on delete set null;

create index if not exists appointments_branch_idx on public.appointments (branch_id);

-- ---------------------------------------------------------------------
-- Row Level Security — эзэн зөвхөн өөрийн клиникийн салбарыг
-- (Backend admin client service_role-оор RLS-ийг тойрдог. Эдгээр policy
--  нь dashboard дахь session client-д зориулагдсан.)
-- ---------------------------------------------------------------------
alter table public.branches        enable row level security;
alter table public.doctor_branches enable row level security;

-- drop policy if exists — SQL-ийг дахин ажиллуулж болохоор (idempotent)
drop policy if exists "branches owner all" on public.branches;
create policy "branches owner all" on public.branches
  for all using (
    exists (select 1 from public.clinics c
            where c.id = branches.clinic_id and c.owner_id = auth.uid())
  );

drop policy if exists "doctor_branches owner all" on public.doctor_branches;
create policy "doctor_branches owner all" on public.doctor_branches
  for all using (
    exists (select 1 from public.branches b
            join public.clinics c on c.id = b.clinic_id
            where b.id = doctor_branches.branch_id and c.owner_id = auth.uid())
  );

-- =====================================================================
-- ЧУХАЛ: PostgREST-ийн schema cache-ийг дахин ачаалах.
-- Үүнгүй бол шинэ хүснэгтийг API "олохгүй" ("Could not find the table").
-- =====================================================================
notify pgrst, 'reload schema';
