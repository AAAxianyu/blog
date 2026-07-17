import PostCard from './PostCard';
import { PostSummary } from '@/lib/posts';

interface Props {
  posts: PostSummary[];
  featured?: boolean;
}

export default function PostGrid({ posts, featured = false }: Props) {
  if (posts.length === 0) return null;

  return (
    <div className="stagger">
      {/* Bento-style: first post gets a larger card */}
      {featured && posts.length > 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-5 sm:mb-6">
          <div className="lg:col-span-2">
            <PostCard post={posts[0]} variant="featured" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:gap-6">
            {posts.slice(1, 3).map((p) => (
              <PostCard key={p.slug} post={p} variant="compact" />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {(featured && posts.length > 1 ? posts.slice(3) : posts).map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
