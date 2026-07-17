import { searchPosts } from '@/lib/posts';
import PostCard from '@/components/features/PostCard';
import SearchBar from '@/components/features/SearchBar';

export const metadata = {
  title: '搜索',
  description: '搜索文章',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || '';
  const results = query ? searchPosts(query) : [];

  return (
    <div className="animate-fade-in">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 sm:px-6 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-6">搜索</h1>
          <div className="max-w-md">
            <SearchBar placeholder="输入关键词搜索..." />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-page)] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {query ? (
          <>
            <p className="text-text-secondary mb-8">
              找到 {results.length} 篇关于 &quot;{query}&quot; 的文章
            </p>
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {results.map((post) => (
                  <div key={post.slug}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-text-tertiary text-lg">没有找到相关文章，试试其他关键词吧。</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-tertiary text-lg">
              在上方输入关键词，搜索感兴趣的文章。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
