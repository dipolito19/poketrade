-- Migration v3: adiciona Cloth Repair e Mega Stone
alter table pokemon_ads
  add column if not exists cloth_repair text,
  add column if not exists mega_stone text;
