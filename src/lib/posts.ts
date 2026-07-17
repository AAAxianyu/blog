import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { formatDateISO, estimateReadingTime } from './utils';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

export interface PostFrontmatter {
  title: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  excerpt: string;
  cover?: string;
  author?: string;
  draft?: boolean;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  excerpt: string;
  cover?: string;
  author: string;
  content: string;
  readingTime: number;
  wordCount: number;
}

export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  excerpt: string;
  cover?: string;
  author: string;
  readingTime: number;
}

/**
 * Get all published posts, sorted by date (newest first).
 */
export function getAllPosts(): PostSummary[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames
    .filter((filename) => filename.endsWith('.md') || filename.endsWith('.mdx'))
    .map((filename) => {
      const slug = filename.replace(/\.(md|mdx)$/, '');
      const filePath = path.join(postsDirectory, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);
      const frontmatter = data as PostFrontmatter;

      // Skip drafts
      if (frontmatter.draft) return null;

      return {
        slug,
        title: frontmatter.title,
        date: formatDateISO(frontmatter.date),
        updated: frontmatter.updated ? formatDateISO(frontmatter.updated) : undefined,
        category: frontmatter.category || 'Uncategorized',
        tags: frontmatter.tags || [],
        excerpt: frontmatter.excerpt || '',
        cover: frontmatter.cover,
        author: frontmatter.author || 'Anonymous',
        readingTime: estimateReadingTime(fileContent),
      } as PostSummary;
    })
    .filter((post): post is PostSummary => post !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}

/**
 * Get a single post by slug, with full content.
 */
export function getPostBySlug(slug: string): Post | null {
  const extensions = ['.md', '.mdx'];
  let filePath = '';

  for (const ext of extensions) {
    const testPath = path.join(postsDirectory, `${slug}${ext}`);
    if (fs.existsSync(testPath)) {
      filePath = testPath;
      break;
    }
  }

  if (!filePath) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const frontmatter = data as PostFrontmatter;

  return {
    slug,
    title: frontmatter.title,
    date: formatDateISO(frontmatter.date),
    updated: frontmatter.updated ? formatDateISO(frontmatter.updated) : undefined,
    category: frontmatter.category || 'Uncategorized',
    tags: frontmatter.tags || [],
    excerpt: frontmatter.excerpt || '',
    cover: frontmatter.cover,
    author: frontmatter.author || 'Anonymous',
    content,
    readingTime: estimateReadingTime(content),
    wordCount: content.trim().split(/\s+/).length,
  };
}

/**
 * Get all unique categories with post counts.
 */
export function getAllCategories(): { name: string; count: number }[] {
  const posts = getAllPosts();
  const categories = new Map<string, number>();

  posts.forEach((post) => {
    categories.set(post.category, (categories.get(post.category) || 0) + 1);
  });

  return Array.from(categories.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all unique tags with post counts.
 */
export function getAllTags(): { name: string; count: number }[] {
  const posts = getAllPosts();
  const tags = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    });
  });

  return Array.from(tags.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get posts by category.
 */
export function getPostsByCategory(category: string): PostSummary[] {
  return getAllPosts().filter((post) => post.category === category);
}

/**
 * Get posts by tag.
 */
export function getPostsByTag(tag: string): PostSummary[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

/**
 * Search posts by query (searches title, excerpt, tags, category).
 */
export function searchPosts(query: string): PostSummary[] {
  if (!query.trim()) return getAllPosts();

  const q = query.toLowerCase().trim();
  return getAllPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

/**
 * Get paginated posts.
 */
export function getPaginatedPosts(page: number, perPage: number = 10) {
  const all = getAllPosts();
  const totalPages = Math.ceil(all.length / perPage);
  const start = (page - 1) * perPage;
  const posts = all.slice(start, start + perPage);

  return {
    posts,
    totalPosts: all.length,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Get adjacent posts (prev/next) for a given post.
 */
export function getAdjacentPosts(slug: string): {
  prev: PostSummary | null;
  next: PostSummary | null;
} {
  const all = getAllPosts();
  const index = all.findIndex((p) => p.slug === slug);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < all.length - 1 ? all[index + 1] : null,
    next: index > 0 ? all[index - 1] : null,
  };
}
