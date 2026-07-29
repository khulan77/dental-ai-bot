-- =====================================================================
-- Захиалга баталгаажуулах урсгал
--
-- 1. 'pending' төлөв нэмнэ — шинэ захиалга эхлээд хүлээгдэж буй байдалтай
--    үүсэж, эмнэлэг dashboard-аас баталгаажуулна.
-- 2. booking_code — үйлчлүүлэгч захиалгаа шалгах богино код.
--
-- Supabase SQL editor дээр нэг удаа ажиллуулна.
-- =====================================================================

-- 1. Төлөвийн check-д 'pending' нэмэх
alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('pending','confirmed','reminded','completed','no_show','cancelled'));

alter table public.appointments
  alter column status set default 'pending';

-- 2. Захиалгын код (жнь "K7QM4X"). Хуучин захиалгад null байж болно.
alter table public.appointments
  add column if not exists booking_code text;

create unique index if not exists appointments_booking_code_idx
  on public.appointments (booking_code)
  where booking_code is not null;

-- 3. Утсаар хайх (үйлчлүүлэгчийн "захиалгаа шалгах" хуудас)
create index if not exists appointments_phone_idx
  on public.appointments (clinic_id, customer_phone);
