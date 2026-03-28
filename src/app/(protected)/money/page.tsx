"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { FinanceForm } from "@/components/money/finance-form";
import { FinanceList } from "@/components/money/finance-list";
import { useLocale } from "@/lib/hooks/use-locale";
import { mapFinanceRowToFinance } from "@/lib/db/mappers/finance.mapper";
import type { Finance } from "@/lib/types/domain";
import type { FinanceRow } from "@/lib/types/database";
import type { ApiResponse } from "@/lib/types/api";
import type { CreateFinanceInput } from "@/lib/validations/finance.schema";
import { formatCurrency } from "@/lib/utils/number";
import { cn } from "@/lib/utils/classnames";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = (await res.json()) as ApiResponse<T>;
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

export default function MoneyPage() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const shouldOpenNewForm = searchParams.get("new") === "1";

  function closeForm() {
    setFormOpen(false);
    setEditingFinance(null);
    if (shouldOpenNewForm) {
      router.replace("/money");
    }
  }

  useEffect(() => {
    if (shouldOpenNewForm && !editingFinance) {
      setFormOpen(true);
    }
  }, [shouldOpenNewForm, editingFinance]);

  const { data: finances = [], isLoading, isError, refetch } = useQuery<Finance[]>({
    queryKey: ["finances"],
    queryFn: async () => {
      const rows = await apiFetch<FinanceRow[]>("/api/finances");
      return rows.map(mapFinanceRowToFinance);
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateFinanceInput) =>
      apiFetch("/api/finances", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["finances"] }); closeForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFinanceInput> }) =>
      apiFetch(`/api/finances?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["finances"] }); closeForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/finances?id=${id}`, { method: "DELETE" }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["finances"] }); setDeleteId(null); }
  });

  async function handleSubmit(data: CreateFinanceInput) {
    if (editingFinance) {
      await updateMutation.mutateAsync({ id: editingFinance.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  }

  const totalIncome = finances.filter((f) => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  const balance = totalIncome - totalExpense;
  const projectOptions = Array.from(
    new Set(finances.map((finance) => finance.project?.trim()).filter(Boolean))
  ) as string[];
  const channelOptions = Array.from(
    new Set(finances.map((finance) => finance.channel?.trim()).filter(Boolean))
  ) as string[];

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("money.title")}</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/money/projects"
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            {t("money.projects")}
          </Link>
          <button
            onClick={() => router.push("/money?new=1")}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            {t("money.addTransaction")}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: t("money.balance"), value: balance, cls: balance >= 0 ? "text-green-400" : "text-red-400" },
          { label: t("money.totalIncome"), value: totalIncome, cls: "text-green-400" },
          { label: t("money.totalExpense"), value: totalExpense, cls: "text-red-400" }
        ].map(({ label, value, cls }) => (
          <div key={label} className="rounded-2xl border border-zinc-800 bg-surface p-3 text-center">
            <p className={cn("text-sm font-semibold", cls)}>{formatCurrency(value)}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <FinanceList
          finances={finances}
          onEdit={(f) => { setEditingFinance(f); setFormOpen(true); }}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <FinanceForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialData={editingFinance}
        projectOptions={projectOptions}
        channelOptions={channelOptions}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
