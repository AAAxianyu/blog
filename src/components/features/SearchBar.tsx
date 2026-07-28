'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type { PostSummary } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export default function SearchBar({
  placeholder = '搜索文章...',
  defaultValue = '',
}: {
  placeholder?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<PostSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json() as { posts?: PostSummary[] };
        setResults(data.posts || []);
        setOpen(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={submit} role="search" className="relative">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!event.target.value.trim()) clear();
          }}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 w-full rounded-[6px] border border-border bg-surface pl-10 pr-10 text-sm text-text outline-none placeholder:text-text-tertiary focus:border-secondary focus:ring-2 focus:ring-secondary/15"
        />
        {query && (
          <button type="button" onClick={clear} aria-label="清空搜索" title="清空" className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[4px] text-text-tertiary hover:bg-bg-secondary hover:text-text">
            <X size={15} />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute top-full z-40 mt-2 w-full overflow-hidden rounded-[6px] border border-border bg-surface shadow-[var(--shadow-lg)]">
          {loading ? (
            <p className="px-4 py-5 text-center text-sm text-text-muted">搜索中…</p>
          ) : results.length ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.slice(0, 6).map((post) => (
                <li key={post.slug}>
                  <Link href={`/posts/${post.slug}`} onClick={() => setOpen(false)} className="block px-4 py-2.5 hover:bg-bg-secondary">
                    <span className="block truncate text-sm font-medium text-text">{post.title}</span>
                    <span className="mt-0.5 block text-xs text-text-muted">{formatDate(post.date)} · {post.category}</span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-border">
                <Link href={`/search?q=${encodeURIComponent(query.trim())}`} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-secondary hover:bg-bg-secondary">
                  查看全部结果
                </Link>
              </li>
            </ul>
          ) : (
            <p className="px-4 py-5 text-center text-sm text-text-muted">没有找到相关文章</p>
          )}
        </div>
      )}
    </div>
  );
}
