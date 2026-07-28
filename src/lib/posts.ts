import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { countWords, estimateReadingTime, formatDateISO, stripMarkdownText } from './utils-internal';

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
  draft: boolean;
  content: string;
  readingTime: number;
  wordCount: number;
}

export type PostSummary = Omit<Post, 'content' | 'wordCount'>;

interface PostFile {
  slug: string;
  post: Post;
}

export function getPostsDirectory(): string {
  const configured = process.env.BLOG_CONTENT_DIR?.trim();
  return configured
    ? path.resolve(/* turbopackIgnore: true */ configured)
    : path.join(process.cwd(), 'content', 'posts');
}

function isSafeSlug(slug: string): boolean {
  return Boolean(slug) && !slug.includes('/') && !slug.includes('\\') && slug !== '.' && slug !== '..';
}

function normalizeFrontmatter(slug: string, data: Record<string, unknown>, content: string): Post {
  const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : slug;
  const date = formatDateISO(typeof data.date === 'string' || data.date instanceof Date ? data.date : new Date());
  const updated = data.updated
    ? formatDateISO(data.updated as string | Date)
    : undefined;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean)
    : [];

  return {
    slug,
    title,
    date,
    updated,
    category: typeof data.category === 'string' && data.category.trim() ? data.category.trim() : '未分类',
    tags,
    excerpt: typeof data.excerpt === 'string' ? data.excerpt.trim() : '',
    cover: typeof data.cover === 'string' && data.cover.trim() ? data.cover.trim() : undefined,
    author: typeof data.author === 'string' && data.author.trim() ? data.author.trim() : 'x1anyu',
    draft: data.draft === true,
    content,
    readingTime: estimateReadingTime(content),
    wordCount: countWords(content),
  };
}

function readPostFile(filePath: string): PostFile | null {
  try {
    const filename = path.basename(filePath);
    const slug = filename.replace(/\.(md|mdx)$/i, '');
    const parsed = matter(fs.readFileSync(/* turbopackIgnore: true */ filePath, 'utf8'));
    return { slug, post: normalizeFrontmatter(slug, parsed.data, parsed.content) };
  } catch (error) {
    console.error(`Unable to read post ${path.basename(filePath)}:`, error);
    return null;
  }
}

function getPostFiles(): PostFile[] {
  const directory = getPostsDirectory();
  if (!fs.existsSync(/* turbopackIgnore: true */ directory)) return [];

  return fs
    .readdirSync(/* turbopackIgnore: true */ directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name))
    .map((entry) => readPostFile(path.join(/* turbopackIgnore: true */ directory, entry.name)))
    .filter((post): post is PostFile => post !== null);
}

function toSummary(post: Post): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    updated: post.updated,
    category: post.category,
    tags: post.tags,
    excerpt: post.excerpt,
    cover: post.cover,
    author: post.author,
    draft: post.draft,
    readingTime: post.readingTime,
  };
}

export function getAllPosts(options: { includeDrafts?: boolean } = {}): PostSummary[] {
  return getPostFiles()
    .map(({ post }) => post)
    .filter((post) => options.includeDrafts || !post.draft)
    .sort((a, b) => {
      const dateOrder = Date.parse(b.date) - Date.parse(a.date);
      return dateOrder || a.title.localeCompare(b.title, 'zh-CN');
    })
    .map(toSummary);
}

export function getPostBySlug(slug: string, options: { includeDrafts?: boolean } = {}): Post | null {
  if (!isSafeSlug(slug)) return null;
  const directory = getPostsDirectory();

  for (const extension of ['.md', '.mdx']) {
    const candidate = path.join(/* turbopackIgnore: true */ directory, `${slug}${extension}`);
    if (!fs.existsSync(/* turbopackIgnore: true */ candidate)) continue;
    const result = readPostFile(candidate)?.post ?? null;
    if (result?.draft && !options.includeDrafts) return null;
    return result;
  }

  return null;
}

export function getAllCategories(): { name: string; count: number }[] {
  const categories = new Map<string, number>();
  for (const post of getAllPosts()) {
    categories.set(post.category, (categories.get(post.category) || 0) + 1);
  }
  return Array.from(categories, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function getAllTags(): { name: string; count: number }[] {
  const tags = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.set(tag, (tags.get(tag) || 0) + 1);
  }
  return Array.from(tags, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function getPostsByCategory(category: string): PostSummary[] {
  return getAllPosts().filter(
    (post) => post.category.localeCompare(category, 'zh-CN', { sensitivity: 'base' }) === 0
  );
}

export function getPostsByTag(tag: string): PostSummary[] {
  return getAllPosts().filter((post) =>
    post.tags.some((candidate) => candidate.localeCompare(tag, 'zh-CN', { sensitivity: 'base' }) === 0)
  );
}

export function searchPosts(query: string): PostSummary[] {
  const normalized = query.normalize('NFKC').toLocaleLowerCase('zh-CN').trim();
  if (!normalized) return [];

  return getPostFiles()
    .map(({ post }) => post)
    .filter((post) => {
      if (post.draft) return false;
      const haystack = [
        post.title,
        post.excerpt,
        post.category,
        post.tags.join(' '),
        stripMarkdownText(post.content),
      ].join('\n').normalize('NFKC').toLocaleLowerCase('zh-CN');
      return haystack.includes(normalized);
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .map(toSummary);
}

export function getAdjacentPosts(slug: string): { prev: PostSummary | null; next: PostSummary | null } {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index < 0) return { prev: null, next: null };

  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}
