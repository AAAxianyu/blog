import PostCard from './PostCard';
import type { PostSummary } from '@/lib/posts';

export default function PostGrid({ posts, featured = false }: { posts: PostSummary[]; featured?: boolean }) {
  if (!posts.length) return null;

  if (featured && posts.length > 1) {
    return (
      <div className="stagger grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.75fr)]">
        <PostCard post={posts[0]} variant="featured" />
        <div className="border-y border-border py-5 lg:border-y-0 lg:border-l lg:py-0 lg:pl-7">
          {posts.slice(1, 4).map((post) => <PostCard key={post.slug} post={post} variant="compact" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="stagger grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => <PostCard key={post.slug} post={post} />)}
    </div>
  );
}
