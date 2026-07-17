'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchPosts, PostSummary } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export default function SearchBar({ placeholder = '搜索文章...' }: { placeholder?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Client-side search
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.trim().length > 0) {
        // Fetch search results from a lightweight JSON endpoint
        fetch(`/api/search?q=${encodeURIComponent(value)}`)
          .then((res) => res.json())
          .then((data) => {
            setResults(data.posts || []);
            setIsOpen(true);
          })
          .catch(() => {
            // Fallback: we could do client-side filtering if we had all posts loaded
            setResults([]);
          });
      } else {
        setResults([]);
        setIsOpen(false);
      }
    },
    []
  );

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
            bg-bg-secondary border border-border
            text-text placeholder:text-text-tertiary
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
            transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-card-bg border border-border rounded-xl shadow-lg overflow-hidden z-40">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.slice(0, 8).map((post) => (
                <li key={post.slug}>
                  <a
                    href={`/posts/${post.slug}`}
                    className="block px-4 py-2.5 hover:bg-bg-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="text-sm font-medium text-text truncate">{post.title}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-text-tertiary">
                      <span>{formatDate(post.date)}</span>
                      <span>&middot;</span>
                      <span>{post.category}</span>
                    </div>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="block px-4 py-2.5 text-sm text-accent hover:bg-bg-secondary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  查看全部结果 &rarr;
                </a>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-text-tertiary">
              未找到关于 &quot;{query}&quot; 的文章
            </div>
          )}
        </div>
      )}
    </div>
  );
}
