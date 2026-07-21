import Link from "next/link";
import {
  Target,
  ArrowRight,
  FileText,
  ClipboardList,
  ShoppingCart,
  Quote,
  PartyPopper,
} from "lucide-react";

export interface DashboardTask {
  id: string;
  type: "pr" | "rfq" | "po" | "quote";
  title: string;
  badge: string;
  dueDate: string;
  link: string;
  btnLabel: string;
}

interface TodayTasksProps {
  tasks: DashboardTask[];
}

const taskAccent = {
  pr: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  rfq: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  po: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  quote: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
} as const;

const taskIcon = {
  pr: FileText,
  rfq: ClipboardList,
  po: ShoppingCart,
  quote: Quote,
} as const;

export default function TodayTasks({ tasks }: TodayTasksProps) {
  return (
    <div
      className="h-full overflow-hidden rounded-3xl border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between gap-4 border-b px-6 py-5"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-glass)", color: "var(--accent)" }}
          >
            <Target className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              Today&apos;s Tasks
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Urgent workflows awaiting your action
            </p>
          </div>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: "var(--accent-glass)",
            color: "var(--accent)",
            border: "1px solid var(--border-accent)",
          }}
        >
          {tasks.length} pending
        </span>
      </div>

      {/* Tasks list */}
      <div className="p-4 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const Icon = taskIcon[task.type];
            return (
              <div
                key={task.id}
                className="group flex flex-col gap-4 rounded-2xl border p-4 transition-all duration-200 hover:border-[var(--border-accent)] hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                style={{
                  background: "var(--bg-deep)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
                    style={{ background: "var(--surface)", color: "var(--accent)" }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${taskAccent[task.type]}`}
                      >
                        {task.badge}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Due: {task.dueDate}
                      </span>
                    </div>
                    <p
                      className="truncate text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {task.title}
                    </p>
                  </div>
                </div>

                <Link
                  href={task.link}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 sm:shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  {task.btnLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })
        ) : (
          <div
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <PartyPopper className="h-10 w-10 text-amber-500" />
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                All caught up!
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                No pending tasks require your attention today.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
