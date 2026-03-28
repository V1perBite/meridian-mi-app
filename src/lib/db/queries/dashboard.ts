import type { SupabaseClient } from "@supabase/supabase-js";

import { getTodayStringBogota } from "@/lib/utils/date";

export interface DashboardStats {
  monthIncome: number;
  monthExpense: number;
  weekHabitConsistency: number;
  todayIncome: number;
  todayExpense: number;
  activeHabits: number;
  habitsDoneToday: number;
  financeTrend: { date: string; income: number; expense: number }[];
}

export async function fetchDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const today = getTodayStringBogota();
  const monthStart = today.slice(0, 7) + "-01";
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekStart = weekAgo.toISOString().split("T")[0] ?? today;

  const [monthFinanceRes, weekHabitsRes, weekLogsRes, financeTrendRes] =
    await Promise.all([
      supabase
        .from("finances")
        .select("type, amount, date")
        .eq("user_id", userId)
        .gte("date", monthStart),
      supabase.from("habits").select("id").eq("user_id", userId).eq("active", true),
      supabase
        .from("habit_logs")
        .select("habit_id, date")
        .eq("user_id", userId)
        .gte("date", weekStart),
      supabase
        .from("finances")
        .select("type, amount, date")
        .eq("user_id", userId)
        .gte("date", weekStart)
        .order("date", { ascending: true })
    ]);

  const monthFinances = monthFinanceRes.data ?? [];
  const monthIncome = monthFinances
    .filter((f) => f.type === "income")
    .reduce((s, f) => s + Number(f.amount), 0);
  const monthExpense = monthFinances
    .filter((f) => f.type === "expense")
    .reduce((s, f) => s + Number(f.amount), 0);

  const habitCount = weekHabitsRes.data?.length ?? 0;
  const weekLogs = weekLogsRes.data ?? [];
  const uniqueLogDays = new Set(weekLogs.map((l) => l.date)).size;
  const weekHabitConsistency =
    habitCount > 0 ? Math.round((uniqueLogDays / (habitCount * 7)) * 100) : 0;

  const todayIncome = monthFinances
    .filter((f) => f.date === today && f.type === "income")
    .reduce((s, f) => s + Number(f.amount), 0);
  const todayExpense = monthFinances
    .filter((f) => f.date === today && f.type === "expense")
    .reduce((s, f) => s + Number(f.amount), 0);

  const habitsDoneToday = new Set(
    weekLogs.filter((l) => l.date === today).map((l) => l.habit_id)
  ).size;

  const financeByDay: Record<string, { income: number; expense: number }> = {};
  for (const f of financeTrendRes.data ?? []) {
    const d = f.date as string;
    if (!financeByDay[d]) financeByDay[d] = { income: 0, expense: 0 };
    if (f.type === "income") financeByDay[d]!.income += Number(f.amount);
    else financeByDay[d]!.expense += Number(f.amount);
  }
  const financeTrend = Object.entries(financeByDay).map(([date, vals]) => ({ date, ...vals }));

  return {
    monthIncome,
    monthExpense,
    weekHabitConsistency,
    todayIncome,
    todayExpense,
    activeHabits: habitCount,
    habitsDoneToday,
    financeTrend
  };
}
