# HypeRank setup checklist

Things only you can do (accounts, DNS, secrets, OAuth). Ordered **do first → do later**.

Stack: **GitHub → Vercel → Cloudflare DNS → Supabase**

---

## Tier 1 — Do today (site won't work without these)

### Supabase

- [ ] Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
- [ ] **SQL Editor** → run `supabase/00_reset.sql` (only if you need a clean slate / first migration failed)
- [ ] **SQL Editor** → run `supabase/schema.sql`
- [ ] **Settings → API** → copy:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (never expose to client)

### Vercel env vars

**Project → Settings → Environment Variables** (set for Production + Preview):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase (server only) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.hyperank.ca` (use `www` — bare `hyperank.ca` redirects) |
| `CRON_SECRET` | Random string (`openssl rand -hex 32`) |
| `ADMIN_USER_ID` | Your Supabase user UUID (see below) |
| `NEXT_PUBLIC_RPM_SUBDOMAIN` | `hyperank` (after RPM setup) |
| `CONTACT_EMAIL` | `legal@hyperank.ca` |

- [ ] Redeploy after adding env vars (Deployments → ⋯ → Redeploy)

### Get your `ADMIN_USER_ID`

- [ ] Sign up on the site once (or create user in Supabase Auth)
- [ ] Supabase → **Authentication → Users** → copy your user **UUID**
- [ ] Paste into Vercel as `ADMIN_USER_ID` → redeploy

### GitHub → Vercel

- [ ] Push repo to GitHub (if not already)
- [ ] Vercel → **Import** repo → framework: Next.js → deploy
- [ ] Confirm build passes

### Seed trends + dictionary (empty site until you do this)

After deploy + env vars are set:

```bash
# Use www (or -L to follow redirect). Replace YOUR_CRON_SECRET with Vercel CRON_SECRET.
export CRON_SECRET="YOUR_CRON_SECRET"

curl -L -X POST https://www.hyperank.ca/api/seed/trends \
  -H "Authorization: Bearer $CRON_SECRET"

curl -L -X POST https://www.hyperank.ca/api/seed/dictionary \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Local dev** (with `npm run dev` and `.env.local`):

`CRON_SECRET` in `.env.local` must match the Bearer token in curl. After editing `.env.local`, restart `npm run dev`.

```bash
# Option A — use the same secret as production (paste into .env.local CRON_SECRET=...)
export CRON_SECRET="your-cron-secret"

# Option B — use the placeholder from .env.local.example (default: local-dev-secret-change-me)
export CRON_SECRET="local-dev-secret-change-me"

curl -X POST http://localhost:3000/api/seed/trends \
  -H "Authorization: Bearer $CRON_SECRET"

curl -X POST http://localhost:3000/api/seed/dictionary \
  -H "Authorization: Bearer $CRON_SECRET"
```

- [ ] Run both commands — expect JSON like `{"ok":true,"seeded":42}`
- [ ] Homepage should show trends

### Local environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys and CRON_SECRET
npm run dev
```

---

## Tier 2 — This week (auth + domain)

### Supabase Auth — OAuth

**Authentication → Providers** — enable and add credentials:

- [ ] **Google** — [Google Cloud Console](https://console.cloud.google.com) OAuth client
- [ ] **Discord** — [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] **Twitter/X** — [X Developer Portal](https://developer.twitter.com)

**Authentication → URL configuration:**

| Setting | Value |
|---------|--------|
| Site URL | `https://www.hyperank.ca` |
| Redirect URLs | `https://www.hyperank.ca/auth/callback`, `http://localhost:3000/auth/callback` |
| | `http://localhost:3000/auth/callback` (local dev) |

- [ ] Save and test login at `/login`

### Cloudflare DNS → Vercel

- [ ] Cloudflare → DNS for `hyperank.ca`:
  - `@` → CNAME → `cname.vercel-dns.com` (or A records per Vercel docs)
  - `www` → CNAME → `cname.vercel-dns.com`
- [ ] Vercel → **Settings → Domains** → add `hyperank.ca` + `www.hyperank.ca`
- [ ] Wait for SSL (Vercel + Cloudflare)

**Cloudflare SSL:** use **Full (strict)** once Vercel cert is active.

**Proxy (orange cloud):** fine for most traffic; if OAuth or WebSockets act up, try DNS-only temporarily to debug.

### Email confirmation (optional but recommended)

Supabase → **Authentication → Providers → Email**:

- [ ] Decide: require email confirm or not
- [ ] **Authentication → Email templates** — customize if you want

### Resend (parental consent / transactional email)

- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Verify domain `hyperank.ca` (DNS records in Cloudflare)
- [ ] Add `RESEND_API_KEY` to Vercel
- [ ] Wire sending in app later (minor consent flow is UI-only for now)

---

## Tier 3 — Core product working end-to-end

### Ready Player Me (avatars)

