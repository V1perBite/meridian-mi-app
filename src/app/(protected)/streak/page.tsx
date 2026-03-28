"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import { HabitCard } from "@/components/streak/habit-card";
import { HabitForm } from "@/components/streak/habit-form";
import { useLocale } from "@/lib/hooks/use-locale";
import type { Habit } from "@/lib/types/domain";
import type { ApiResponse } from "@/lib/types/api";
import type { CreateHabitInput } from "@/lib/validations/habit.schema";
import { getTodayStringBogota } from "@/lib/utils/date";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = (await res.json()) as ApiResponse<T>;
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

export default function StreakPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const today = getTodayStringBogota();

  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: habits = [], isLoading, isError, refetch } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: () => apiFetch<Habit[]>("/api/habits?logs=true")
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateHabitInput) =>
      apiFetch("/api/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["habits"] }); setFormOpen(false); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateHabitInput> }) =>
      apiFetch(`/api/habits?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["habits"] }); setFormOpen(false); setEditingHabit(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/habits?id=${id}`, { method: "DELETE" }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["habits"] }); setDeleteId(null); }
  });

  async function handleToggleToday(habitId: string, date: string) {
    setTogglingId(habitId);
    try {
      await apiFetch("/api/habit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id: habitId, date })
      });
      void queryClient.invalidateQueries({ queryKey: ["habits"] });
    } finally {
      setTogglingId(null);
    }
  }

  const pendingTodayCount = habits.filter((habit) => !(habit.logs ?? []).includes(today)).length;

  async function handleSubmit(data: CreateHabitInput) {
    if (editingHabit) {
      await updateMutation.mutateAsync({ id: editingHabit.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("streak.title")}</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={16} />
          {t("streak.addHabit")}
        </button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : habits.length === 0 ? (
        <EmptyState
          title={t("streak.noHabits")}
          description={t("streak.noHabitsDesc")}
          action={
            <button
              onClick={() => setFormOpen(true)}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {t("streak.addHabit")}
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {pendingTodayCount > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-sm font-medium text-amber-200">{t("streak.reminderTitle")}</p>
              <p className="mt-1 text-xs text-amber-100/80">
                {t("streak.reminderDesc", { count: pendingTodayCount })}
              </p>
            </div>
          )}

          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleToday={handleToggleToday}
              onEdit={(h) => { setEditingHabit(h); setFormOpen(true); }}
              onDelete={(id) => setDeleteId(id)}
              isToggling={togglingId === habit.id}
            />
          ))}
        </div>
      )}

      <HabitForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingHabit(null); }}
        onSubmit={handleSubmit}
        initialData={editingHabit}
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
