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
      className="mx-auto lg:mx-0 flex w-full max-w-xl items-center gap-2 rounded-2xl border p-1.5 shadow-sm transition-all duration-200 focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#7e191b]/10 dark:focus-within:ring-[#962124]/20"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
      role="search"
      aria-label="Search products"
    >
      <div className="flex flex-1 items-center gap-3 pl-3">
        <Search 
          className="h-4 w-4 flex-shrink-0 transition-colors" 
          style={{ color: "var(--text-muted)" }} 
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, supplies, equipment..."
          className="w-full bg-transparent py-2.5 text-sm font-medium outline-none transition-colors placeholder:text-[var(--text-muted)]"
          style={{ color: "var(--text-primary)" }}
          aria-label="Search products"
        />
      </div>
      <button
        type="submit"
        className="flex-shrink-0 rounded-xl px-6 py-2.5 text-sm font-extrabold text-white shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98] hover:opacity-95 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #7e191b, #962124)",
        }}
      >
        Search
      </button>
    </form>
  );
}