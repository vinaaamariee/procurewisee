"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroSearchForm() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/catalog");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-xl items-center gap-2 rounded-xl border p-1.5 shadow-sm transition-shadow focus-within:shadow-md"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
      role="search"
      aria-label="Search products"
    >
      <div className="flex flex-1 items-center gap-2 pl-3">
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, supplies, equipment..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
          style={{ color: "var(--text-primary)" }}
          aria-label="Search products"
        />
      </div>
      <button
        type="submit"
        className="flex-shrink-0 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, #7e191b, #962124)",
        }}
      >
        Search
      </button>
    </form>
  );
}
