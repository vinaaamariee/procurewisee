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
  originator?: string;
  priority?: "High" | "Medium" | "Low";
}

interface TodayTasksProps {
  tasks: DashboardTask[];
}

const taskIcon = {
  pr: FileText,
  rfq: ClipboardList,
  po: ShoppingCart,
  quote: Quote,
} as const;

export default function TodayTasks({ tasks }: TodayTasksProps) {
  return (
    <div className="overflow-hidden rounded-md border border-base-300 bg-base-100 shadow-none text-left">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-4 border-b border-base-200 px-5 py-3.5 bg-base-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-base-200 border border-base-300 text-primary">
            <Target className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-base-content tracking-tight">
              Action Items & Pending Workflows
            </h2>
            <p className="text-xs text-base-content/60">
              Procurement documents and actions requiring review
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-base-content/70 px-2 py-0.5 bg-base-200 rounded">
          {tasks.length} pending
        </span>
      </div>

      {/* Task List */}
      <div className="divide-y divide-base-200">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const Icon = taskIcon[task.type];
            
            // Subtle priority indicators (dots instead of loud badges)
            const priorityDotColor = 
              task.priority === "High"
                ? "bg-error"
                : task.priority === "Medium"
                  ? "bg-warning"
                  : "bg-info";

            return (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 hover:bg-base-200/40 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-base-200 border border-base-300 text-base-content/70">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    {/* Originator Unit */}
                    <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">
                      {task.originator || "Procurement Unit"}
                    </div>
                    {/* Document Title */}
                    <h3 className="text-sm font-bold text-base-content mt-0.5 leading-snug">
                      {task.title}
                    </h3>
                    {/* Document Metadata Row */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                      <span className="font-semibold text-base-content/85">
                        {task.badge}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-base-300"></span>
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${priorityDotColor}`}></span>
                        <span>{task.priority || "Medium"} Priority</span>
                      </span>
                      <span className="h-1 w-1 rounded-full bg-base-300"></span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:shrink-0 flex items-center">
                  {task.link === "#" ? (
                    <button
                      disabled
                      className="btn btn-xs btn-outline border-base-300 text-base-content/40 cursor-not-allowed font-bold rounded-md w-full sm:w-auto"
                    >
                      <span>Unavailable</span>
                    </button>
                  ) : (
                    <Link
                      href={task.link}
                      className="btn btn-xs btn-outline border-base-300 hover:bg-base-200 text-base-content font-bold rounded-md flex items-center gap-1 w-full sm:w-auto"
                    >
                      <span>{task.btnLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center bg-base-100">
            <PartyPopper className="h-8 w-8 text-secondary" />
            <div>
              <p className="text-sm font-bold text-base-content">
                No active tasks
              </p>
              <p className="text-xs text-base-content/60 mt-0.5">
                All workflows are up to date.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
