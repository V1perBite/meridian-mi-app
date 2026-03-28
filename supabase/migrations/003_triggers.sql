create or replace function public.set_task_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.completed = true and old.completed = false then
    new.completed_at = now();
  elsif new.completed = false and old.completed = true then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_task_completed_at on public.tasks;
create trigger trg_set_task_completed_at
before update on public.tasks
for each row
execute function public.set_task_completed_at();

create or replace function public.enforce_habit_log_ownership()
returns trigger
language plpgsql
as $$
declare
  v_habit_user uuid;
begin
  select user_id into v_habit_user
  from public.habits
  where id = new.habit_id;

  if v_habit_user is null then
    raise exception 'Habit not found';
  end if;

  if v_habit_user <> new.user_id then
    raise exception 'Habit/user mismatch';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_habit_log_ownership on public.habit_logs;
create trigger trg_enforce_habit_log_ownership
before insert or update on public.habit_logs
for each row
execute function public.enforce_habit_log_ownership();
