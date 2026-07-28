import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCategories, getPostsByCategory } from '@/lib/posts';
import PostGrid from '@/components/features/PostGrid';

interface Props { params: Promise<{ category: string }>; }

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: category.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = decodeURIComponent((await params).category);
  return { title: `分类：${category}`, description: `浏览“${category}”分类下的文章。` };
}

export default async function CategoryPage({ params }: Props) {
  const category = decodeURIComponent((await params).category);
  const posts = getPostsByCategory(category);
  if (!posts.length) notFound();

  return (
    <div className="animate-fade-in">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[var(--max-width-page)] px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
          <Link href="/posts" className="text-sm text-secondary hover:text-text">返回全部文章</Link>
          <p className="section-kicker mb-2 mt-7">Category</p>
          <h1 className="font-serif text-3xl font-bold text-text sm:text-4xl">{category}</h1>
          <p className="mt-3 text-text-secondary">{posts.length} 篇文章</p>
        </div>
      </header>
      <section className="mx-auto max-w-[var(--max-width-page)] px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <PostGrid posts={posts} />
      </section>
    </div>
  );
}
