create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'staff_admin', 'super_admin');
create type public.user_status as enum ('active', 'blocked');
create type public.user_plan_status as enum ('active', 'completed', 'cancelled');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.notification_kind as enum ('system', 'deposit', 'withdrawal', 'earning', 'referral', 'bonus', 'admin');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role public.user_role not null default 'user',
  status public.user_status not null default 'active',
  wallet_balance numeric(12,2) not null default 0,
  total_earned numeric(12,2) not null default 0,
  referral_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  referred_by uuid references public.profiles(id) on delete set null,
  avatar_url text,
  welcome_bonus_granted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_settings (
  id integer primary key default 1,
  site_name text not null default 'Pak Profit Hub',
  site_tagline text not null default 'Premium daily earning platform',
  logo_mark text,
  primary_color text not null default '#E63946',
  accent_color text not null default '#FFD700',
  hero_title text not null default 'Grow with disciplined daily earning',
  hero_subtitle text not null default 'Premium fixed-value package experience'
);

create table if not exists public.platform_settings (
  id integer primary key default 1,
  support_email text not null default 'support@pakprofithub.com',
  support_whatsapp text not null default '+923001234567',
  telegram_url text,
  minimum_deposit numeric(12,2) not null default 280,
  minimum_withdrawal numeric(12,2) not null default 500,
  referral_bonus numeric(12,2) not null default 100,
  welcome_bonus numeric(12,2) not null default 25,
  maintenance_mode boolean not null default false,
  maintenance_message text,
  announcement_active boolean not null default true,
  announcement_text text,
  default_brand_name text not null default 'Pak Profit Hub'
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  public_details text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  investment_amount numeric(12,2) not null,
  daily_earning numeric(12,2) not null,
  duration_days integer not null,
  total_payout numeric(12,2) not null,
  badge text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  invested_amount numeric(12,2) not null,
  daily_earning numeric(12,2) not null,
  duration_days integer not null,
  total_payout numeric(12,2) not null,
  claimed_days integer not null default 0,
  collected_amount numeric(12,2) not null default 0,
  status public.user_plan_status not null default 'active',
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_method text not null,
  reference_number text not null,
  screenshot_url text,
  status public.approval_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_method text not null,
  account_title text not null,
  account_number text not null,
  status public.approval_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  transaction_type text not null,
  amount numeric(12,2) not null,
  status text not null default 'approved',
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  kind public.notification_kind not null default 'system',
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_message_no_url check (message !~* 'https?://')
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'referred_by', '')::uuid
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('staff_admin', 'super_admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.brand_settings enable row level security;
alter table public.platform_settings enable row level security;
alter table public.payment_methods enable row level security;
alter table public.plans enable row level security;
alter table public.user_plans enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;

create policy "public brand read" on public.brand_settings for select using (true);
create policy "public platform read" on public.platform_settings for select using (true);
create policy "public payment methods read" on public.payment_methods for select using (is_active = true);
create policy "public active plans read" on public.plans for select using (is_active = true);

create policy "profile own select" on public.profiles for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profile own update" on public.profiles for update using (auth.uid() = id or public.is_admin(auth.uid())) with check (auth.uid() = id or public.is_admin(auth.uid()));

create policy "user plan own access" on public.user_plans for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "deposit own access" on public.deposits for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "withdraw own access" on public.withdrawals for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "transaction own access" on public.transactions for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "notification own access" on public.notifications for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

insert into public.brand_settings (id) values (1) on conflict (id) do nothing;
insert into public.platform_settings (id, announcement_text, telegram_url)
values (1, 'Welcome to Pak Profit Hub — fixed-value earning packages are now live.', 'https://t.me/pakprofithub')
on conflict (id) do nothing;

insert into public.payment_methods (code, label, public_details, sort_order)
values
  ('easypaisa', 'EasyPaisa', 'Account Title: Pak Profit Hub • Number: 0300-1234567', 1),
  ('jazzcash', 'JazzCash', 'Account Title: Pak Profit Hub • Number: 0300-1234567', 2),
  ('bank', 'Bank Transfer', 'HBL • Account Title: Pak Profit Hub • Account: 1234567890', 3),
  ('usdt', 'USDT (TRC20)', 'Wallet: TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 4)
on conflict (code) do nothing;

insert into public.plans (name, slug, investment_amount, daily_earning, duration_days, total_payout, badge, sort_order)
values
  ('Starter', 'starter', 280, 14, 10, 140, null, 1),
  ('Basic', 'basic', 500, 25, 10, 250, null, 2),
  ('Silver', 'silver', 1000, 50, 10, 500, null, 3),
  ('Gold', 'gold', 2000, 100, 10, 1000, 'Popular', 4),
  ('Platinum', 'platinum', 5000, 250, 10, 2500, 'Hot', 5),
  ('Diamond', 'diamond', 10000, 500, 10, 5000, null, 6),
  ('Elite', 'elite', 20000, 1000, 10, 10000, null, 7),
  ('VIP', 'vip', 50000, 2500, 10, 25000, 'VIP', 8),
  ('Royal', 'royal', 100000, 5000, 10, 50000, 'Exclusive', 9),
  ('Ultra', 'ultra', 200000, 10000, 10, 100000, 'Ultra', 10)
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

create policy "payment proof authenticated read" on storage.objects for select using (bucket_id = 'payment-proofs');
create policy "payment proof authenticated upload" on storage.objects for insert with check (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');
