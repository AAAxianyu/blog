'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/archive', label: '时间线' },
  { href: '/about', label: '关于' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === '/' && !scrolled && !open;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b ${
      overHero
        ? 'border-transparent bg-transparent text-white'
        : 'border-border/80 bg-bg/90 text-text shadow-[var(--shadow-sm)] backdrop-blur-xl'
    }`}>
      <nav className="mx-auto flex h-[var(--header-height)] max-w-[var(--max-width-page)] items-center justify-between px-5 sm:px-6 lg:px-8" aria-label="主导航">
        <Link href="/" onClick={close} className="font-serif text-lg font-bold">
          x1anyu的小屋
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[5px] px-3 py-1.5 text-sm font-medium ${
                  active
                    ? overHero ? 'bg-white/16 text-white' : 'bg-secondary-soft text-secondary'
                    : overHero ? 'text-white/78 hover:bg-white/10 hover:text-white' : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/search" aria-label="搜索" title="搜索" className="ml-2 grid h-9 w-9 place-items-center rounded-[5px] hover:bg-bg-tertiary">
            <Search size={18} />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-[5px] hover:bg-bg-tertiary"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="h-[calc(100vh-var(--header-height))] border-t border-border bg-bg px-5 py-6 text-text sm:hidden">
          <nav className="mx-auto flex max-w-md flex-col gap-1" aria-label="移动导航">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-[5px] px-3 py-3 text-lg font-medium text-text-secondary hover:bg-bg-secondary hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/search" onClick={close} className="mt-3 flex items-center gap-3 border-t border-border px-3 py-4 text-text-secondary">
              <Search size={19} />
              搜索
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
