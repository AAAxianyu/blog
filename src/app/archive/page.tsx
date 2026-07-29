import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '文章时间线',
  description: '按年份浏览所有已发布文章。',
};

export default function ArchivePage() {
  const posts = getAllPosts();
  const groups = Map.groupBy(posts, (post) => post.date.slice(0, 4));

  return (
    <div className="animate-fade-in">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[var(--max-width-content)] px-5 py-14 sm:px-6 sm:py-18">
          <p className="section-kicker mb-2">Timeline</p>
          <h1 className="font-serif text-3xl font-bold text-text sm:text-4xl">文章时间线</h1>
          <p className="mt-3 text-text-secondary">沿时间线回看 {posts.length} 篇记录。</p>
        </div>
      </header>
      <section className="mx-auto max-w-[var(--max-width-content)] px-5 py-12 sm:px-6 sm:py-16">
        {Array.from(groups.entries()).map(([year, yearPosts]) => (
          <div key={year} className="mb-12 grid gap-5 sm:grid-cols-[5rem_1fr]">
            <h2 className="font-mono text-lg font-semibold text-accent">{year}</h2>
            <div className="divide-y divide-border border-y border-border">
              {yearPosts.map((post) => (
                <Link key={post.slug} href={`/posts/${post.slug}`} className="group grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:items-baseline">
                  <time className="text-xs text-text-muted">{formatDate(post.date)}</time>
                  <span className="font-serif text-base font-semibold text-text group-hover:text-secondary">{post.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
