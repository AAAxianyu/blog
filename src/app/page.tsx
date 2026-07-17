import Link from 'next/link';
import { getAllPosts, getAllCategories } from '@/lib/posts';
import PostGrid from '@/components/features/PostGrid';
import SearchBar from '@/components/features/SearchBar';

export default function HomePage() {
  const allPosts = getAllPosts();
  const featured = allPosts.slice(0, 4);
  const rest = allPosts.slice(4);
  const categories = getAllCategories();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-soft/60 via-bg-secondary/30 to-bg pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-soft/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative mx-auto max-w-[var(--max-width-page)] px-5 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="max-w-xl">
            <p className="text-sm font-medium tracking-[0.1em] uppercase text-accent mb-4 font-mono">
              欢迎光临
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] text-text mb-6 tracking-tight">
              x1anyu的<span className="text-accent">小屋</span>
            </h1>
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
              一间温暖的小屋，记录技术探索的足迹，分享生活中的灵感与思考。
            </p>
            <div className="max-w-sm">
              <SearchBar placeholder="搜索文章..." />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-[var(--max-width-page)] px-5 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] uppercase text-accent mb-2 font-mono">最新发布</p>
              <h2 className="font-serif text-2xl font-bold text-text tracking-tight">近期文章</h2>
            </div>
            {allPosts.length > 4 && (
              <Link href="/posts" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors shrink-0">
                查看全部 &rarr;
              </Link>
            )}
          </div>
          <PostGrid posts={featured} featured />
          {rest.length > 0 && (
            <div className="mt-5 sm:mt-6">
              <PostGrid posts={rest} />
            </div>
          )}
        </section>
      )}

      {/* Empty state */}
      {allPosts.length === 0 && (
        <section className="mx-auto max-w-[var(--max-width-page)] px-5 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-5xl mb-4">📝</p>
          <h3 className="font-serif text-2xl font-bold text-text mb-3">还没有文章</h3>
          <p className="text-text-secondary">在 <code className="text-xs bg-accent-soft px-1.5 py-0.5 rounded font-mono text-accent">content/posts/</code> 中创建 Markdown 文件开始写作吧。</p>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-[var(--max-width-page)] px-5 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/60">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-accent mb-2 font-mono">探索</p>
          <h2 className="font-serif text-2xl font-bold text-text tracking-tight mb-8">文章分类</h2>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/categories/${cat.name}`}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-surface border border-border-light shadow-[var(--shadow-sm)]
                  hover:shadow-[var(--shadow-md)] hover:border-accent/20 hover:-translate-y-0.5
                  transition-all duration-300">
                <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">{cat.name}</span>
                <span className="text-[0.65rem] text-text-muted bg-bg-secondary px-1.5 py-0.5 rounded font-mono">{cat.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
