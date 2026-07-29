import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { hasValidOrigin } from '@/lib/auth';
import { filterCommentText, normalizeCommentText } from '@/lib/comment-filter';
import { createComment, listComments } from '@/lib/comments';
import { getPostBySlug } from '@/lib/posts';

interface Props {
  params: Promise<{ slug: string }>;
}

interface ClientState {
  timestamps: number[];
  lastContentHash: string;
  lastContentAt: number;
}

const commentSchema = z.object({
  author: z.string().max(24).optional().default(''),
  content: z.string().min(2).max(800),
  website: z.string().max(200).optional().default(''),
});
const clients = new Map<string, ClientState>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_COMMENTS_PER_WINDOW = 5;
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

export const dynamic = 'force-dynamic';

function json(data: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(data, init);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function clientKey(request: NextRequest, slug: string): string {
  const address = request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
  return createHash('sha256').update(`${address}:${slug}`).digest('hex');
}

function checkRateLimit(request: NextRequest, slug: string, content: string): NextResponse | null {
  const now = Date.now();
  const key = clientKey(request, slug);
  const state = clients.get(key) || { timestamps: [], lastContentHash: '', lastContentAt: 0 };
  state.timestamps = state.timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (state.timestamps.length >= MAX_COMMENTS_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - state.timestamps[0])) / 1000));
    const response = json({ error: '评论有点频繁，请稍后再试' }, { status: 429 });
    response.headers.set('Retry-After', String(retryAfter));
    return response;
  }

  const contentHash = createHash('sha256').update(content).digest('hex');
  if (state.lastContentHash === contentHash && now - state.lastContentAt < DUPLICATE_WINDOW_MS) {
    return json({ error: '这条评论刚刚已经发表过了' }, { status: 409 });
  }

  state.timestamps.push(now);
  state.lastContentHash = contentHash;
  state.lastContentAt = now;
  clients.set(key, state);
  return null;
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { slug } = await params;
  if (!getPostBySlug(slug)) return json({ error: '文章不存在' }, { status: 404 });
  return json({ comments: listComments(slug) });
}

export async function POST(request: NextRequest, { params }: Props) {
  if (!hasValidOrigin(request)) {
    return json({ error: '请求来源校验失败' }, { status: 403 });
  }

  const { slug } = await params;
  if (!getPostBySlug(slug)) return json({ error: '文章不存在' }, { status: 404 });

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > 4096) return json({ error: '评论内容过长' }, { status: 413 });

  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: '请求格式不正确' }, { status: 400 });
  }
  if (rawBody.length > 4096) return json({ error: '评论内容过长' }, { status: 413 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ error: '请求格式不正确' }, { status: 400 });
  }

  const result = commentSchema.safeParse(parsed);
  if (!result.success) {
    return json({ error: '昵称最多 24 个字，评论需要 2 至 800 个字' }, { status: 400 });
  }

  // The hidden field is intentionally accepted with a neutral response.
  if (result.data.website.trim()) {
    return json({ accepted: true });
  }

  const normalizedContent = normalizeCommentText(result.data.content);
  if (normalizedContent.length < 2 || normalizedContent.length > 800) {
    return json({ error: '评论需要 2 至 800 个字' }, { status: 400 });
  }

  const limited = checkRateLimit(request, slug, normalizedContent);
  if (limited) return limited;

  const authorResult = filterCommentText(result.data.author);
  const contentResult = filterCommentText(normalizedContent);
  const comment = await createComment({
    slug,
    author: authorResult.text || '匿名读者',
    content: contentResult.text,
  });

  return json({
    comment,
    filtered: authorResult.changed || contentResult.changed,
  }, { status: 201 });
}
