"use client";

import React from "react";

export default function AuthFooter() {
  return (
    <div className="text-center text-[10px] text-base-content/40 font-medium select-none pt-2 border-t border-base-300/40 mt-auto">
      © {new Date().getFullYear()} Batanes State College · Procurement Management Information System
    </div>
  );
}
