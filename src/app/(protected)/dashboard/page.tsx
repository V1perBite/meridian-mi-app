"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { useLocale } from "@/lib/hooks/use-locale";
import type { DashboardStats } from "@/lib/db/queries/dashboard";
import type { ApiResponse } from "@/lib/types/api";
import { formatCurrency } from "@/lib/utils/number";

const FinancesChart = dynamic(
  () => import("@/components/dashboard/finances-chart").then((m) => m.FinancesChart),
  { ssr: false }
);

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard");
  const json = (await res.json()) as ApiResponse<DashboardStats>;
  if (json.error) throw new Error(json.error);
  return json.data as DashboardStats;
}

export default function DashboardPage() {
  const { t } = useLocale();

  const { data: stats, isLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: fetchStats
  });

  const todayBalance = (stats?.todayIncome ?? 0) - (stats?.todayExpense ?? 0);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold">{t("dashboard.title")}</h1>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : stats ? (
        <div className="flex flex-col gap-5">
          <section className="rounded-2xl border border-zinc-800 bg-surface p-4">
            <p className="text-sm font-medium text-zinc-400">{t("dashboard.dailySummary")}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
                <p className="text-xs text-zinc-500">{t("dashboard.todayBalance")}</p>
                <p className={`mt-1 text-lg font-semibold ${todayBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(todayBalance)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
                <p className="text-xs text-zinc-500">{t("dashboard.habitsToday")}</p>
                <p className="mt-1 text-lg font-semibold text-orange-300">
                  {stats.habitsDoneToday}/{stats.activeHabits}
                </p>
              </div>
            </div>
          </section>

          <KpiCards stats={stats} />
          <FinancesChart data={stats.financeTrend} />
        </div>
      ) : null}
    </div>
  );
}
