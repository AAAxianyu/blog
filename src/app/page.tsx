import Link from 'next/link';
import { ArrowRight, BookOpen, PenLine } from 'lucide-react';
import { getAllCategories, getAllPosts, getAllTags } from '@/lib/posts';
import PostGrid from '@/components/features/PostGrid';
import SearchBar from '@/components/features/SearchBar';

export default function HomePage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div>
      <section className="home-hero -mt-[var(--header-height)] pt-[var(--header-height)] text-white">
        <div className="mx-auto w-full max-w-[var(--max-width-page)] px-5 pb-12 pt-24 sm:px-6 sm:pb-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold text-white/72">
              <PenLine size={15} />
              个人技术与生活记录
            </p>
            <h1 className="font-serif text-4xl font-bold leading-[1.16] sm:text-5xl lg:text-6xl">
              x1anyu的小屋
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
              写下技术实践，也收藏那些让生活变得具体的片刻。
            </p>
            <div className="hero-search mt-8 max-w-md">
              <SearchBar placeholder="搜索文章、主题或关键词" />
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/68">
              <span>{posts.length} 篇文章</span>
              <span>{categories.length} 个分类</span>
              <Link href="/feed.xml" className="hover:text-white">RSS 订阅</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg py-14 sm:py-18">
        <div className="mx-auto max-w-[var(--max-width-page)] px-5 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="section-kicker mb-2">Latest writing</p>
              <h2 className="font-serif text-2xl font-bold text-text sm:text-3xl">最近写下的</h2>
            </div>
            <Link href="/posts" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-secondary hover:text-text">
              全部文章 <ArrowRight size={16} />
            </Link>
          </div>

          {posts.length ? (
            <PostGrid posts={posts.slice(0, 4)} featured />
          ) : (
            <div className="border-y border-border py-16 text-center">
              <BookOpen className="mx-auto text-text-muted" />
              <p className="mt-3 text-text-secondary">第一篇文章正在路上。</p>
            </div>
          )}
        </div>
      </section>

      {(categories.length > 0 || tags.length > 0) && (
        <section className="border-t border-border bg-surface py-14 sm:py-18">
          <div className="mx-auto grid max-w-[var(--max-width-page)] gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="section-kicker mb-2">Browse topics</p>
              <h2 className="font-serif text-2xl font-bold text-text">按主题探索</h2>
              <div className="mt-6 divide-y divide-border border-y border-border">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/categories/${encodeURIComponent(category.name)}`}
                    className="flex items-center justify-between py-3.5 text-sm text-text-secondary hover:text-secondary"
                  >
                    <span>{category.name}</span>
                    <span className="font-mono text-xs text-text-muted">{category.count}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="section-kicker mb-2">Index</p>
              <h2 className="font-serif text-2xl font-bold text-text">常用标签</h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.slice(0, 16).map((tag) => (
                  <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`} className="rounded-full bg-secondary-soft px-3 py-1.5 text-sm text-secondary hover:bg-bg-tertiary">
                    #{tag.name} <span className="ml-1 text-xs opacity-65">{tag.count}</span>
                  </Link>
                ))}
              </div>
              <Link href="/archive" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-text">
                浏览时间归档 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
