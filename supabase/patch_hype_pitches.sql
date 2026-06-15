-- Run on existing HypeRank DBs (skip if you ran full schema.sql fresh)

alter table public.trends
  add column if not exists is_community_pick boolean default false;

create table if not exists public.hype_pitches (
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

create table if not exists public.hype_pitch_votes (
  user_id uuid references public.profiles (id) on delete cascade,
  pitch_id uuid references public.hype_pitches (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, pitch_id)
);

create table if not exists public.hype_pitch_cooldowns (
  pitch_key text primary key,
  banned_until date not null,
  source_pitch_id uuid references public.hype_pitches (id),
  created_at timestamptz default now()
);

create index if not exists idx_hype_pitches_status_votes
  on public.hype_pitches (status, vote_count desc);
create index if not exists idx_hype_pitches_user_id
  on public.hype_pitches (user_id);
create index if not exists idx_hype_pitch_cooldowns_until
  on public.hype_pitch_cooldowns (banned_until);

alter table public.hype_pitches enable row level security;
alter table public.hype_pitch_votes enable row level security;
alter table public.hype_pitch_cooldowns enable row level security;

drop policy if exists "Hype pitches public" on public.hype_pitches;
create policy "Hype pitches public"
  on public.hype_pitches for select using (true);

drop policy if exists "Users insert hype pitches" on public.hype_pitches;
create policy "Users insert hype pitches"
  on public.hype_pitches for insert with check (auth.uid() = user_id);

drop policy if exists "Hype pitch votes viewable by all" on public.hype_pitch_votes;
create policy "Hype pitch votes viewable by all"
  on public.hype_pitch_votes for select using (true);

drop policy if exists "Users insert own hype pitch votes" on public.hype_pitch_votes;
create policy "Users insert own hype pitch votes"
  on public.hype_pitch_votes for insert with check (auth.uid() = user_id);

drop policy if exists "Hype pitch cooldowns public read" on public.hype_pitch_cooldowns;
create policy "Hype pitch cooldowns public read"
  on public.hype_pitch_cooldowns for select using (true);
