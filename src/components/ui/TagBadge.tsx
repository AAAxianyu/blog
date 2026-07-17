import Link from 'next/link';
import { slugify } from '@/lib/utils';

export default function TagBadge({ tag, size = 'sm' }: { tag: string; size?: 'sm' | 'lg' }) {
  const sizeClasses =
    size === 'lg'
      ? 'px-3 py-1 text-sm'
      : 'px-2 py-0.5 text-xs';

  return (
    <Link
      href={`/tags/${slugify(tag)}`}
      className={`inline-block ${sizeClasses} font-medium rounded-full
        bg-accent-light text-accent hover:bg-accent/10
        transition-colors duration-200 no-underline`}
    >
      {tag}
    </Link>
  );
}
