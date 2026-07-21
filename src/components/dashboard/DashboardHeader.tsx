"use client";

import Link from "next/link";
import {
    Bell,
    Search,
    Settings,
    ChevronRight,
    LayoutDashboard,
} from "lucide-react";

export default function DashboardHeader() {
    return (
        <header
            className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
            {/* Left */}
            <div>
                <div
                    className="mb-2 flex items-center gap-2 text-sm"
                    style={{ color: "var(--text-muted)" }}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    <Link
                        href="/dashboard"
                        className="transition hover:text-[var(--accent)]"
                    >
                        Dashboard
                    </Link>

                    <ChevronRight className="h-4 w-4" />

                    <span>Procurement Officer</span>
                </div>

                <h1
                    className="text-3xl font-black tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                >
                    Procurement Dashboard
                </h1>

                <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--text-muted)" }}
                >
                    Monitor procurement activities, RFQs, suppliers, and purchasing
                    workflows.
                </p>
            </div>

            {/* Right */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: "var(--text-muted)" }}
                    />

                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-11 w-64 rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
                    />
                </div>

                {/* Notifications */}
                <button
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:shadow-md"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <Bell className="h-5 w-5" />
                </button>

                {/* Settings */}
                <button
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:shadow-md"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <Settings className="h-5 w-5" />
                </button>

                {/* Profile */}
                <button
                    className="flex items-center gap-3 rounded-xl border px-3 py-2 transition hover:shadow-md"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: "var(--accent)" }}
                    >
                        PO
                    </div>

                    <div className="hidden text-left lg:block">
                        <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Procurement Officer
                        </p>

                        <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Batanes State College
                        </p>
                    </div>
                </button>
            </div>
        </header>
    );
}