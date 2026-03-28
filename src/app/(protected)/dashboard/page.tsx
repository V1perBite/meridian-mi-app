"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame, Wallet } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { useLocale } from "@/lib/hooks/use-locale";
import type { DashboardStats } from "@/lib/db/queries/dashboard";
import type { ApiResponse } from "@/lib/types/api";

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

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold">{t("dashboard.title")}</h1>

      <section className="mb-6 rounded-2xl border border-zinc-800 bg-surface/80 p-4">
        <p className="text-base font-semibold text-white">{t("dashboard.quickStartTitle")}</p>
        <p className="mt-1 text-sm text-zinc-400">{t("dashboard.quickStartSubtitle")}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/streak"
            className="group rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/15 via-orange-400/10 to-transparent p-4 transition hover:border-orange-300/50 hover:from-orange-500/20"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300">
              <Flame size={20} />
            </div>
            <p className="text-sm font-medium text-white">{t("dashboard.quickHabitCta")}</p>
            <p className="mt-1 text-xs text-zinc-400">{t("streak.title")}</p>
          </Link>

          <Link
            href="/money"
            className="group rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-emerald-400/10 to-transparent p-4 transition hover:border-emerald-300/50 hover:from-emerald-500/20"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Wallet size={20} />
            </div>
            <p className="text-sm font-medium text-white">{t("dashboard.quickMoneyCta")}</p>
            <p className="mt-1 text-xs text-zinc-400">{t("money.title")}</p>
          </Link>
        </div>
      </section>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : stats ? (
        <div className="flex flex-col gap-5">
          <KpiCards stats={stats} />
          <FinancesChart data={stats.financeTrend} />
        </div>
      ) : null}
    </div>
  );
}
