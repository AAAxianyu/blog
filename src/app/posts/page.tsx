import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import PostCard from '@/components/features/PostCard';

export const metadata = {
  title: '文章列表',
  description: '全部文章',
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div className="animate-fade-in">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-page)] px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-3">文章</h1>
          <p className="text-text-secondary">
            共 {posts.length} 篇文章
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-page)] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {posts.map((post) => (
              <div key={post.slug}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-text mb-2">暂无文章</h3>
            <p className="text-text-secondary">稍后再来看看吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
