import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getAllPosts } from '@/lib/posts';
import PostGrid from '@/components/features/PostGrid';
import SearchBar from '@/components/features/SearchBar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '全部文章',
  description: '浏览 x1anyu 的全部技术文章、随笔与生活记录。',
};

export default function PostsPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <div className="animate-fade-in">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[var(--max-width-page)] px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
          <p className="section-kicker mb-2">All writing</p>
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-text sm:text-4xl">全部文章</h1>
              <p className="mt-3 text-text-secondary">共 {posts.length} 篇，按发布时间倒序排列。</p>
            </div>
            <div className="w-full max-w-sm"><SearchBar placeholder="在全部文章中搜索" /></div>
          </div>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="文章分类">
            {categories.map((category) => (
              <Link key={category.name} href={`/categories/${encodeURIComponent(category.name)}`} className="rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary hover:border-secondary hover:text-secondary">
                {category.name} <span className="ml-1 text-xs text-text-muted">{category.count}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[var(--max-width-page)] px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        {posts.length ? (
          <PostGrid posts={posts} />
        ) : (
          <p className="border-y border-border py-16 text-center text-text-muted">暂无已发布文章。</p>
        )}
      </section>
    </div>
  );
}
