-- Run this in your Supabase project's SQL editor

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);
alter table categories enable row level security;
create policy "users own their categories" on categories for all using (auth.uid() = user_id);

-- Grocery items
create table if not exists grocery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  quantity numeric not null default 1,
  unit text,
  estimated_price numeric,
  actual_price numeric,
  store text,
  notes text,
  purchased boolean not null default false,
  category_id uuid references categories(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table grocery_items enable row level security;
create policy "users own their grocery items" on grocery_items for all using (auth.uid() = user_id);

-- Recipes
create table if not exists recipes (
  id uuid primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  servings int,
  prep_time_minutes int,
  cook_time_minutes int,
  tags text[] not null default '{}',
  ingredients jsonb not null default '[]',
  instructions text[] not null default '{}',
  is_favorite boolean not null default false,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table recipes enable row level security;
create policy "users own their recipes" on recipes for all using (auth.uid() = user_id);

-- Pantry items
create table if not exists pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  quantity numeric not null default 1,
  unit text,
  expiration_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table pantry_items enable row level security;
create policy "users own their pantry items" on pantry_items for all using (auth.uid() = user_id);

-- Library items
create table if not exists library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  unit text,
  estimated_price numeric,
  store text,
  notes text,
  is_favorite boolean not null default false,
  times_added int not null default 0,
  last_added timestamptz default now(),
  created_at timestamptz default now(),
  unique (user_id, name)
);
alter table library_items enable row level security;
create policy "users own their library items" on library_items for all using (auth.uid() = user_id);
