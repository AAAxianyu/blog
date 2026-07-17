import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-bg-secondary/30">
      <div className="mx-auto max-w-[var(--max-width-page)] px-5 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="font-serif text-lg font-bold text-text hover:text-accent transition-colors">
              x1anyu的小屋
            </Link>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-xs">
              记录技术、设计与生活的个人博客。
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-[0.1em] uppercase text-text-muted mb-3">导航</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-text-secondary hover:text-accent transition-colors">首页</Link>
              <Link href="/posts" className="text-sm text-text-secondary hover:text-accent transition-colors">文章</Link>
              <Link href="/about" className="text-sm text-text-secondary hover:text-accent transition-colors">关于</Link>
              <Link href="/search" className="text-sm text-text-secondary hover:text-accent transition-colors">搜索</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-[0.1em] uppercase text-text-muted mb-3">订阅</h4>
            <Link href="/feed.xml" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" /></svg>
              RSS 订阅
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/60 text-center">
          <p className="text-xs text-text-muted">&copy; {year} x1anyu的小屋 · 用心书写每一篇文章</p>
        </div>
      </div>
    </footer>
  );
}
