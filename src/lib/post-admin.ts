import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { getAllPosts, getPostBySlug, getPostsDirectory, type Post } from './posts';

const slugPattern = /^[\p{Letter}\p{Number}]+(?:-[\p{Letter}\p{Number}]+)*$/u;

export const postInputSchema = z.object({
  title: z.string().trim().min(1, '请填写标题').max(160, '标题不能超过 160 个字符'),
  slug: z.string().trim().min(1, '请填写链接名称').max(120).regex(slugPattern, '链接名称只能包含文字、数字和连字符'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  category: z.string().trim().min(1, '请填写分类').max(50),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
  excerpt: z.string().trim().min(1, '请填写摘要').max(300),
  cover: z.string().trim().max(500).optional().or(z.literal('')),
  author: z.string().trim().min(1).max(80),
  draft: z.boolean(),
  content: z.string().min(1, '文章内容不能为空').max(500_000),
});

export type PostInput = z.infer<typeof postInputSchema>;

export interface AdminPostSummary {
  slug: string;
  title: string;
  date: string;
  category: string;
  draft: boolean;
  updated?: string;
}

function getTrashDirectory(): string {
  const configured = process.env.BLOG_TRASH_DIR?.trim();
  return configured
    ? path.resolve(/* turbopackIgnore: true */ configured)
    : path.join(process.cwd(), '.data', 'trash');
}

function ensureDataDirectories(): void {
  fs.mkdirSync(getPostsDirectory(), { recursive: true });
  fs.mkdirSync(getTrashDirectory(), { recursive: true });
}

function postPath(slug: string): string {
  if (!slugPattern.test(slug)) throw new Error('Invalid post slug');
  return path.join(/* turbopackIgnore: true */ getPostsDirectory(), `${slug}.md`);
}

export function listAdminPosts(): AdminPostSummary[] {
  return getAllPosts({ includeDrafts: true }).map(({ slug, title, date, category, draft, updated }) => ({
    slug,
    title,
    date,
    category,
    draft,
    updated,
  }));
}

export function readAdminPost(slug: string): Post | null {
  return getPostBySlug(slug, { includeDrafts: true });
}

export function saveAdminPost(input: PostInput, previousSlug?: string): Post {
  const validated = postInputSchema.parse(input);
  ensureDataDirectories();

  const targetPath = postPath(validated.slug);
  if (previousSlug && previousSlug !== validated.slug) {
    const conflicting = getPostBySlug(validated.slug, { includeDrafts: true });
    if (conflicting) throw new Error('该链接名称已被其他文章使用');
  }

  const frontmatter = {
    title: validated.title,
    date: validated.date,
    ...(validated.updated ? { updated: validated.updated } : {}),
    category: validated.category,
    tags: Array.from(new Set(validated.tags)),
    excerpt: validated.excerpt,
    ...(validated.cover ? { cover: validated.cover } : {}),
    author: validated.author,
    draft: validated.draft,
  };
  const serialized = matter.stringify(validated.content.trimEnd() + '\n', frontmatter);
  const temporaryPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporaryPath, serialized, { encoding: 'utf8', mode: 0o640 });
  fs.renameSync(temporaryPath, targetPath);

  if (previousSlug && previousSlug !== validated.slug) {
    for (const extension of ['.md', '.mdx']) {
      const oldPath = path.join(/* turbopackIgnore: true */ getPostsDirectory(), `${previousSlug}${extension}`);
      if (fs.existsSync(/* turbopackIgnore: true */ oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const saved = readAdminPost(validated.slug);
  if (!saved) throw new Error('文章保存后无法读取');
  return saved;
}

export function archiveAdminPost(slug: string): string {
  ensureDataDirectories();
  for (const extension of ['.md', '.mdx']) {
    const source = path.join(/* turbopackIgnore: true */ getPostsDirectory(), `${slug}${extension}`);
    if (!fs.existsSync(/* turbopackIgnore: true */ source)) continue;
    const archivedName = `${slug}-${new Date().toISOString().replace(/[:.]/g, '-')}${extension}`;
    const destination = path.join(/* turbopackIgnore: true */ getTrashDirectory(), archivedName);
    fs.renameSync(source, destination);
    return archivedName;
  }
  throw new Error('文章不存在');
}
