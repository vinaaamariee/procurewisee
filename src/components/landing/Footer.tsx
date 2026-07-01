import Link from "next/link";

const usefulLinks = [
  { label: "Procurement Catalog", href: "/catalog" },
  { label: "Track Request", href: "/track" },
  { label: "Submit Purchase Request", href: "/end-user" },
  { label: "Login Portal", href: "/login" },
];

const systemLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Price Comparison", href: "/price-comparison" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{
        background: "var(--bg-deep)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── College Information ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#ca8a04]/40 bg-white font-black text-sm shadow-md dark:bg-[#1e293b]">
                <span className="text-[#7e191b]">P</span>
                <span className="text-[#ca8a04]">W</span>
              </div>
              <div>
                <div
                  className="text-base font-extrabold"
                  style={{ color: "var(--text-primary)" }}
                >
                  ProcureWise
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Batanes State College
                </div>
              </div>
            </div>
            <p
              className="mt-4 max-w-md text-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              An Intelligent Procurement Analytics and Automated Canvassing
              System with Best-Value Recommendation Engine. Modernizing
              government procurement for transparency and efficiency.
            </p>
          </div>

          {/* ── Useful Links ── */}
          <div>
            <h3
              className="mb-3 text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── System ── */}
          <div>
            <h3
              className="mb-3 text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              System
            </h3>
            <ul className="space-y-2">
              {systemLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  v0.1.0
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div
          className="mt-10 border-t pt-6 text-center text-xs"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          © {currentYear} ProcureWise — Batanes State College. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
