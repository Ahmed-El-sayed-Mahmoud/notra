create table if not exists tasks (
  id            uuid          primary key default gen_random_uuid(),
  title         text          not null,
  description   text,
  priority      text          not null default 'medium',
  due_date      timestamptz,
  completed     boolean       not null default false,
  created_at    timestamptz   not null default now(),
  ai_suggestions text[]       not null default '{}'
);

-- RLS is intentionally disabled: single-user app, no authentication layer.
alter table tasks disable row level security;
