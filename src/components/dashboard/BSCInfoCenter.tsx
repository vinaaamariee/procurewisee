import Link from "next/link";
import {
    Bell,
    Newspaper,
    ClipboardCheck,
    CalendarClock,
    ArrowRight,
} from "lucide-react";

export default function BSCInfoCenter() {
    const announcements = [
        {
            title: "Procurement Planning Deadline",
            date: "Aug. 5, 2026",
        },
        {
            title: "Supplier Accreditation Schedule",
            date: "Aug. 8, 2026",
        },
        {
            title: "Annual Procurement Conference",
            date: "Aug. 15, 2026",
        },
    ];

    return (
        <section
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
                            BSC Information Center
                        </h2>

                        <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Stay updated with procurement activities
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                {/* Active RFQs */}
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <ClipboardCheck
                            className="h-4 w-4"
                            style={{ color: "var(--accent)" }}
                        />
                        <h3
                            className="text-sm font-bold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Active RFQs
                        </h3>
                    </div>

                    <div
                        className="rounded-2xl border p-4"
                        style={{
                            borderColor: "var(--border)",
                            background: "var(--bg-deep)",
                        }}
                    >
                        <p
                            className="text-3xl font-black"
                            style={{ color: "var(--accent)" }}
                        >
                            18
                        </p>

                        <p
                            className="mt-1 text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Currently published solicitations awaiting supplier quotations.
                        </p>
                    </div>
                </div>

                {/* Announcements */}
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <Newspaper
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
                            <div
                                key={item.title}
                                className="rounded-xl border p-3 transition hover:shadow-sm"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--surface)",
                                }}
                            >
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
                        ))}
                    </div>
                </div>

                {/* Footer Button */}
                <Link
                    href="/dashboard/officer/rfq"
                    className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "var(--accent)" }}
                >
                    View Procurement Workspace
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </section>
    );
}