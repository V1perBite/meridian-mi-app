alter table public.tasks enable row level security;
alter table public.finances enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "tasks_select_own"
on public.tasks for select
using (auth.uid() = user_id);

create policy "tasks_insert_own"
on public.tasks for insert
with check (auth.uid() = user_id);

create policy "tasks_update_own"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tasks_delete_own"
on public.tasks for delete
using (auth.uid() = user_id);

create policy "finances_select_own"
on public.finances for select
using (auth.uid() = user_id);

create policy "finances_insert_own"
on public.finances for insert
with check (auth.uid() = user_id);

create policy "finances_update_own"
on public.finances for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "finances_delete_own"
on public.finances for delete
using (auth.uid() = user_id);

create policy "habits_select_own"
on public.habits for select
using (auth.uid() = user_id);

create policy "habits_insert_own"
on public.habits for insert
with check (auth.uid() = user_id);

create policy "habits_update_own"
on public.habits for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "habits_delete_own"
on public.habits for delete
using (auth.uid() = user_id);

create policy "habit_logs_select_own"
on public.habit_logs for select
using (auth.uid() = user_id);

create policy "habit_logs_insert_own"
on public.habit_logs for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits h
    where h.id = habit_id
      and h.user_id = auth.uid()
  )
);

create policy "habit_logs_update_own"
on public.habit_logs for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits h
    where h.id = habit_id
      and h.user_id = auth.uid()
  )
);

create policy "habit_logs_delete_own"
on public.habit_logs for delete
using (auth.uid() = user_id);
