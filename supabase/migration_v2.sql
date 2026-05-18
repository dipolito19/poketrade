-- Migration v2: adiciona campos Seal, Aura, Abilities, Extra Infos, Evolution, Held Level, Shiny

alter table pokemon_ads
  add column if not exists shiny boolean default false,
  add column if not exists seal text,
  add column if not exists aura text,
  add column if not exists abilities jsonb default '[]'::jsonb,
  add column if not exists ability_description text,
  add column if not exists extra_infos jsonb default '[]'::jsonb,
  add column if not exists evolution text,
  add column if not exists held_level text;
