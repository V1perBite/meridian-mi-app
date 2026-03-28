"use client";

import { ArrowRight, Flame, Wallet } from "lucide-react";
import Link from "next/link";

import { useLocale } from "@/lib/hooks/use-locale";

export default function DashboardPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-lg flex-col justify-center px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{t("dashboard.quickStartTitle")}</h1>
      <p className="mt-2 text-sm text-zinc-400">{t("dashboard.quickStartSubtitle")}</p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <Link
          href="/streak"
          className="group rounded-2xl border border-orange-400/35 bg-gradient-to-br from-orange-500/20 via-orange-400/10 to-transparent p-4 transition hover:border-orange-300/60"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300">
            <Flame size={22} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-white">{t("dashboard.quickHabitCta")}</p>
              <p className="mt-0.5 text-xs text-zinc-400">{t("streak.title")}</p>
            </div>
            <ArrowRight size={18} className="text-zinc-300 transition group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link
          href="/money?new=1"
          className="group rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent p-4 transition hover:border-emerald-300/60"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Wallet size={22} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-white">{t("dashboard.quickMoneyCta")}</p>
              <p className="mt-0.5 text-xs text-zinc-400">{t("money.addTransaction")}</p>
            </div>
            <ArrowRight size={18} className="text-zinc-300 transition group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
