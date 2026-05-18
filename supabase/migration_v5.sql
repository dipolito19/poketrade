-- Migration v5: adiciona URL de imagem nos anúncios de items
alter table item_ads
  add column if not exists image_url text;
