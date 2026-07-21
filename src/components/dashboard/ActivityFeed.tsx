import { getRecentActivity, ActivityItem } from "@/app/actions/activity";
import EmptyState from "@/components/ui/EmptyState";
import ActivityTimelineItem from "../activity/ActivityTimelineItem";
import { CircleDot } from "lucide-react";

interface ActivityFeedProps {
  limit?: number;
  compact?: boolean;
}

export default async function ActivityFeed({
  limit = 12,
  compact = false,
}: ActivityFeedProps) {
  const items = await getRecentActivity(limit);

  return (
    <div
      id="activity-feed"
      className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] scroll-mt-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          {/* Live indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>

          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Recent Activity
          </h2>
        </div>

        <span className="rounded-full bg-[var(--bg-dark)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
          Live feed · Last {items.length} events
        </span>
      </div>

      {/* Feed body */}
      <div
        className={compact ? "max-h-[400px] overflow-y-auto" : "max-h-[580px] overflow-y-auto"}
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              preset="audit"
              title="No Activity Yet"
              description="System events will appear here as procurement actions are performed — submitted requests, published RFQs, generated purchase orders, and more."
              compact
            />
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)] py-2">
            {items.map((item, idx) => (
              <ActivityTimelineItem
                key={item.id}
                item={item}
                isLast={idx === items.length - 1}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-[var(--border)] px-5 py-3 text-center">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            Showing the latest {items.length} system events · Auto-refreshes on
            page load
          </span>
        </div>
      )}
    </div>
  );
}
