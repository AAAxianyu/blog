import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAdjacentPosts, getPostBySlug } from '@/lib/posts';
import { markdownToHtml } from '@/lib/markdown';
import { decodeRouteSegment, formatDate } from '@/lib/utils';
import TagBadge from '@/components/ui/TagBadge';
import Sidebar from '@/components/layout/Sidebar';
import ArticleActions from '@/components/features/ArticleActions';

interface Props { params: Promise<{ slug: string }>; }

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(decodeRouteSegment((await params).slug));
  if (!post) return { title: '文章未找到' };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author],
      tags: post.tags,
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      ...(post.cover ? { images: [post.cover] } : {}),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const slug = decodeRouteSegment((await params).slug);
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await markdownToHtml(post.content);
  const { prev, next } = getAdjacentPosts(slug);
  const siteUrl = process.env.SITE_URL || 'https://x1anyu.top';
  const canonicalUrl = `${siteUrl}/posts/${encodeURIComponent(post.slug)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { '@type': 'Person', name: post.author },
    mainEntityOfPage: canonicalUrl,
    ...(post.cover ? { image: new URL(post.cover, siteUrl).toString() } : {}),
  };

  return (
    <article className="animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[var(--max-width-content)] px-5 py-12 sm:px-6 sm:py-16">
          <nav className="mb-7 flex min-w-0 items-center gap-2 text-xs text-text-muted" aria-label="面包屑">
            <Link href="/" className="hover:text-secondary">首页</Link>
            <span>/</span>
            <Link href="/posts" className="hover:text-secondary">文章</Link>
            <span>/</span>
            <span className="truncate">{post.title}</span>
          </nav>
          <Link href={`/categories/${encodeURIComponent(post.category)}`} className="section-kicker hover:text-secondary">
            {post.category}
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-[1.25] text-text sm:text-4xl lg:text-[2.7rem]">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-text-secondary">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
            <span>{post.author}</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>{post.readingTime} 分钟阅读</span>
            <span>{post.wordCount.toLocaleString('zh-CN')} 字</span>
            {post.updated && <span>更新于 {formatDate(post.updated)}</span>}
          </div>
        </div>
      </header>

      {post.cover && (
        <div className="mx-auto mt-10 max-w-[60rem] px-5 sm:px-6">
          <div
            role="img"
            aria-label={post.title}
            className="aspect-[16/8] rounded-[6px] bg-bg-tertiary bg-cover bg-center shadow-[var(--shadow-md)]"
            style={{ backgroundImage: `url("${post.cover.replace(/"/g, '%22')}")` }}
          />
        </div>
      )}

      <div className="mx-auto max-w-[var(--max-width-page)] px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex justify-center gap-12 lg:gap-16">
          <div className="min-w-0 max-w-[var(--max-width-content)] flex-1">
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((tag) => <TagBadge key={tag} tag={tag} size="lg" />)}
              </div>
            )}

            <ArticleActions title={post.title} url={canonicalUrl} />

            <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="相邻文章">
              {prev && (
                <Link href={`/posts/${prev.slug}`} className="group border-l-2 border-border py-2 pl-4 hover:border-secondary">
                  <span className="flex items-center gap-1 text-xs text-text-muted"><ArrowLeft size={13} /> 上一篇</span>
                  <span className="mt-1 block font-serif text-sm font-semibold text-text group-hover:text-secondary">{prev.title}</span>
                </Link>
              )}
              {next && (
                <Link href={`/posts/${next.slug}`} className="group border-r-2 border-border py-2 pr-4 text-right hover:border-secondary sm:col-start-2">
                  <span className="flex items-center justify-end gap-1 text-xs text-text-muted">下一篇 <ArrowRight size={13} /></span>
                  <span className="mt-1 block font-serif text-sm font-semibold text-text group-hover:text-secondary">{next.title}</span>
                </Link>
              )}
            </nav>
          </div>
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-24"><Sidebar /></div>
          </aside>
        </div>
      </div>
    </article>
  );
}
