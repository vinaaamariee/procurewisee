/**
 * Centralized Maroon/Gold/Neutral status system.
 *
 * The application must not use rainbow status colors (green/blue/orange/red/
 * purple). All status badges derive from this single source so every workflow
 * surface shares one coherent visual language:
 *
 *   Draft            -> neutral gray
 *   Submitted/Pending/Review -> gold fill
 *   In Procurement milestones -> gold outline
 *   Approved/Verified -> maroon outline
 *   Returned          -> light maroon tint
 *   Completed/Received -> dark maroon fill
 *   Rejected          -> deep maroon fill
 *
 * Statuses remain distinguishable without relying on color alone: each badge
 * carries its own text label, and callers may pair icons per status.
 */

export type StatusTone = {
  className: string;
  /** Suggested lucide icon name for extra non-color distinction. */
  icon?: "check" | "x" | "clock" | "undo" | "lock" | "package";
};

const TONES = {
  gray: "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  goldFill:
    "bg-[var(--secondary-dim)] text-[var(--secondary-strong)] border border-[rgba(212,175,55,0.4)]",
  goldOutline:
    "bg-transparent text-[var(--secondary-strong)] border border-[var(--gold-hover)]",
  maroonOutline:
    "bg-transparent text-[var(--accent)] border border-[var(--accent)]",
  maroonTint:
    "bg-[var(--accent-glass)] text-[var(--accent)] border border-[rgba(128,0,0,0.3)]",
  deepMaroon:
    "bg-[var(--maroon-hover)] text-white border border-[var(--maroon-deep)]",
  rejected:
    "bg-[var(--maroon-deep)] text-white border border-[var(--maroon)]",
} satisfies Record<string, string>;

const RULES: Array<{ match: RegExp; tone: StatusTone }> = [
  { match: /^(draft|open|cancelled|canceled|closed|expired|archived)$/i, tone: { className: TONES.gray } },
  {
    match: /^(submitted|pending|under[- ]?review|for[- ]?review|for[- ]?approval|queued|scheduled|sent|partially ?responded)$/i,
    tone: { className: TONES.goldFill },
  },
  {
    match: /^(in[- ]?procurement|canvassing|rfq|aoq|evaluation|awarding|in[- ]?production|processing|partially ?delivered)$/i,
    tone: { className: TONES.goldOutline },
  },
  {
    match: /^(approved|verified|accepted|validated|authorized|fully ?responded)/i,
    tone: { className: TONES.maroonOutline, icon: "check" },
  },
  {
    match: /^(returned.*|revision|required? revision|returned)$/i,
    tone: { className: TONES.maroonTint, icon: "undo" },
  },
  {
    match: /^(completed|received|delivered|finished|issued|finalized)/i,
    tone: { className: TONES.deepMaroon, icon: "package" },
  },
  {
    match: /^(rejected|declined|disapproved|failed)/i,
    tone: { className: TONES.rejected, icon: "x" },
  },
];

/** Fallback for unknown statuses is the neutral gray badge. */
export function statusTone(status: string): StatusTone {
  const s = (status || "").trim();
  for (const rule of RULES) if (rule.match.test(s)) return rule.tone;
  return { className: TONES.gray };
}

/** Convenience: class-only lookup for inline badge maps. */
export function statusBadgeClass(status: string): string {
  return statusTone(status).className;
}
