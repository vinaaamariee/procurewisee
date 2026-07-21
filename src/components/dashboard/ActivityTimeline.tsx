import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Clock3 } from "lucide-react";

interface ActivityTimelineProps {
    limit?: number;
}

export default function ActivityTimeline({
    limit = 10,
}: ActivityTimelineProps) {
    return (
        <section
            className="overflow-hidden rounded-3xl border font-sans"
            style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-card)",
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between border-b px-6 py-5"
                style={{ borderColor: "var(--border)" }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                        style={{
                            background: "var(--accent-glass)",
                            color: "var(--accent)",
                        }}
                    >
                        <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                        <h2
                            className="text-base font-extrabold font-sans"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Recent Activity
                        </h2>

                        <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Latest procurement transactions
                        </p>
                    </div>
                </div>
            </div>

            {/* Existing Activity Feed */}
            <div className="p-4 font-sans">
                <ActivityFeed limit={limit} />
            </div>
        </section>
    );
}