import Link from 'next/link';
import { Code2, Rss } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[var(--max-width-page)] flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="font-serif text-base font-bold text-text">x1anyu的小屋</Link>
          <p className="mt-1 text-xs text-text-muted">记录技术、设计与生活。© {new Date().getFullYear()} x1anyu</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://github.com/AAAxianyu/blog" target="_blank" rel="noreferrer" className="admin-icon" aria-label="GitHub" title="GitHub">
            <Code2 size={17} />
          </a>
          <Link href="/feed.xml" className="admin-icon" aria-label="RSS 订阅" title="RSS 订阅">
            <Rss size={17} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
