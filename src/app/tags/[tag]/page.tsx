import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsByTag, getAllTags } from '@/lib/posts';
import PostCard from '@/components/features/PostCard';

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((t) => ({ tag: t.name }));
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  return {
    title: `标签：${tag}`,
    description: `带有 "${tag}" 标签的文章`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostsByTag(decodeURIComponent(tag));

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-page)] px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors mb-3 inline-block">
            &larr; 返回首页
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
              #{tag}
            </h1>
          </div>
          <p className="text-text-secondary">
            共 {posts.length} 篇文章
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-page)] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {posts.map((post) => (
            <div key={post.slug}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
