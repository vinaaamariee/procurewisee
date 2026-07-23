import { getRecentActivity, ActivityItem } from "@/app/actions/activity";
import EmptyState from "@/components/ui/EmptyState";
import ActivityTimelineItem from "../activity/ActivityTimelineItem";

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
      className="scroll-mt-24"
    >

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