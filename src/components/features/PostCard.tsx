import Link from 'next/link';
import TagBadge from '@/components/ui/TagBadge';
import { PostSummary } from '@/lib/posts';
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

function DefaultCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative bg-surface rounded-2xl overflow-hidden
      shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]
      transition-all duration-400 hover:-translate-y-1
      border border-border-light">
      {post.cover && (
        <Link href={`/posts/${post.slug}`} className="block overflow-hidden">
          <div className="aspect-[16/10] bg-bg-tertiary overflow-hidden">
            <img
              src={post.cover} alt={post.title}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2.5 text-xs text-text-muted font-mono mb-3">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="opacity-30">·</span>
          <span>{post.readingTime} 分钟</span>
          {post.updated && (
            <>
              <span className="opacity-30">·</span>
              <span className="text-accent/80 text-[0.65rem] tracking-wide uppercase">已更新</span>
            </>
          )}
        </div>

        <Link
          href={`/categories/${post.category}`}
          className="inline-block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-accent mb-2 hover:underline underline-offset-2"
        >
          {post.category}
        </Link>

        <h2 className="font-serif text-xl font-bold leading-snug mb-2 tracking-tight">
          <Link href={`/posts/${post.slug}`} className="text-text hover:text-accent transition-colors">
            <span className="absolute inset-0 z-10" />
            {post.title}
          </Link>
        </h2>

        <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2 font-sans">
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 relative z-20">
            {post.tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function FeaturedCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative bg-surface rounded-2xl overflow-hidden
      shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-xl)]
      transition-all duration-400 hover:-translate-y-1
      border border-border-light h-full flex flex-col sm:flex-row">
      {post.cover && (
        <Link href={`/posts/${post.slug}`} className="block sm:w-2/5 shrink-0 overflow-hidden">
          <div className="aspect-[16/10] sm:aspect-auto sm:h-full bg-bg-tertiary overflow-hidden">
            <img
              src={post.cover} alt={post.title}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className="p-6 sm:p-8 flex flex-col justify-center flex-1">
        <div className="flex items-center gap-2.5 text-xs text-text-muted font-mono mb-3">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="opacity-30">·</span>
          <span>{post.readingTime} 分钟</span>
        </div>

        <Link
          href={`/categories/${post.category}`}
          className="inline-block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-accent mb-2 hover:underline"
        >
          {post.category}
        </Link>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight mb-3 tracking-tight">
          <Link href={`/posts/${post.slug}`} className="text-text hover:text-accent transition-colors">
            <span className="absolute inset-0 z-10" />
            {post.title}
          </Link>
        </h2>

        <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 relative z-20">
            {post.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}
      </div>
    </article>
  );
}

function CompactCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative bg-surface rounded-2xl
      shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
      transition-all duration-400 hover:-translate-y-0.5
      border border-border-light p-4 sm:p-5 flex flex-col justify-center">
      <div className="flex items-center gap-2 text-xs text-text-muted font-mono mb-2">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="opacity-30">·</span>
        <span>{post.readingTime} 分钟</span>
      </div>

      <h3 className="font-serif text-base font-bold leading-snug tracking-tight">
        <Link href={`/posts/${post.slug}`} className="text-text hover:text-accent transition-colors">
          <span className="absolute inset-0 z-10" />
          {post.title}
        </Link>
      </h3>
    </article>
  );
}
