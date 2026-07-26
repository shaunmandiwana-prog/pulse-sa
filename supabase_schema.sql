-- ============================================================
-- PULSE SA — SUPABASE DATABASE SCHEMA
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- TABLE 1: AGENTS (Field workers)
-- ─────────────────────────────────────────────
create table if not exists agents (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  phone         text unique not null,
  township      text,
  ward          text,
  points_balance integer default 2500,
  total_earned  integer default 2500,
  total_submissions integer default 0,
  joined_at     timestamp with time zone default now(),
  last_active   timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- TABLE 2: TRADERS (The 37-field profile — core product)
-- ─────────────────────────────────────────────
create table if not exists traders (
  id              uuid default gen_random_uuid() primary key,

  -- Category 1: Identity & Business Profile
  name            text not null,
  business_type   text,
  township        text,
  ward            text,
  years_operating text,
  premises_type   text,
  employees       integer,
  dependents      integer,
  id_verified     boolean default false,

  -- Category 2: Financial Behaviour
  bank_account    text,
  mobile_money    text,
  stokvel         text,
  existing_loans  text,
  savings_method  text,
  payment_methods text,

  -- Category 3: Stock & Product Data
  top_products         text,
  restock_frequency    text,
  fastest_seller       text,
  wanted_unaffordable  text,
  primary_supplier     text,

  -- Category 4: Transaction Patterns
  turnover_good_day    numeric,
  turnover_bad_day     numeric,
  busiest_hours        text,
  wholesaler_terms     text,
  monthly_turnover     numeric,
  customers_per_day    integer,

  -- Category 5: Location & Infrastructure
  gps_lat              numeric,
  gps_lng              numeric,
  water_supply         text,
  electricity          text,
  distance_to_wholesaler text,
  restock_transport    text,

  -- Category 6: Risk & Loss History
  previous_losses          text,
  insurance_status         text,
  biggest_challenge        text,
  crime_incidents          text,
  infrastructure_disruptions text,

  -- Verification & Meta
  agent_id             uuid references agents(id),
  wholesaler_match_pct integer,
  verified             boolean default false,
  pulse_score          integer,
  submitted_at         timestamp with time zone default now(),
  last_verified_at     timestamp with time zone
);

-- ─────────────────────────────────────────────
-- TABLE 3: GIG COMPLETIONS
-- ─────────────────────────────────────────────
create table if not exists gig_completions (
  id              uuid default gen_random_uuid() primary key,
  agent_id        uuid references agents(id) not null,
  gig_type        text not null,
  points_earned   integer not null default 0,
  bonus_points    integer default 0,
  trader_id       uuid references traders(id),
  summary         text,
  raw_data        jsonb,
  gps_lat         numeric,
  gps_lng         numeric,
  submitted_at    timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- TABLE 4: POINTS LEDGER
-- ─────────────────────────────────────────────
create table if not exists points_ledger (
  id                  uuid default gen_random_uuid() primary key,
  agent_id            uuid references agents(id) not null,
  points              integer not null,
  transaction_type    text not null,
  reason              text,
  gig_completion_id   uuid references gig_completions(id),
  created_at          timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- TABLE 5: PRICE BASKET READINGS
-- ─────────────────────────────────────────────
create table if not exists price_basket_readings (
  id            uuid default gen_random_uuid() primary key,
  agent_id      uuid references agents(id) not null,
  trader_name   text,
  township      text,
  ward          text,
  gps_lat       numeric,
  gps_lng       numeric,
  bread_price   numeric,
  maize_price   numeric,
  oil_price     numeric,
  milk_price    numeric,
  eggs_price    numeric,
  sugar_price   numeric,
  airtime_price numeric,
  sunflower_oil_price numeric,
  items_logged  integer default 0,
  submitted_at  timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- TABLE 6: INFRASTRUCTURE REPORTS
-- ─────────────────────────────────────────────
create table if not exists infrastructure_reports (
  id            uuid default gen_random_uuid() primary key,
  agent_id      uuid references agents(id) not null,
  issue_type    text not null,
  location      text,
  township      text,
  ward          text,
  severity      text,
  description   text,
  gps_lat       numeric,
  gps_lng       numeric,
  submitted_at  timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index if not exists idx_traders_township on traders(township);
create index if not exists idx_traders_ward     on traders(ward);
create index if not exists idx_traders_agent    on traders(agent_id);
create index if not exists idx_gigs_agent       on gig_completions(agent_id);
create index if not exists idx_gigs_type        on gig_completions(gig_type);
create index if not exists idx_gigs_submitted   on gig_completions(submitted_at);
create index if not exists idx_ledger_agent     on points_ledger(agent_id);
create index if not exists idx_basket_ward      on price_basket_readings(ward);
create index if not exists idx_infra_ward       on infrastructure_reports(ward);

-- ─────────────────────────────────────────────
-- TRIGGER: Auto-update agent balance on points insert
-- ─────────────────────────────────────────────
create or replace function update_agent_points()
returns trigger as $$
begin
  update agents
  set
    points_balance    = points_balance + NEW.points,
    total_earned      = case when NEW.points > 0 then total_earned + NEW.points else total_earned end,
    total_submissions = total_submissions + case when NEW.transaction_type = 'earned' then 1 else 0 end,
    last_active       = now()
  where id = NEW.agent_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_points_ledger_insert
  after insert on points_ledger
  for each row execute function update_agent_points();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table agents                enable row level security;
alter table traders               enable row level security;
alter table gig_completions       enable row level security;
alter table points_ledger         enable row level security;
alter table price_basket_readings enable row level security;
alter table infrastructure_reports enable row level security;

-- Insert policies (agents submitting via anon key)
create policy "insert_gigs"    on gig_completions       for insert with check (true);
create policy "insert_traders" on traders               for insert with check (true);
create policy "insert_baskets" on price_basket_readings for insert with check (true);
create policy "insert_infra"   on infrastructure_reports for insert with check (true);
create policy "insert_ledger"  on points_ledger         for insert with check (true);
create policy "insert_agents"  on agents               for insert with check (true);

-- Select policies (dashboard reads)
create policy "read_traders" on traders               for select using (true);
create policy "read_gigs"    on gig_completions       for select using (true);
create policy "read_baskets" on price_basket_readings for select using (true);
create policy "read_infra"   on infrastructure_reports for select using (true);
create policy "read_agents"  on agents               for select using (true);
create policy "read_ledger"  on points_ledger         for select using (true);

-- DONE
