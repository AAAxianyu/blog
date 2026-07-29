'use client';

import { FormEvent, useState } from 'react';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';
import type { Comment } from '@/lib/comments';

interface Props {
  slug: string;
  initialComments: Comment[];
}

interface ApiResponse {
  comments?: Comment[];
  comment?: Comment;
  filtered?: boolean;
  accepted?: boolean;
  error?: string;
}

const formatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : formatter.format(date);
}

export default function Comments({ slug, initialComments }: Props) {
  const [comments, setComments] = useState(initialComments);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(slug)}`, { cache: 'no-store' });
      const data = await response.json() as ApiResponse;
      if (!response.ok || !data.comments) throw new Error(data.error || '评论加载失败');
      setComments(data.comments);
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : '评论加载失败' });
    } finally {
      setRefreshing(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content, website }),
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok) throw new Error(data.error || '评论发表失败');
      if (data.comment) setComments((current) => [...current, data.comment as Comment]);
      setContent('');
      setWebsite('');
      setNotice({
        type: 'success',
        message: data.filtered ? '评论已发表，部分词语已自动隐藏' : '评论已发表',
      });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : '评论发表失败' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-14 border-t border-border pt-9" aria-labelledby="comments-title">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <MessageSquare size={19} aria-hidden="true" className="text-secondary" />
          <h2 id="comments-title" className="font-serif text-xl font-bold text-text">
            评论 <span className="font-sans text-sm font-normal text-text-muted">{comments.length}</span>
          </h2>
        </div>
        <button
          type="button"
          className="admin-icon shrink-0"
          title="刷新评论"
          aria-label="刷新评论"
          disabled={refreshing}
          onClick={() => void refresh()}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <form className="mt-6 border-b border-border pb-8" onSubmit={(event) => void submit(event)}>
        <label className="block text-sm font-semibold text-text" htmlFor="comment-author">
          昵称 <span className="font-normal text-text-muted">选填</span>
        </label>
        <input
          id="comment-author"
          className="admin-input mt-2 w-full sm:max-w-xs"
          value={author}
          maxLength={24}
          autoComplete="nickname"
          placeholder="匿名读者"
          onChange={(event) => setAuthor(event.target.value)}
        />

        <label className="mt-5 block text-sm font-semibold text-text" htmlFor="comment-content">
          评论
        </label>
        <textarea
          id="comment-content"
          className="admin-input mt-2 min-h-32 w-full resize-y leading-relaxed"
          value={content}
          minLength={2}
          maxLength={800}
          required
          placeholder="写下你的想法"
          onChange={(event) => setContent(event.target.value)}
        />

        <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="comment-website">网站</label>
          <input
            id="comment-website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-text-muted">{content.length} / 800</span>
          <button type="submit" className="admin-primary" disabled={submitting || content.trim().length < 2}>
            <Send size={15} aria-hidden="true" />
            {submitting ? '发表中' : '发表评论'}
          </button>
        </div>

        {notice && (
          <p
            className={`mt-3 text-sm ${notice.type === 'error' ? 'text-danger' : 'text-success'}`}
            role={notice.type === 'error' ? 'alert' : 'status'}
          >
            {notice.message}
          </p>
        )}
      </form>

      {comments.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-muted">还没有评论</p>
      ) : (
        <ol className="divide-y divide-border" aria-label="评论列表">
          {comments.map((comment) => (
            <li key={comment.id} className="py-6">
              <div className="flex items-baseline justify-between gap-4">
                <strong className="min-w-0 truncate text-sm text-text">{comment.author}</strong>
                <time className="shrink-0 text-xs text-text-muted" dateTime={comment.createdAt}>
                  {formatTime(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-[0.95rem] leading-7 text-text-secondary">
                {comment.content}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
