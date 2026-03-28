create extension if not exists "pgcrypto";

create type public.task_priority as enum ('high', 'medium', 'low');
create type public.finance_type as enum ('income', 'expense');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  project text,
  priority public.task_priority not null default 'medium',
  due_date timestamptz,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint tasks_title_not_empty check (char_length(trim(title)) > 0)
);

create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_completed on public.tasks(completed);
create index if not exists idx_tasks_project on public.tasks(project);

create table if not exists public.finances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.finance_type not null,
  amount numeric(12,2) not null,
  project text,
  channel text,
  category text,
  note text,
  date date not null default (now() at time zone 'America/Bogota')::date,
  created_at timestamptz not null default now(),
  constraint finances_amount_positive check (amount > 0),
  constraint finances_channel_allowed check (
    channel is null or channel in ('Transferencia', 'Efectivo', 'PayPal', 'Nequi', 'Otro')
  )
);

create index if not exists idx_finances_user_id on public.finances(user_id);
create index if not exists idx_finances_date on public.finances(date);
create index if not exists idx_finances_type on public.finances(type);
create index if not exists idx_finances_project on public.finances(project);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '✅',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint habits_name_not_empty check (char_length(trim(name)) > 0)
);

create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_habits_active on public.habits(active);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default (now() at time zone 'America/Bogota')::date,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index if not exists idx_habit_logs_habit_id on public.habit_logs(habit_id);
create index if not exists idx_habit_logs_user_id on public.habit_logs(user_id);
create index if not exists idx_habit_logs_date on public.habit_logs(date);
