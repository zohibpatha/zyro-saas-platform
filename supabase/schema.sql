-- ============================================================================
-- Zyro — Full Database Schema
-- Run this in the Supabase SQL Editor to set up your database.
-- ============================================================================

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- Restaurants
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  cover_image text,
  instagram_url text,
  google_maps_url text,
  google_review_url text,
  website_url text,
  phone text,
  whatsapp text,
  address text,
  primary_color text not null default '#111111',
  is_active boolean not null default true,
  owner_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for slug lookups (public page)
create index if not exists idx_restaurants_slug on public.restaurants (slug);
-- Index for owner email lookups (dashboard)
create index if not exists idx_restaurants_owner_email on public.restaurants (owner_email);

-- Food Photos
create table if not exists public.food_photos (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_food_photos_restaurant_id on public.food_photos (restaurant_id);

-- Admin Users
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 2. HELPER FUNCTIONS
-- ============================================================================

-- Check if the current authenticated user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = (select auth.jwt() ->> 'email')
  );
$$;

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_restaurants_updated
  before update on public.restaurants
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================

alter table public.restaurants enable row level security;
alter table public.food_photos enable row level security;
alter table public.admin_users enable row level security;

-- ============================================================================
-- 4. GRANT BASE PERMISSIONS
-- ============================================================================

grant usage on schema public to anon, authenticated;

grant select on public.restaurants to anon, authenticated;
grant insert, update, delete on public.restaurants to authenticated;

grant select on public.food_photos to anon, authenticated;
grant insert, update, delete on public.food_photos to authenticated;

grant select on public.admin_users to authenticated;

-- ============================================================================
-- 5. RLS POLICIES — restaurants
-- ============================================================================

-- Public: anyone can read active restaurants
create policy "Public can view active restaurants"
on public.restaurants
for select
to anon, authenticated
using (is_active = true);

-- Owner: can view their own restaurants (even if inactive)
create policy "Owners can view own restaurants"
on public.restaurants
for select
to authenticated
using (
  owner_email = (select auth.jwt() ->> 'email')
);

-- Owner: can update their own restaurants
create policy "Owners can update own restaurants"
on public.restaurants
for update
to authenticated
using (
  owner_email = (select auth.jwt() ->> 'email')
)
with check (
  owner_email = (select auth.jwt() ->> 'email')
);

-- Admin: full access to all restaurants
create policy "Admins have full access to restaurants"
on public.restaurants
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 6. RLS POLICIES — food_photos
-- ============================================================================

-- Public: can view photos of active restaurants
create policy "Public can view photos of active restaurants"
on public.food_photos
for select
to anon, authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = food_photos.restaurant_id
    and restaurants.is_active = true
  )
);

-- Owner: can manage photos for their own restaurants
create policy "Owners can insert photos for own restaurants"
on public.food_photos
for insert
to authenticated
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = food_photos.restaurant_id
    and restaurants.owner_email = (select auth.jwt() ->> 'email')
  )
);

create policy "Owners can update photos for own restaurants"
on public.food_photos
for update
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = food_photos.restaurant_id
    and restaurants.owner_email = (select auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = food_photos.restaurant_id
    and restaurants.owner_email = (select auth.jwt() ->> 'email')
  )
);

create policy "Owners can delete photos for own restaurants"
on public.food_photos
for delete
to authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = food_photos.restaurant_id
    and restaurants.owner_email = (select auth.jwt() ->> 'email')
  )
);

-- Admin: full access to all food photos
create policy "Admins have full access to food_photos"
on public.food_photos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 7. RLS POLICIES — admin_users
-- ============================================================================

-- Only admins can read the admin_users table
create policy "Only admins can view admin_users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

-- ============================================================================
-- 8. STORAGE — restaurant-assets bucket
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-assets',
  'restaurant-assets',
  true,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public can read all files in the bucket
create policy "Public read access for restaurant-assets"
on storage.objects
for select
to public
using (bucket_id = 'restaurant-assets');

-- Authenticated users can upload files
create policy "Authenticated users can upload restaurant assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'restaurant-assets');

-- Authenticated users can update their uploads
create policy "Authenticated users can update restaurant assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'restaurant-assets')
with check (bucket_id = 'restaurant-assets');

-- Authenticated users can delete their uploads
create policy "Authenticated users can delete restaurant assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'restaurant-assets');

-- ============================================================================
-- 9. SEED: First Admin User
-- ============================================================================
-- Uncomment and update the email below to create your first admin:
-- insert into public.admin_users (email) values ('your-email@example.com');
