import Link from 'next/link';

export default function TagBadge({ tag, size = 'sm' }: { tag: string; size?: 'sm' | 'lg' }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className={`inline-flex items-center rounded-full bg-secondary-soft font-medium text-secondary hover:bg-bg-tertiary ${
        size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
      }`}
    >
      #{tag}
    </Link>
  );
}
