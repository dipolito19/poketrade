-- Migration v4: tabela de anúncios de items
create table if not exists item_ads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2),
  contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_item_ads_name    on item_ads (lower(name));
create index if not exists idx_item_ads_created on item_ads (created_at desc);

create trigger item_ads_updated_at
  before update on item_ads
  for each row execute function set_updated_at();

alter table item_ads enable row level security;
create policy "public read"  on item_ads for select using (true);
create policy "anon write"   on item_ads for all using (true) with check (true);
