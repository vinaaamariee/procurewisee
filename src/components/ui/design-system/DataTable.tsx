import React from "react";

interface DataTableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  stickyHeader?: boolean;
}

export default function DataTable({
  headers,
  children,
  className = "",
  wrapperClassName = "",
  stickyHeader = true,
}: DataTableProps) {
  return (
    <div className={`overflow-x-auto w-full border border-base-300 rounded-md ${wrapperClassName}`}>
      <table className={`table table-zebra table-sm w-full border-collapse text-left ${className}`}>
        <thead>
          <tr className="border-b border-base-300 bg-base-200 text-base-content/85">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-base-content/85 ${
                  stickyHeader ? "sticky top-0 bg-base-200 z-10" : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-base-200 bg-base-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}
