-- =============================================================================
-- HypeRank — RESET (run BEFORE schema.sql on an existing Supabase project)
-- =============================================================================
--
-- ⚠️  WARNING: Deletes ALL data in public tables listed below.
--     auth.users accounts are kept — only public schema data is wiped.
--
-- Usage in Supabase SQL Editor:
--   1. Run this file (00_reset.sql)
--   2. Run schema.sql
--
-- =============================================================================

-- RPC functions (must drop before tables they reference)
drop function if exists public.purchase_shop_item(uuid, uuid);
drop function if exists public.accept_trade_offer(uuid, uuid);
drop function if exists public.handle_new_user() cascade;

-- Shop / marketplace (new schema)
drop table if exists public.price_history cascade;
drop table if exists public.wishlists cascade;
drop table if exists public.trade_offers cascade;
drop table if exists public.marketplace_transactions cascade;
drop table if exists public.marketplace_listings cascade;
drop table if exists public.inventory_items cascade;
drop table if exists public.shop_items cascade;
drop table if exists public.shop_drops cascade;

-- Core app tables (new schema)
drop table if exists public.reports cascade;
drop table if exists public.social_claims cascade;
drop table if exists public.sponsored_packages cascade;
drop table if exists public.badges cascade;
drop table if exists public.cosmetics cascade;
drop table if exists public.weekly_reports cascade;
drop table if exists public.dictionary cascade;
drop table if exists public.hot_take_votes cascade;
drop table if exists public.hot_takes cascade;
drop table if exists public.battle_votes cascade;
drop table if exists public.battles cascade;
drop table if exists public.predictions cascade;
drop table if exists public.votes cascade;
drop table if exists public.trends cascade;
drop table if exists public.profiles cascade;

-- Legacy tables from the old static HypeRank site (safe if missing)
drop table if exists public.health_logs cascade;
drop table if exists public.trend_submissions cascade;
drop table if exists public.user_credits cascade;
drop table if exists public.sponsored_clicks cascade;
drop table if exists public.trend_impressions cascade;
drop table if exists public.dictionary_terms cascade;
drop table if exists public.news cascade;

-- Optional: nuclear reset of entire public schema (uncomment only if drops above fail)
-- drop schema public cascade;
-- create schema public;
-- grant usage on schema public to postgres, anon, authenticated, service_role;
-- grant all on all tables in schema public to postgres, anon, authenticated, service_role;
-- grant all on all routines in schema public to postgres, anon, authenticated, service_role;
-- grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
-- alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
-- alter default privileges in schema public grant all on routines to postgres, anon, authenticated, service_role;
-- alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
