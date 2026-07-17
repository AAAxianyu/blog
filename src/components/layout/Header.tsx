'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/about', label: '关于' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    h();
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 ${
      scrolled ? 'bg-bg/80 backdrop-blur-xl border-b border-border/60 shadow-[0_1px_3px_rgba(45,31,15,0.03)]' : ''
    }`}>
      <nav className="mx-auto max-w-[var(--max-width-page)] flex items-center justify-between h-14 px-5 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-lg font-bold tracking-tight text-text hover:text-accent transition-colors shrink-0">
          x1anyu的小屋
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-0.5">
          {navLinks.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active ? 'text-accent bg-accent-soft' : 'text-text-secondary hover:text-text hover:bg-bg-tertiary'
                }`}
              >{l.label}</Link>
            );
          })}
          <span className="ml-1.5 pl-1.5 border-l border-border">
            <ThemeToggle />
          </span>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} aria-label="菜单"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-bg-tertiary transition-colors cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" /> : <><path d="M2.5 4.5h13"/><path d="M2.5 9h13"/><path d="M2.5 13.5h13"/></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 top-14 bg-bg z-40 sm:hidden transition-all duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <nav className="flex flex-col p-6 gap-1">
          {navLinks.map((l, i) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                className={`py-3 px-4 text-lg font-medium rounded-lg transition-all duration-200 ${
                  active ? 'text-accent bg-accent-soft' : 'text-text-secondary hover:text-text hover:bg-bg-tertiary'
                }`}
                style={{ transitionDelay: open ? `${i * 50}ms` : '0ms', transform: open ? 'translateY(0)' : 'translateY(8px)', opacity: open ? 1 : 0 }}>
                {l.label}
              </Link>
            );
          })}
          <Link href="/search"
            className="py-3 px-4 text-lg font-medium rounded-lg transition-all duration-200 text-text-secondary hover:text-text hover:bg-bg-tertiary flex items-center gap-2.5"
            style={{ transitionDelay: open ? `${navLinks.length * 50}ms` : '0ms', transform: open ? 'translateY(0)' : 'translateY(8px)', opacity: open ? 1 : 0 }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            搜索
          </Link>
        </nav>
      </div>
    </header>
  );
}
