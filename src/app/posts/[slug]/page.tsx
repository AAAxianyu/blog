import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostBySlug, getAdjacentPosts, getAllPosts } from '@/lib/posts';
import { markdownToHtml } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import TagBadge from '@/components/ui/TagBadge';
import Sidebar from '@/components/layout/Sidebar';
import Comments from '@/components/features/Comments';

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: '文章未找到' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title, description: post.excerpt, type: 'article',
      publishedTime: post.date, modifiedTime: post.updated, authors: [post.author], tags: post.tags,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await markdownToHtml(post.content);
  const { prev, next } = getAdjacentPosts(slug);

  return (
    <article className="animate-fade-in">
      {/* Header */}
      <header className="border-b border-border/60 bg-bg-secondary/30">
        <div className="mx-auto max-w-[var(--max-width-content)] px-5 sm:px-6 py-14 sm:py-18">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-muted mb-5 font-mono">
            <Link href="/" className="hover:text-text-secondary transition-colors">首页</Link>
            <span className="opacity-40">/</span>
            <Link href="/posts" className="hover:text-text-secondary transition-colors">文章</Link>
            <span className="opacity-40">/</span>
            <span className="text-text-tertiary truncate">{post.title}</span>
          </nav>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-muted font-mono mb-4">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="opacity-30">·</span>
            <span>{post.readingTime} 分钟阅读</span>
            <span className="opacity-30">·</span>
            <span>{post.wordCount.toLocaleString()} 字</span>
            {post.updated && <>
              <span className="opacity-30">·</span>
              <span className="text-accent/80">更新于 {formatDate(post.updated)}</span>
            </>}
          </div>

          <Link href={`/categories/${post.category}`}
            className="inline-block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-accent mb-3 hover:underline underline-offset-2">
            {post.category}
          </Link>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-text leading-[1.15] tracking-tight mb-3">
            {post.title}
          </h1>

          <p className="text-sm text-text-secondary">作者：{post.author}</p>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-[var(--max-width-page)] px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex gap-10 lg:gap-16 justify-center">
          {/* Main */}
          <div className="flex-1 min-w-0 max-w-[var(--max-width-content)]">
            {post.cover && (
              <img src={post.cover} alt={post.title} className="w-full rounded-xl mb-10 shadow-[var(--shadow-md)]" />
            )}

            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border/60">
                <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-text-muted mb-3">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => <TagBadge key={tag} tag={tag} size="lg" />)}
                </div>
              </div>
            )}

            {/* Prev/Next */}
            <nav className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="相邻文章">
              {prev && (
                <Link href={`/posts/${prev.slug}`}
                  className="group p-5 rounded-xl border border-border/60 hover:border-accent/20 hover:bg-surface transition-all duration-200">
                  <span className="text-xs text-text-muted mb-1.5 block">&larr; 上一篇</span>
                  <span className="text-sm font-medium text-text group-hover:text-accent transition-colors line-clamp-1">{prev.title}</span>
                </Link>
              )}
              {next && (
                <Link href={`/posts/${next.slug}`}
                  className="group p-5 rounded-xl border border-border/60 hover:border-accent/20 hover:bg-surface transition-all duration-200 text-right sm:col-start-2">
                  <span className="text-xs text-text-muted mb-1.5 block">下一篇 &rarr;</span>
                  <span className="text-sm font-medium text-text group-hover:text-accent transition-colors line-clamp-1">{next.title}</span>
                </Link>
              )}
            </nav>

            <Comments />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