- [ ] [readyplayer.me/developers](https://readyplayer.me/developers) → create app
- [ ] Subdomain: `hyperank` → matches `NEXT_PUBLIC_RPM_SUBDOMAIN`
- [ ] Allowed parent URLs: `https://hyperank.ca`, `http://localhost:3000`
- [ ] Test `/locker` → create avatar → should save to profile

### Vercel Cron jobs (Hobby plan)

**Vercel Hobby only allows 2 cron jobs, each running at most once per day.**  
The repo is configured for that:

| Schedule | Path | What it does |
|----------|------|----------------|
| `0 0 * * *` (midnight UTC daily) | `/api/cron/daily` | Daily drop, vote velocity, predictions, battles, streaks, cosmetics, shop cleanup, trades, floor prices, unbans. Weekly report runs here on **Sundays**. |
| `0 12 * * 1` (noon UTC Mondays) | `/api/cron/weekly` | Activates scheduled shop weekly drops |

- [ ] Set `CRON_SECRET` in Vercel env vars (Vercel sends it as `Authorization: Bearer …` on cron invocations)
- [ ] Deploy → **Settings → Cron Jobs** — confirm **2 jobs** appear (not 12)
- [ ] Vote velocity updates **once per day** (24h window), not every 10 minutes — upgrade to **Vercel Pro** for high-frequency crons

**Manual test (runs everything daily):**

```bash
curl https://hyperank.ca/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Manual test (single job):**

```bash
curl https://hyperank.ca/api/cron/daily-drop \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

- [ ] Daily cron returns `{ ok: true, results: { ... } }`
- [ ] Check homepage "Daily Drop" after trigger or next midnight UTC

**Want 10-min velocity / 30-min battles?** Options without Pro:
- [ ] Use [cron-job.org](https://cron-job.org) or **Cloudflare Workers cron** to hit `/api/cron/vote-velocity` with your `CRON_SECRET`
- [ ] Or upgrade Vercel to Pro and restore granular schedules in `vercel.json`

### Create first battle (admin)

- [ ] `ADMIN_USER_ID` set and redeployed
- [ ] Visit `https://hyperank.ca/admin/battles`
- [ ] Create a 72h battle between two trends
- [ ] Vote at `/battles/[id]`

### Smoke test flows

- [ ] Sign up → age gate → OAuth → pick username (`/onboarding`)
- [ ] Vote on a trend (credits + streak update)
- [ ] Post a hot take on trend detail
- [ ] Place a prediction (10+ credits)
- [ ] View public profile `/u/yourusername`
- [ ] Leaderboard shows you after voting

---

## Tier 4 — Shop, marketplace, monetization

### Weekly shop drop (manual for now)

No admin UI for drops yet — create in Supabase **Table Editor** or SQL:

- [ ] Insert row in `shop_drops` (name, `drop_date`, `ends_at`, `is_active`)
- [ ] Insert rows in `shop_items` linked to `cosmetics` catalog (seeded in schema)
- [ ] Test `/shop/drop` → buy with credits

### Marketplace

- [ ] Test listing at `/shop/market/list`
- [ ] Marketplace buy flow is still thin — optional: add `buy_marketplace_listing` RPC in Supabase

### Google AdSense

- [ ] [google.com/adsense](https://google.com/adsense) — apply with `hyperank.ca`
- [ ] Keep `public/ads.txt` deployed (already in repo)
- [ ] Replace `<AdSlot />` placeholders with real units when approved
- [ ] Update cookie banner + `/legal/cookies` when ad cookies go live

### Google Analytics (optional)

Old site used `G-ZC93ESXDWX`. If you want it back:

- [ ] Load gtag **only after** cookie consent = "Accept All"
- [ ] Add script in layout or analytics component

---

## Tier 5 — Security & compliance (before real traffic)

### Supabase RLS

- [ ] Confirm RLS enabled on all tables (schema does this)
- [ ] Never commit `.env.local` or service role key to GitHub

### Cloudflare security

- [ ] **SSL/TLS** → Full (strict)
- [ ] **WAF** → basic rules if available on your plan
- [ ] **Rate limiting** on `/api/*` optional extra layer

### Upstash Redis (optional — better rate limits)

App uses in-memory rate limits (resets on cold starts). For production:

- [ ] [upstash.com](https://upstash.com) → create Redis
- [ ] Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to Vercel
- [ ] Wire in code later (not required to launch)

### Legal pages

- [ ] Read `/legal/*` — replace placeholder emails/law province if needed
- [ ] Footer links work (already wired)

### COPPA / minors

- [ ] Age gate blocks under-13 (implemented)
- [ ] Parental consent email needs Resend + backend (not fully automated yet)

---

## Tier 6 — Later / nice to have

### Content & ops

- [ ] Add more trends (admin or SQL)
- [ ] Dictionary terms beyond seed JSON
- [ ] Brand applications → manually set `is_brand = true` in Supabase
- [ ] Sponsored trends → set `is_sponsored` + sponsor fields on `trends`
- [ ] Admin drop builder UI (`/admin/drops` is stub)
- [ ] Social verify automation (currently manual)
- [ ] Discord bot for daily drop
- [ ] PWA / manifest polish
- [ ] 3D cosmetic GLB files in `/public/cosmetics/`

### Dev workflow

- [ ] Local: copy Vercel env vars to `.env.local` (see `.env.example`)
- [ ] `npm run dev` for local testing
- [ ] GitHub: protect `main`, PR previews on Vercel
- [ ] Cloudflare: purge cache after big deploys if assets look stale

### Monitoring

- [ ] Vercel Analytics (optional)
- [ ] Supabase → database health + disk usage
- [ ] Uptime check on `https://hyperank.ca` (UptimeRobot, Better Stack, etc.)

---

## Quick reference — stack diagram

```
GitHub (push) → Vercel (build + host + crons)
                    ↓
              hyperank.ca ← Cloudflare DNS/SSL
                    ↓
              Supabase (auth + DB)
              Ready Player Me (avatars)
              Resend (email, later)
```

---

## If something breaks — check in this order

1. Vercel env vars set and redeployed?
2. `00_reset.sql` + `schema.sql` run successfully?
3. Seed endpoints called with correct `CRON_SECRET`?
4. Supabase redirect URLs include `https://hyperank.ca/auth/callback`?
5. Cloudflare SSL mode = Full (strict)?
6. Browser console / Vercel function logs for API errors?

---

## Minimum path to "it works"

Complete **Tier 1** → **Tier 2** (OAuth + DNS) → seed data → sign in and vote.

Roughly **1–2 hours** if Supabase and Vercel are already connected.
