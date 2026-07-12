'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { globalSearchAction, GroupedSearchResults, SearchResultItem } from '@/app/actions/search';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GroupedSearchResults | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Listen for Ctrl/Cmd + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 3. Handle debounced search query
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await globalSearchAction(query);
        if (res.success && res.results) {
          setResults(res.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // 4. Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const hasResults = results && Object.values(results).some(arr => arr.length > 0);

  return (
    <>
      {/* Trigger Button in Navigation Header */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.8rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: '0.78rem',
          fontWeight: 600,
          outline: 'none',
          transition: 'all 0.15s ease',
        }}
        className="hover:border-amber-500/50 hover:bg-gray-50 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-amber-500 md:w-48 justify-between"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Search size={14} />
          <span className="hidden md:inline">Search...</span>
        </div>
        <kbd style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          background: 'rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.1)',
          padding: '1px 5px',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          Ctrl K
        </kbd>
      </button>

      {/* Spotlight Search Overlay Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '10vh',
        }}>
          <div
            ref={modalRef}
            style={{
              width: '90%',
              maxWidth: '600px',
              height: 'fit-content',
              maxHeight: '75vh',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '1.25rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Input Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products, requests, purchase orders, RFQs, suppliers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              />
              {loading && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />}
            </div>

            {/* Results body */}
            <div style={{
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Empty state */}
              {query.trim().length < 2 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Type at least 2 characters to start searching the registry.
                </div>
              )}

              {/* No results state */}
              {query.trim().length >= 2 && !loading && !hasResults && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No registry logs match "{query}".
                </div>
              )}

              {/* Grouped results list */}
              {hasResults && (
                <>
                  <GroupSection title="📋 Catalog Products" items={results?.products} icon="📦" onSelect={() => setIsOpen(false)} />
                  <GroupSection title="📝 Purchase Requests" items={results?.purchaseRequests} icon="📄" onSelect={() => setIsOpen(false)} />
                  <GroupSection title="📅 Annual PPMPs" items={results?.ppmps} icon="📁" onSelect={() => setIsOpen(false)} />
                  <GroupSection title="🚚 Purchase Orders" items={results?.purchaseOrders} icon="🚛" onSelect={() => setIsOpen(false)} />
                  <GroupSection title="📢 Requests for Quotation (RFQs)" items={results?.rfqs} icon="🔔" onSelect={() => setIsOpen(false)} />
                  <GroupSection title="🏢 Registered Suppliers" items={results?.suppliers} icon="🛡️" onSelect={() => setIsOpen(false)} />
                  <GroupSection title="🏛️ Department Budgets" items={results?.departments} icon="🏛️" onSelect={() => setIsOpen(false)} />
                </>
              )}
            </div>

            {/* Footer tips */}
            <div style={{
              padding: '0.6rem 1.25rem',
              background: 'rgba(0,0,0,0.02)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>
              <span>Search shortcut: <kbd style={{ background: 'rgba(0,0,0,0.05)', padding: '1px 4px', borderRadius: '3px' }}>Ctrl + K</kbd></span>
              <span>Press <kbd style={{ background: 'rgba(0,0,0,0.05)', padding: '1px 4px', borderRadius: '3px' }}>Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface GroupSectionProps {
  title: string;
  items?: SearchResultItem[];
  icon: string;
  onSelect: () => void;
}

function GroupSection({ title, items, icon, onSelect }: GroupSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        letterSpacing: '0.5px',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        paddingBottom: '0.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}>
        <span>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link}
            onClick={onSelect}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background 0.15s ease',
              outline: 'none',
            }}
            className="hover:bg-red-500/5 group focus-visible:bg-red-500/5"
          >
            <span style={{ fontSize: '1rem' }}>{icon}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flexGrow: 1 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }} className="group-hover:text-[var(--accent)]">
                {item.title}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                {item.subtitle}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0 }} className="group-hover:opacity-100">
              →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
