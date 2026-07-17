import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostsByCategory, getAllCategories } from '@/lib/posts';
import PostCard from '@/components/features/PostCard';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ category: cat.name }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  return {
    title: `分类：${category}`,
    description: `"${category}" 分类下的所有文章`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const posts = getPostsByCategory(decodeURIComponent(category));

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
          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-2">
            {category}
          </h1>
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
