-- ─── Coaches table ────────────────────────────────────────────────────────────

create table if not exists coaches (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  title       text,
  focus       text,
  tags        text[],
  bio         text,
  index       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Seed data ────────────────────────────────────────────────────────────────

insert into coaches (id, name, title, focus, tags, bio, index) values
  (
    'a0000000-0000-0000-0000-000000000001',
    'Jessie Li',
    'Founder & Lead Coach',
    'Executive Leadership',
    array['Leadership', 'Venture Building', 'Inner Work'],
    'Jessie works with founders and executives navigating high-stakes transitions, helping them lead with clarity and conviction.',
    '01'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Coming Soon',
    'Executive Coach',
    'Wellness & Vitality',
    array['Wellness', 'Performance', 'Resilience'],
    'A world-class coach specialising in sustainable performance and vitality for leaders under pressure.',
    '02'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Coming Soon',
    'Mentor & Advisor',
    'Venture Building',
    array['Startups', 'Fundraising', 'Scale'],
    'Accelerator mentor and operator who has built and scaled ventures across Southeast Asia and the US.',
    '03'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Coming Soon',
    'Spiritual Guide',
    'Spiritual Growth',
    array['Mindfulness', 'Purpose', 'Clarity'],
    'Guides leaders through the deeper inner work that unlocks clarity, presence, and untapped potential.',
    '04'
  )
on conflict (id) do nothing;

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table coaches enable row level security;

-- Authenticated users can read coaches
create policy "Authenticated users can read coaches"
  on coaches
  for select
  to authenticated
  using (true);

-- Admins can manage coaches (insert, update, delete)
create policy "Admins can manage coaches"
  on coaches
  for all
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── Auto-update updated_at trigger ──────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists coaches_updated_at on coaches;

create trigger coaches_updated_at
  before update on coaches
  for each row
  execute function update_updated_at();
