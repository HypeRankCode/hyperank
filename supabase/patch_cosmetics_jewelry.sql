-- Run in Supabase SQL Editor if your DB was created before jewelry/pants cosmetics were added.
insert into public.cosmetics (
  id, name, description, category, preview_image_url, rpm_asset_url,
  cost_credits, rarity, unlock_condition, is_limited, available_until, created_at,
  is_tradeable, floor_price, total_supply, owners_count
) values
  ('pants_default', 'Black Joggers', 'Default pants', 'pants', null, null, 0, 'common', 'default', false, null, now(), true, 0, 0, 0),
  ('pants_jeans', 'Blue Jeans', 'Classic denim', 'pants', null, null, 150, 'common', 'credits', false, null, now(), true, 0, 0, 0),
  ('pants_camo', 'Camo Pants', 'Street ready', 'pants', null, null, 250, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('watch_silver', 'Silver Watch', 'Clean wrist game', 'watch', null, null, 180, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('watch_gold', 'Gold Watch', 'Flex on the timeline', 'watch', null, null, 450, 'legendary', 'credits', false, null, now(), true, 0, 0, 0),
  ('chain_silver', 'Silver Chain', 'Subtle shine', 'chain', null, null, 200, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('chain_gold', 'Gold Chain', 'Heavy drip', 'chain', null, null, 550, 'legendary', 'credits', false, null, now(), true, 0, 0, 0),
  ('earrings_studs', 'Gold Studs', 'Small but loud', 'earrings', null, null, 120, 'common', 'credits', false, null, now(), true, 0, 0, 0),
  ('earrings_hoops', 'Silver Hoops', 'Classic hoops', 'earrings', null, null, 175, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('earrings_diamond', 'Ice Studs', 'Diamond sparkle', 'earrings', null, null, 600, 'legendary', 'credits', false, null, now(), true, 0, 0, 0)
on conflict (id) do nothing;
