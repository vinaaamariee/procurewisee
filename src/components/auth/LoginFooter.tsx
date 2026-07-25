"use client";

import React from 'react';
import styles from '@/app/login/login.module.css';

export default function LoginFooter() {
  const handleSupportClick = () => {
    alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to request support.");
  };

  return (
    <div className={styles.rightPanelFooter}>
      <div className="md:hidden">
        © 2026 Batanes State College
      </div>

      <div className="flex items-center justify-between w-full lg:justify-end gap-5">
        <button
          type="button"
          onClick={handleSupportClick}
          className="hover:text-[var(--text-primary)] transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 text-[10px] font-bold uppercase tracking-widest text-[#7C879A]"
        >
          Contact Admin Support
        </button>

        <button
          type="button"
          className={styles.languagePicker}
          onClick={() => alert("English is currently the default language.")}
        >
          <span>English</span>
          <svg className="w-3 h-3 text-[#7C879A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
