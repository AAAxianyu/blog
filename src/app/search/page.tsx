import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { searchPosts } from '@/lib/posts';
import PostGrid from '@/components/features/PostGrid';
import SearchBar from '@/components/features/SearchBar';

export const metadata: Metadata = {
  title: '搜索',
  description: '全文搜索博客文章。',
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() || '';
  const results = query ? searchPosts(query) : [];

  return (
    <div className="animate-fade-in">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[var(--max-width-content)] px-5 py-14 sm:px-6 sm:py-18">
          <p className="section-kicker mb-2">Full-text search</p>
          <h1 className="font-serif text-3xl font-bold text-text sm:text-4xl">搜索文章</h1>
          <div className="mt-7"><SearchBar placeholder="标题、正文、标签或分类" defaultValue={query} /></div>
        </div>
      </header>
      <section className="mx-auto max-w-[var(--max-width-page)] px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        {query ? (
          <>
            <p className="mb-8 text-sm text-text-secondary">
              “{query}” 找到 {results.length} 篇文章
            </p>
            {results.length ? (
              <PostGrid posts={results} />
            ) : (
              <div className="border-y border-border py-16 text-center text-text-muted">
                <Search className="mx-auto mb-3" size={24} />
                换一个关键词再试试。
              </div>
            )}
          </>
        ) : (
          <p className="border-y border-border py-16 text-center text-text-muted">输入关键词开始搜索。</p>
        )}
      </section>
    </div>
  );
}
