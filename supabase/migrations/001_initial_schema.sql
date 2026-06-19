-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Grocery items
create table grocery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  quantity numeric not null default 1,
  unit text,
  category_id uuid references categories(id) on delete set null,
  estimated_price numeric,
  actual_price numeric,
  store text,
  purchased boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Recipes
create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  image_url text,
  servings int,
  prep_time_minutes int,
  cook_time_minutes int,
  tags text[],
  instructions text[],
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  notes text
);

-- Pantry
create table pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  quantity numeric not null default 1,
  unit text,
  category_id uuid references categories(id) on delete set null,
  expiration_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meal planner
create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  recipe_id uuid references recipes(id) on delete cascade,
  planned_date date not null,
  meal_type text check (meal_type in ('breakfast','lunch','dinner')),
  created_at timestamptz default now()
);

-- Price history
create table price_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  item_name text not null,
  price numeric not null,
  store text,
  purchased_at timestamptz default now()
);

-- updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger grocery_items_updated_at
  before update on grocery_items
  for each row execute function update_updated_at();

create trigger recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at();

create trigger pantry_items_updated_at
  before update on pantry_items
  for each row execute function update_updated_at();

-- RLS
alter table categories enable row level security;
alter table grocery_items enable row level security;
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table pantry_items enable row level security;
alter table meal_plans enable row level security;
alter table price_history enable row level security;

create policy "own rows" on categories for all using (auth.uid() = user_id);
create policy "own rows" on grocery_items for all using (auth.uid() = user_id);
create policy "own rows" on recipes for all using (auth.uid() = user_id);
create policy "own recipe ingredients" on recipe_ingredients for all using (
  exists (select 1 from recipes where recipes.id = recipe_ingredients.recipe_id and recipes.user_id = auth.uid())
);
create policy "own rows" on pantry_items for all using (auth.uid() = user_id);
create policy "own rows" on meal_plans for all using (auth.uid() = user_id);
create policy "own rows" on price_history for all using (auth.uid() = user_id);
