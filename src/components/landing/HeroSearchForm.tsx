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
      className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl sm:rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-lg transition-all duration-200 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-[#800000]/20"
      role="search"
      aria-label="Search products"
    >
      <div className="flex flex-1 items-center gap-3 px-3 py-1">
        <Search className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, supplies, equipment..."
          className="w-full bg-transparent py-2 text-sm font-medium text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          aria-label="Search products"
        />
      </div>
      <button
        type="submit"
        className="flex-shrink-0 rounded-xl sm:rounded-full bg-[#800000] hover:bg-[#5C0000] active:scale-[0.98] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        Search Catalog
      </button>
    </form>
  );
}