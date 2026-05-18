-- PokeTrade: tabela de anúncios de Pokémons
create table if not exists pokemon_ads (
  id uuid primary key default gen_random_uuid(),

  -- Informações básicas
  name text not null,
  tier text,                      -- ex: S++, A+, B
  pokeball text,                  -- ex: hogwarts ball, master ball
  pokeball_bonus text,            -- ex: 25% ATK/DEF Dark/Ghost
  awaken boolean default false,   -- tag (A)
  seasonal_tag text,              -- ex: YULE, XMAS, SUMMER
  boost_level integer default 0,  -- [+200]
  upgrade_level integer default 0,-- Upgrade: [5]
  souls integer default 0,

  -- Sexo
  sex text,                       -- male / female / unknown

  -- Stats base (IVs, 0-31)
  stat_hp integer,
  stat_atk integer,
  stat_def integer,
  stat_spatk integer,
  stat_spdef integer,
  stat_speed integer,

  -- Bônus dos stats
  bonus_hp integer default 0,
  bonus_atk integer default 0,
  bonus_def integer default 0,
  bonus_spatk integer default 0,
  bonus_spdef integer default 0,
  bonus_speed integer default 0,

  -- Perfection
  perfection numeric(6,3),        -- ex: 80.645

  -- Habilidade e item
  ability text,
  held_item text,

  -- TMs (jsonb array de {name, level})
  tms jsonb default '[]'::jsonb,

  -- Move upgrades
  move_slots_used integer default 0,
  move_slots_total integer default 0,
  move_upgrades_count text,       -- ex: 5/5
  move_upgrades jsonb default '[]'::jsonb, -- [{name, level}]

  -- Vitamins
  vitamins_used integer default 0,
  vitamins_total integer default 0,
  vitamin_details jsonb default '[]'::jsonb, -- ["3x HP Up (+14% Max HP)"]

  -- Anúncio
  price numeric(12,2),
  contact text,
  description text,
  raw_text text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para busca/filtro
create index if not exists idx_pokemon_ads_name   on pokemon_ads (lower(name));
create index if not exists idx_pokemon_ads_tier   on pokemon_ads (tier);
create index if not exists idx_pokemon_ads_ability on pokemon_ads using gin (to_tsvector('simple', coalesce(ability, '')));
create index if not exists idx_pokemon_ads_created on pokemon_ads (created_at desc);

-- Trigger para updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pokemon_ads_updated_at
  before update on pokemon_ads
  for each row execute function set_updated_at();

-- Row Level Security (leitura pública, escrita somente via service role / anon com permissões)
alter table pokemon_ads enable row level security;

-- Permite leitura pública
create policy "public read" on pokemon_ads
  for select using (true);

-- Permite inserção/atualização/exclusão para usuários autenticados
-- (Na prática, o admin faz via API Route com service role ou anon key)
create policy "anon write" on pokemon_ads
  for all using (true) with check (true);
