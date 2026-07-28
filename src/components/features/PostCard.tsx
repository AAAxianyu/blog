import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import TagBadge from '@/components/ui/TagBadge';
import type { PostSummary } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

interface Props {
  post: PostSummary;
  variant?: 'default' | 'featured' | 'compact';
}

export default function PostCard({ post, variant = 'default' }: Props) {
  if (variant === 'compact') return <CompactCard post={post} />;
  if (variant === 'featured') return <FeaturedCard post={post} />;
  return <DefaultCard post={post} />;
}

function Cover({ post, className }: { post: PostSummary; className: string }) {
  if (!post.cover) return null;
  return (
    <div
      role="img"
      aria-label={post.title}
      className={`bg-bg-tertiary bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url("${post.cover.replace(/"/g, '%22')}")` }}
    />
  );
}

function DefaultCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[6px] border border-border bg-surface shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:border-text-muted hover:shadow-[var(--shadow-md)]">
      <Cover post={post} className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-3 text-xs text-text-muted">{formatDate(post.date)} · {post.readingTime} 分钟</p>
        <h2 className="font-serif text-xl font-bold leading-snug text-text">
          <Link href={`/posts/${post.slug}`} className="hover:text-secondary">
            <span className="absolute inset-0" />
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">{post.excerpt}</p>
        <div className="relative z-10 mt-auto flex flex-wrap gap-1.5 pt-5">
          {post.tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>
      </div>
    </article>
  );
}

function FeaturedCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative grid min-h-[23rem] overflow-hidden rounded-[6px] bg-[#15231d] text-white shadow-[var(--shadow-md)]">
      {post.cover ? (
        <Cover post={post} className="absolute inset-0 opacity-55 transition-transform duration-500 group-hover:scale-[1.02]" />
      ) : (
        <div className="absolute inset-0 bg-[url('/images/writing-desk.jpg')] bg-cover bg-center opacity-[0.42]" />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex max-w-2xl flex-col justify-end p-6 sm:p-8">
        <p className="mb-3 text-xs text-white/70">{formatDate(post.date)} · {post.category} · {post.readingTime} 分钟</p>
        <h2 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
          <Link href={`/posts/${post.slug}`}>
            <span className="absolute inset-0" />
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/78 sm:text-base">{post.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-white">
          阅读文章 <ArrowUpRight size={16} />
        </span>
      </div>
    </article>
  );
}

function CompactCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative border-b border-border py-5 first:pt-0 last:border-0 last:pb-0">
      <p className="mb-2 text-xs text-text-muted">{formatDate(post.date)} · {post.readingTime} 分钟</p>
      <h3 className="font-serif text-lg font-bold leading-snug text-text">
        <Link href={`/posts/${post.slug}`} className="hover:text-secondary">
          <span className="absolute inset-0" />
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{post.excerpt}</p>
    </article>
  );
}
