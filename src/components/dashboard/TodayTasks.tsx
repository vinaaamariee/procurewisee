import Link from "next/link";
import {
  Target,
  ArrowRight,
  FileText,
  ClipboardList,
  ShoppingCart,
  Quote,
  PartyPopper,
  AlertCircle,
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
    <div className="overflow-hidden rounded-xl border border-base-200 bg-base-100">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-4 border-b border-base-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base-content/75">
            <Target className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-black text-base-content tracking-tight">
              Today&apos;s Tasks
            </h2>
            <p className="text-xs text-base-content/60">
              Urgent workflows awaiting your action
            </p>
          </div>
        </div>
        <span className="badge badge-sm bg-[#7B1E1E]/10 text-[#7B1E1E] font-bold border-none rounded">
          {tasks.length} pending
        </span>
      </div>

      {/* Task List */}
      <div className="divide-y divide-base-200">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const Icon = taskIcon[task.type];
            
            // Priority colors
            const priorityClass = 
              task.priority === "High"
                ? "bg-red-50 text-red-700 border-red-100"
                : task.priority === "Medium"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-blue-50 text-blue-700 border-blue-100";

            return (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 hover:bg-base-50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 text-left">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base-100 border border-base-200 text-[#7B1E1E]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    {/* Top Row: Originator Unit */}
                    <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40">
                      {task.originator || "Procurement Unit"}
                    </div>
                    {/* Document Title */}
                    <h3 className="text-sm font-black text-base-content truncate mt-0.5">
                      {task.title}
                    </h3>
                    {/* Badges Row */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="badge badge-xs bg-base-200 border-none text-base-content/70 rounded px-1.5 py-1 text-[10px] font-bold">
                        {task.badge}
                      </span>
                      <span className={`badge badge-xs border ${priorityClass} rounded px-1.5 py-1 text-[10px] font-bold`}>
                        {task.priority || "Medium"} Priority
                      </span>
                      <span className="text-xs text-base-content/60">
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:shrink-0 flex items-center">
                  <Link
                    href={task.link}
                    className="btn btn-xs btn-primary bg-[#7B1E1E] hover:bg-[#601717] text-white border-none font-bold rounded flex items-center gap-1 w-full sm:w-auto"
                  >
                    <span>{task.btnLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <PartyPopper className="h-9 w-9 text-[#A6761D]" />
            <div>
              <p className="text-sm font-bold text-base-content">
                All caught up!
              </p>
              <p className="text-xs text-base-content/60 mt-0.5">
                No pending tasks require your attention today.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
