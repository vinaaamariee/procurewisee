"use client";

import { useState } from "react";

interface DepartmentSelectFormProps {
  departments: string[];
}

export default function DepartmentSelectForm({ departments }: DepartmentSelectFormProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [department, setDepartment] = useState("");

  return (
    <form method="GET" action="/end-user/ppmp" className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            {isCustom ? "Enter Custom Department / Office" : "Select Unit / Department"}
          </label>
          <button
            type="button"
            onClick={() => {
              setIsCustom(!isCustom);
              setDepartment("");
            }}
            className="text-[11px] font-bold text-[#7e191b] hover:text-[#962124] hover:underline transition bg-transparent border-none cursor-pointer"
          >
            {isCustom ? "Choose from list" : "Enter custom"}
          </button>
        </div>

        {isCustom ? (
          <input
            type="text"
            name="department"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="E.g., IT Research Division"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-[#ca8a04] bg-[#FAF9F6] transition font-medium"
          />
        ) : (
          <select
            name="department"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-[#ca8a04] bg-[#FAF9F6] transition cursor-pointer font-medium"
          >
            <option value="" disabled>
              -- Choose Department --
            </option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs leading-relaxed text-[#ca8a04]">
        <strong>BSC Planning Policy:</strong> PPMP plans are validated against annual departmental budget allocations. No login is required to prepare and save these plans, but all submissions are subject to budget audits.
      </div>

      <button
        type="submit"
        className="w-full bg-[#7e191b] hover:bg-[#962124] text-white py-3 rounded-lg font-bold text-sm transition uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        Start Planning →
      </button>
    </form>
  );
}
