"use client";

import React from 'react';
import styles from '@/app/login/login.module.css';

export default function LoginHero() {
  return (
    <div className={styles.leftPanel}>
      {/* Subtle Watermark */}
      <div className={styles.leftPanelWatermark} aria-hidden="true">
        PW
      </div>

      <div className={styles.leftPanelContent}>
        {/* Logo Container */}
        <div className={styles.logoContainer}>
          <div className={styles.logoBadge}>
            <span className={styles.logoP}>P</span>
            <span className={styles.logoW}>W</span>
          </div>
          <div>
            <div className={styles.logoTitle}>ProcureWise</div>
            <div className={styles.logoSubtitle}>Procurement Management System</div>
            <div className={styles.logoCollege}>Batanes State College</div>
          </div>
        </div>

        {/* Tagline */}
        <p className={styles.tagline}>
          ProcureWise supports procurement planning, bidding, supplier evaluation, and purchase order management for the College&rsquo;s Bids and Awards Committee and end-user offices.
        </p>
      </div>

      {/* Left Panel Footer */}
      <div className={styles.leftPanelFooter}>
        © 2026 Batanes State College
      </div>
    </div>
  );
}
