-- =============================================================================
-- HypeRank — Complete Supabase Database Schema
-- =============================================================================
--
-- FRESH PROJECT:  Run this file only.
--
-- EXISTING PROJECT (you have old trends/profiles/etc.):
--   1. Run 00_reset.sql first  ← drops old + new tables, keeps auth.users
--   2. Then run this file
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  avatar_rpm_url text,
  avatar_config jsonb default '{}'::jsonb,
  is_public boolean default true,
  credits integer default 100,
  hype_score numeric(5, 2) default 50.0,
  streak_days integer default 0,
  last_voted_at timestamptz,
  streak_shield boolean default false,
  total_votes integer default 0,
  correct_predictions integer default 0,
  total_predictions integer default 0,
  badge_ids text[] default '{}'::text[],
  owned_cosmetic_ids text[] default '{}'::text[],
  social_twitter text,
  social_tiktok text,
  social_instagram text,
  social_youtube text,
  social_twitch text,
  social_verified jsonb default '{}'::jsonb,
  is_creator boolean default false,
  is_brand boolean default false,
  brand_display_name text,
  brand_logo_url text,
  brand_website text,
  brand_contact_email text,
  -- Moderation
  is_banned boolean default false,
  ban_reason text,
  ban_expires_at timestamptz,
  is_muted boolean default false,
  mute_expires_at timestamptz,
  warning_count integer default 0,
  -- Child safety / COPPA
  date_of_birth date,
  is_minor boolean default false,
  age_verified boolean default false,
  parent_email text,
  parental_consent_given boolean default false,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- TRENDS
-- -----------------------------------------------------------------------------
create table public.trends (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  description text,
  category text default 'general',
  tags text[] default '{}'::text[],
  hype_votes integer default 0,
  dead_votes integer default 0,
  vote_velocity numeric default 0,
  hype_score numeric(5, 2) default 50.0,
  is_daily_drop boolean default false,
  daily_drop_date date,
  is_community_pick boolean default false,
  is_sponsored boolean default false,
  sponsor_profile_id uuid references public.profiles (id),
  sponsor_label text,
  sponsor_cta_url text,
  sponsor_cta_label text,
  image_url text,
  submitted_by uuid references public.profiles (id),
  status text default 'active',
  created_at timestamptz default now(),
  archived_at timestamptz
);

-- -----------------------------------------------------------------------------
-- VOTES
-- -----------------------------------------------------------------------------
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles (id) on delete cascade,
  trend_id uuid references public.trends (id) on delete cascade,
  vote_type text not null check (vote_type in ('hype', 'dead')),
  voted_at timestamptz default now(),
  unique (user_id, trend_id)
);

-- -----------------------------------------------------------------------------
-- PREDICTIONS
-- -----------------------------------------------------------------------------
create table public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles (id) on delete cascade,
  trend_id uuid references public.trends (id) on delete cascade,
  predicted_outcome text not null check (predicted_outcome in ('hype', 'dead')),
  credits_wagered integer not null,
  resolved boolean default false,
  won boolean,
  created_at timestamptz default now(),
  resolves_at timestamptz not null
);

-- -----------------------------------------------------------------------------
-- HYPE BATTLES
-- -----------------------------------------------------------------------------
create table public.battles (
  id uuid default gen_random_uuid() primary key,
  trend_a_id uuid references public.trends (id),
  trend_b_id uuid references public.trends (id),
  votes_a integer default 0,
  votes_b integer default 0,
  status text default 'active' check (status in ('active', 'completed')),
  winner_id uuid references public.trends (id),
  starts_at timestamptz default now(),
  ends_at timestamptz not null,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- BATTLE VOTES
-- -----------------------------------------------------------------------------
create table public.battle_votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles (id) on delete cascade,
  battle_id uuid references public.battles (id) on delete cascade,
  voted_for uuid references public.trends (id),
  voted_at timestamptz default now(),
  unique (user_id, battle_id)
);

