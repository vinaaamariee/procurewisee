import Link from "next/link";
import {
    Bell,
    Newspaper,
    ClipboardCheck,
    CalendarClock,
    ArrowRight,
    Megaphone,
} from "lucide-react";

interface Announcement {
    title: string;
    date: string;
}

interface InfoCenterProps {
    activeRfqs?: number;
    announcements?: Announcement[];
}

export default function InfoCenter({
    activeRfqs = 18,
    announcements = [
        {
            title: "Procurement Planning Deadline",
            date: "Aug 5, 2026",
        },
        {
            title: "Supplier Accreditation Schedule",
            date: "Aug 8, 2026",
        },
        {
            title: "Annual Procurement Conference",
            date: "Aug 15, 2026",
        },
    ],
}: InfoCenterProps) {
    return (
        <aside
            className="overflow-hidden rounded-3xl border"
            style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-card)",
            }}
        >
            {/* Header */}
            <div
                className="border-b px-6 py-5"
                style={{ borderColor: "var(--border)" }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                            background: "var(--accent-glass)",
                            color: "var(--accent)",
                        }}
                    >
                        <Bell className="h-5 w-5" />
                    </div>

                    <div>
                        <h2
                            className="text-base font-bold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Information Center
                        </h2>

                        <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Procurement updates & reminders
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                {/* Active RFQs */}
                <section
                    className="rounded-2xl p-5"
                    style={{
                        background: "var(--accent-glass)",
                        border: "1px solid var(--border-accent)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-xs font-semibold uppercase tracking-wide"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Active RFQs
                            </p>

                            <h3
                                className="mt-2 text-4xl font-black"
                                style={{ color: "var(--accent)" }}
                            >
                                {activeRfqs}
                            </h3>
                        </div>

                        <ClipboardCheck
                            className="h-10 w-10"
                            style={{ color: "var(--accent)" }}
                        />
                    </div>

                    <p
                        className="mt-3 text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Open procurement opportunities currently available for suppliers.
                    </p>
                </section>

                {/* Announcements */}
                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <Megaphone
                            className="h-4 w-4"
                            style={{ color: "var(--accent)" }}
                        />

                        <h3
                            className="text-sm font-bold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Announcements
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {announcements.map((item) => (
                            <article
                                key={item.title}
                                className="rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                                style={{
                                    borderColor: "var(--border)",
                                }}
                            >
                                <div className="flex gap-3">
                                    <div
                                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                        style={{
                                            background: "var(--accent-glass)",
                                            color: "var(--accent)",
                                        }}
                                    >
                                        <Newspaper className="h-4 w-4" />
                                    </div>

                                    <div className="flex-1">
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            {item.title}
                                        </p>

                                        <div
                                            className="mt-2 flex items-center gap-2 text-xs"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            {item.date}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Footer Action */}
                <Link
                    href="/dashboard/officer/rfq"
                    className="flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white transition hover:opacity-90"
                    style={{
                        background: "var(--accent)",
                    }}
                >
                    View Procurement Workspace
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </aside>
    );
}