-- -----------------------------------------------------------------------------
-- HOT TAKES
-- -----------------------------------------------------------------------------
create table public.hot_takes (
  id uuid default gen_random_uuid() primary key,
  trend_id uuid references public.trends (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  content text not null,
  upvotes integer default 0,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- HOT TAKE VOTES
-- -----------------------------------------------------------------------------
create table public.hot_take_votes (
  user_id uuid references public.profiles (id) on delete cascade,
  hot_take_id uuid references public.hot_takes (id) on delete cascade,
  primary key (user_id, hot_take_id)
);

-- -----------------------------------------------------------------------------
-- HYPE PITCHES (community auditions for daily pick)
-- -----------------------------------------------------------------------------
create table public.hype_pitches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles (id) on delete cascade not null,
  title text not null,
  description text,
  pitch_key text not null,
  vote_count integer default 0,
  status text default 'active' check (status in ('active', 'won', 'expired')),
  trend_id uuid references public.trends (id),
  won_on date,
  created_at timestamptz default now()
);

create table public.hype_pitch_votes (
  user_id uuid references public.profiles (id) on delete cascade,
  pitch_id uuid references public.hype_pitches (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, pitch_id)
);

create table public.hype_pitch_cooldowns (
  pitch_key text primary key,
  banned_until date not null,
  source_pitch_id uuid references public.hype_pitches (id),
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- DICTIONARY
-- -----------------------------------------------------------------------------
create table public.dictionary (
  id uuid default gen_random_uuid() primary key,
  term text unique not null,
  definition text not null,
  example_usage text,
  related_trend_id uuid references public.trends (id),
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- WEEKLY HYPE REPORTS
-- -----------------------------------------------------------------------------
create table public.weekly_reports (
  id uuid default gen_random_uuid() primary key,
  week_start date not null,
  week_end date not null,
  biggest_riser_id uuid references public.trends (id),
  biggest_faller_id uuid references public.trends (id),
  most_controversial_id uuid references public.trends (id),
  top_hot_take_id uuid references public.hot_takes (id),
  top_predictor_id uuid references public.profiles (id),
  report_data jsonb,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- COSMETICS CATALOG
-- -----------------------------------------------------------------------------
create table public.cosmetics (
  id text primary key,
  name text not null,
  description text,
  category text not null,
  preview_image_url text,
  rpm_asset_url text,
  cost_credits integer default 0,
  rarity text default 'common',
  unlock_condition text,
  is_limited boolean default false,
  available_until timestamptz,
  is_tradeable boolean default true,
  floor_price integer default 0,
  total_supply integer default 0,
  owners_count integer default 0,
  created_at timestamptz default now()
);

insert into public.cosmetics (
  id, name, description, category, preview_image_url, rpm_asset_url,
  cost_credits, rarity, unlock_condition, is_limited, available_until, created_at,
  is_tradeable, floor_price, total_supply, owners_count
) values
  ('hat_default', 'Beanie', 'The default. Clean.', 'hat', null, null, 0, 'common', 'default', false, null, now(), true, 0, 0, 0),
  ('hat_crown', 'Gold Crown', 'For the top of the leaderboard', 'hat', null, null, 500, 'legendary', 'credits', false, null, now(), true, 0, 0, 0),
  ('hat_flame', 'Flame Cap', 'Unlocks at a 7-day streak', 'hat', null, null, 0, 'rare', 'streak_7', false, null, now(), true, 0, 0, 0),
  ('shirt_default', 'White Tee', 'Clean slate', 'shirt', null, null, 0, 'common', 'default', false, null, now(), true, 0, 0, 0),
  ('shirt_hyperank', 'HypeRank Tee', 'Repping the site', 'shirt', null, null, 0, 'common', 'default', false, null, now(), true, 0, 0, 0),
  ('shirt_fire', 'Fire Print', '200 credits', 'shirt', null, null, 200, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('bg_space', 'Deep Space', 'Background — 300 credits', 'background', null, null, 300, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('bg_neon_city', 'Neon City', 'Background — unlocks at 30-day streak', 'background', null, null, 0, 'rare', 'streak_30', false, null, now(), true, 0, 0, 0),
  ('effect_fire_aura', 'Fire Aura', 'Effect — 750 credits', 'effect', null, null, 750, 'legendary', 'credits', false, null, now(), true, 0, 0, 0),
  ('effect_crown_glow', 'Crown Glow', 'Effect — unlocks with Monthly badge', 'effect', null, null, 0, 'legendary', 'badge:streak_30', false, null, now(), true, 0, 0, 0),
  ('shoes_default', 'Sneakers', 'Default kicks', 'shoes', null, null, 0, 'common', 'default', false, null, now(), true, 0, 0, 0),
  ('shoes_gold', 'Gold Sneakers', '400 credits', 'shoes', null, null, 400, 'legendary', 'credits', false, null, now(), true, 0, 0, 0),
  ('pants_default', 'Black Joggers', 'Default pants', 'pants', null, null, 0, 'common', 'default', false, null, now(), true, 0, 0, 0),
  ('pants_jeans', 'Blue Jeans', 'Classic denim', 'pants', null, null, 150, 'common', 'credits', false, null, now(), true, 0, 0, 0),
  ('pants_camo', 'Camo Pants', 'Street ready', 'pants', null, null, 250, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('watch_silver', 'Silver Watch', 'Clean wrist game', 'watch', null, null, 180, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('watch_gold', 'Gold Watch', 'Flex on the timeline', 'watch', null, null, 450, 'legendary', 'credits', false, null, now(), true, 0, 0, 0),
  ('chain_silver', 'Silver Chain', 'Subtle shine', 'chain', null, null, 200, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('chain_gold', 'Gold Chain', 'Heavy drip', 'chain', null, null, 550, 'legendary', 'credits', false, null, now(), true, 0, 0, 0),
  ('earrings_studs', 'Gold Studs', 'Small but loud', 'earrings', null, null, 120, 'common', 'credits', false, null, now(), true, 0, 0, 0),
  ('earrings_hoops', 'Silver Hoops', 'Classic hoops', 'earrings', null, null, 175, 'rare', 'credits', false, null, now(), true, 0, 0, 0),
  ('earrings_diamond', 'Ice Studs', 'Diamond sparkle', 'earrings', null, null, 600, 'legendary', 'credits', false, null, now(), true, 0, 0, 0);

-- -----------------------------------------------------------------------------
-- BADGES
-- -----------------------------------------------------------------------------
create table public.badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  rarity text default 'common'
);

insert into public.badges (id, name, description, icon, rarity) values
  ('first_vote', 'First Vote', 'Cast your first vote', '🗳️', 'common'),
  ('streak_3', 'On a Roll', '3-day voting streak', '🔥', 'common'),
  ('streak_7', 'Week Streak', '7-day voting streak', '⚡', 'rare'),
  ('streak_30', 'Monthly', '30-day voting streak', '👑', 'legendary'),
  ('predictor_10', 'Good Eye', 'Win 10 predictions', '🔮', 'rare'),
  ('trend_prophet', 'Called It', 'Submit a trend that gets 1000 votes', '📈', 'legendary'),
  ('hot_take_king', 'Best Take', 'Get the featured hot take of the week', '🌶️', 'rare'),
  ('battle_winner', 'Undefeated', 'Win 5 Hype Battles', '⚔️', 'common'),
  ('social_linked', 'Linked Up', 'Link a social media account', '🔗', 'common'),
  ('creator_verified', 'Creator', 'Verified content creator', '✨', 'rare'),
  ('brand_partner', 'Partner', 'Verified brand on HypeRank', '🏢', 'legendary');

-- -----------------------------------------------------------------------------
-- SPONSORED PACKAGES
-- -----------------------------------------------------------------------------
create table public.sponsored_packages (
  id uuid default gen_random_uuid() primary key,
  brand_profile_id uuid references public.profiles (id),
  package_type text not null,
  trend_id uuid references public.trends (id),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default true,
  contact_email text,
  notes text,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- SOCIAL PROFILE CLAIMS
-- -----------------------------------------------------------------------------
create table public.social_claims (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles (id) on delete cascade,
  platform text not null,
  handle text not null,
  verified boolean default false,
  verification_code text,
  verified_at timestamptz,
  created_at timestamptz default now(),
  unique (platform, handle)
);

-- -----------------------------------------------------------------------------
-- REPORTS
-- -----------------------------------------------------------------------------
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles (id),
  reported_user_id uuid references public.profiles (id),
  content_type text not null,
  content_id uuid,
  reason text not null,
  details text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- SHOP DROPS
-- -----------------------------------------------------------------------------
create table public.shop_drops (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  drop_date timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean default false,
  banner_image_url text,
  theme text,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- SHOP ITEMS
-- -----------------------------------------------------------------------------
create table public.shop_items (
  id uuid default gen_random_uuid() primary key,
  drop_id uuid references public.shop_drops (id) on delete cascade,
  cosmetic_id text references public.cosmetics (id),
  rarity text not null,
  supply integer not null,
  remaining integer not null,
  credit_price integer not null,
  is_sold_out boolean default false,
  preview_image_url text,
  preview_video_url text,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- USER INVENTORY ITEMS
-- -----------------------------------------------------------------------------
create table public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles (id) on delete cascade,
  cosmetic_id text references public.cosmetics (id),
  shop_item_id uuid references public.shop_items (id),
  serial_number integer,
  acquired_via text not null,
  acquired_at timestamptz default now(),
  is_equipped boolean default false,
  is_listed_on_market boolean default false,
  listing_price integer,
  original_drop_id uuid references public.shop_drops (id)
);

-- -----------------------------------------------------------------------------
-- MARKETPLACE LISTINGS
-- -----------------------------------------------------------------------------
create table public.marketplace_listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles (id) on delete cascade,
  inventory_item_id uuid references public.inventory_items (id) on delete cascade,
  cosmetic_id text references public.cosmetics (id),
  asking_price integer not null,
  is_active boolean default true,
  views integer default 0,
  created_at timestamptz default now(),
  sold_at timestamptz,
  buyer_id uuid references public.profiles (id)
);

-- -----------------------------------------------------------------------------
-- MARKETPLACE TRANSACTIONS
-- -----------------------------------------------------------------------------
create table public.marketplace_transactions (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.marketplace_listings (id),
  seller_id uuid references public.profiles (id),
  buyer_id uuid references public.profiles (id),
  cosmetic_id text references public.cosmetics (id),
  credits_amount integer not null,
  platform_fee integer not null,
  seller_received integer not null,
  transacted_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- TRADE OFFERS
-- -----------------------------------------------------------------------------
create table public.trade_offers (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references public.profiles (id) on delete cascade,
  to_user_id uuid references public.profiles (id) on delete cascade,
  offered_item_ids uuid[] not null,
  requested_item_ids uuid[] not null,
  offered_credits integer default 0,
  status text default 'pending',
  message text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- WISHLISTS
-- -----------------------------------------------------------------------------
create table public.wishlists (
  user_id uuid references public.profiles (id) on delete cascade,
  cosmetic_id text references public.cosmetics (id),
  added_at timestamptz default now(),
  primary key (user_id, cosmetic_id)
);

-- -----------------------------------------------------------------------------
-- PRICE HISTORY
-- -----------------------------------------------------------------------------
create table public.price_history (
  id uuid default gen_random_uuid() primary key,
  cosmetic_id text references public.cosmetics (id),
  sale_price integer not null,
  sold_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
create index idx_trends_slug on public.trends (slug);
create index idx_trends_status on public.trends (status);
create index idx_trends_daily_drop on public.trends (is_daily_drop, daily_drop_date);
create index idx_votes_trend_id on public.votes (trend_id);
create index idx_votes_user_id on public.votes (user_id);
create index idx_predictions_user_id on public.predictions (user_id);
create index idx_predictions_trend_id on public.predictions (trend_id);
create index idx_battle_votes_battle_id on public.battle_votes (battle_id);
create index idx_hot_takes_trend_id on public.hot_takes (trend_id);
create index idx_hype_pitches_status_votes on public.hype_pitches (status, vote_count desc);
create index idx_hype_pitches_user_id on public.hype_pitches (user_id);
create index idx_hype_pitch_cooldowns_until on public.hype_pitch_cooldowns (banned_until);
create index idx_inventory_items_owner_id on public.inventory_items (owner_id);
create index idx_marketplace_listings_active on public.marketplace_listings (is_active) where is_active = true;
create index idx_marketplace_listings_cosmetic_id on public.marketplace_listings (cosmetic_id);
create index idx_trade_offers_to_user on public.trade_offers (to_user_id, status);
create index idx_reports_status on public.reports (status);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.trends enable row level security;
alter table public.votes enable row level security;
alter table public.predictions enable row level security;
alter table public.battles enable row level security;
alter table public.battle_votes enable row level security;
alter table public.hot_takes enable row level security;
alter table public.hot_take_votes enable row level security;
alter table public.hype_pitches enable row level security;
alter table public.hype_pitch_votes enable row level security;
alter table public.hype_pitch_cooldowns enable row level security;
alter table public.dictionary enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.cosmetics enable row level security;
alter table public.badges enable row level security;
alter table public.sponsored_packages enable row level security;
alter table public.social_claims enable row level security;
alter table public.reports enable row level security;
alter table public.shop_drops enable row level security;
alter table public.shop_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.marketplace_transactions enable row level security;
alter table public.trade_offers enable row level security;
alter table public.wishlists enable row level security;
alter table public.price_history enable row level security;

-- Profiles
create policy "Public profiles viewable if public"
  on public.profiles for select
  using (is_public = true or auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trends
create policy "Trends are publicly readable"
  on public.trends for select
  using (true);

-- Votes
create policy "Votes viewable by all"
  on public.votes for select
  using (true);

create policy "Users insert own votes"
  on public.votes for insert
  with check (auth.uid() = user_id);

-- Predictions
create policy "Predictions viewable by all"
  on public.predictions for select
  using (true);

create policy "Users insert own predictions"
  on public.predictions for insert
  with check (auth.uid() = user_id);

-- Battles
create policy "Battles viewable by all"
  on public.battles for select
  using (true);

-- Battle votes
create policy "Battle votes viewable by all"
  on public.battle_votes for select
  using (true);

create policy "Users insert own battle votes"
  on public.battle_votes for insert
  with check (auth.uid() = user_id);

-- Hot takes
create policy "Hot takes public"
  on public.hot_takes for select
  using (true);

create policy "Users insert hot takes"
  on public.hot_takes for insert
  with check (auth.uid() = user_id);

-- Hot take votes
create policy "Hot take votes viewable by all"
  on public.hot_take_votes for select
  using (true);

create policy "Users manage own hot take votes"
  on public.hot_take_votes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Hype pitches
create policy "Hype pitches public"
  on public.hype_pitches for select
  using (true);

create policy "Users insert hype pitches"
  on public.hype_pitches for insert
  with check (auth.uid() = user_id);

-- Hype pitch votes
create policy "Hype pitch votes viewable by all"
  on public.hype_pitch_votes for select
  using (true);

create policy "Users insert own hype pitch votes"
  on public.hype_pitch_votes for insert
  with check (auth.uid() = user_id);

-- Hype pitch cooldowns (read-only for clients; cron uses service role)
create policy "Hype pitch cooldowns public read"
  on public.hype_pitch_cooldowns for select
  using (true);

-- Dictionary
create policy "Dictionary publicly readable"
  on public.dictionary for select
  using (true);

-- Weekly reports
create policy "Weekly reports publicly readable"
  on public.weekly_reports for select
  using (true);

-- Cosmetics & badges
create policy "Cosmetics public"
  on public.cosmetics for select
  using (true);

create policy "Badges public"
  on public.badges for select
  using (true);

-- Sponsored packages (active placements visible to all)
create policy "Active sponsored packages public"
  on public.sponsored_packages for select
  using (is_active = true);

-- Social claims
create policy "Social claims own"
  on public.social_claims for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Reports
create policy "Users insert own reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users view own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- Shop
create policy "Shop drops public"
  on public.shop_drops for select
  using (true);

create policy "Shop items public"
  on public.shop_items for select
  using (true);

-- Inventory
create policy "Inventory viewable by owner"
  on public.inventory_items for select
  using (auth.uid() = owner_id);

create policy "Users update own inventory"
  on public.inventory_items for update
  using (auth.uid() = owner_id);

-- Marketplace listings
create policy "Marketplace listings public"
  on public.marketplace_listings for select
  using (is_active = true or auth.uid() = seller_id);

create policy "Users manage own listings"
  on public.marketplace_listings for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- Marketplace transactions
create policy "Participants view own transactions"
  on public.marketplace_transactions for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Trade offers
create policy "Trade offers visible to participants"
  on public.trade_offers for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users create trade offers"
  on public.trade_offers for insert
  with check (auth.uid() = from_user_id);

create policy "Participants update trade offers"
  on public.trade_offers for update
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Wishlists
create policy "Wishlists own"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Price history
create policy "Price history public"
  on public.price_history for select
  using (true);

-- -----------------------------------------------------------------------------
-- RPC: purchase_shop_item
-- Atomic shop purchase — prevents race conditions on limited supply.
-- -----------------------------------------------------------------------------
create or replace function public.purchase_shop_item(
  p_user_id uuid,
  p_shop_item_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.shop_items%rowtype;
  v_profile public.profiles%rowtype;
  v_serial int;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_item
  from public.shop_items
  where id = p_shop_item_id
  for update;

  if not found then
    raise exception 'ITEM_NOT_FOUND';
  end if;

  if v_item.remaining <= 0 or v_item.is_sold_out then
    raise exception 'SOLD_OUT';
  end if;

  select * into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  if v_profile.is_banned then
    raise exception 'USER_BANNED';
  end if;

  if v_profile.credits < v_item.credit_price then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  v_serial := v_item.supply - v_item.remaining + 1;

  update public.shop_items
  set
    remaining = remaining - 1,
    is_sold_out = (remaining - 1 <= 0)
  where id = p_shop_item_id;

  update public.profiles
  set
    credits = credits - v_item.credit_price,
    owned_cosmetic_ids = array_append(owned_cosmetic_ids, v_item.cosmetic_id)
  where id = p_user_id;

  insert into public.inventory_items (
    owner_id, cosmetic_id, shop_item_id, serial_number,
    acquired_via, original_drop_id
  )
  values (
    p_user_id, v_item.cosmetic_id, p_shop_item_id, v_serial,
    'drop_purchase', v_item.drop_id
  );

  update public.cosmetics
  set
    total_supply = total_supply + 1,
    owners_count = owners_count + 1
  where id = v_item.cosmetic_id;

  return json_build_object('success', true, 'serial_number', v_serial);
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: accept_trade_offer
-- Atomic P2P trade — swaps inventory items and optional credit sweetener.
-- -----------------------------------------------------------------------------
create or replace function public.accept_trade_offer(
  p_trade_id uuid,
  p_user_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade public.trade_offers%rowtype;
  v_from_profile public.profiles%rowtype;
  v_to_profile public.profiles%rowtype;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_trade
  from public.trade_offers
  where id = p_trade_id
  for update;

  if not found then
    raise exception 'TRADE_NOT_FOUND';
  end if;

  if v_trade.to_user_id != p_user_id then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if v_trade.status != 'pending' then
    raise exception 'OFFER_NOT_PENDING';
  end if;

  if v_trade.expires_at is not null and v_trade.expires_at < now() then
    update public.trade_offers set status = 'expired' where id = p_trade_id;
    raise exception 'OFFER_EXPIRED';
  end if;

  select * into v_from_profile
  from public.profiles
  where id = v_trade.from_user_id
  for update;

  select * into v_to_profile
  from public.profiles
  where id = v_trade.to_user_id
  for update;

  if v_from_profile.is_banned or v_to_profile.is_banned then
    raise exception 'USER_BANNED';
  end if;

  if v_trade.offered_credits > 0 and v_from_profile.credits < v_trade.offered_credits then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  update public.inventory_items
  set owner_id = v_trade.to_user_id
  where id = any (v_trade.offered_item_ids)
    and owner_id = v_trade.from_user_id;

  update public.inventory_items
  set owner_id = v_trade.from_user_id
  where id = any (v_trade.requested_item_ids)
    and owner_id = v_trade.to_user_id;

  if v_trade.offered_credits > 0 then
    update public.profiles
    set credits = credits - v_trade.offered_credits
    where id = v_trade.from_user_id;

    update public.profiles
    set credits = credits + v_trade.offered_credits
    where id = v_trade.to_user_id;
  end if;

  update public.trade_offers
  set status = 'accepted'
  where id = p_trade_id;

  return json_build_object('success', true);
end;
$$;

grant execute on function public.purchase_shop_item(uuid, uuid) to authenticated;
grant execute on function public.accept_trade_offer(uuid, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- OPTIONAL: Auto-create profile on auth signup
-- HypeRank onboarding may instead create the profile with a chosen username.
-- Uncomment the block below if you want a stub profile on every signup.
-- -----------------------------------------------------------------------------
/*
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      'user_' || substr(replace(new.id::text, '-', ''), 1, 8)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
*/
