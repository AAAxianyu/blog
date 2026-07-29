'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, LoaderCircle, MessageSquare, Trash2 } from 'lucide-react';
import type { Comment } from '@/lib/comments';

interface ApiResponse {
  comments?: Comment[];
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

export default function CommentModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [confirming, setConfirming] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/comments', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as ApiResponse;
        if (!response.ok || !data.comments) throw new Error(data.error || '评论加载失败');
        setComments(data.comments);
      })
      .catch((caught: unknown) => {
        if ((caught as Error).name !== 'AbortError') {
          setError(caught instanceof Error ? caught.message : '评论加载失败');
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const remove = async (comment: Comment) => {
    setDeleting(comment.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/comments/${encodeURIComponent(comment.id)}`, {
        method: 'DELETE',
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok) throw new Error(data.error || '删除失败');
      setComments((current) => current.filter((item) => item.id !== comment.id));
      setConfirming('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '删除失败');
    } finally {
      setDeleting('');
    }
  };

  return (
    <main className="min-h-[calc(100vh-var(--header-height))] bg-surface">
      <header className="border-b border-border bg-bg">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-6 sm:px-6">
          <div>
            <p className="font-mono text-[0.65rem] text-text-muted">WRITING STUDIO</p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-text">评论管理</h1>
          </div>
          <Link href="/admin" className="admin-secondary">
            <ArrowLeft size={15} />
            返回文章
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <MessageSquare size={18} className="text-secondary" />
          <h2 className="font-semibold text-text">全部评论</h2>
          <span className="text-sm text-text-muted">{comments.length}</span>
        </div>

        {error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-16 text-text-muted">
            <LoaderCircle size={20} className="animate-spin" aria-label="加载评论" />
          </div>
        ) : comments.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-muted">暂无评论</p>
        ) : (
          <ol className="divide-y divide-border">
            {comments.map((comment) => (
              <li key={comment.id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <strong className="text-sm text-text">{comment.author}</strong>
                      <time className="text-xs text-text-muted" dateTime={comment.createdAt}>
                        {formatter.format(new Date(comment.createdAt))}
                      </time>
                    </div>
                    <Link
                      href={`/posts/${encodeURIComponent(comment.slug)}`}
                      target="_blank"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-secondary hover:underline"
                    >
                      /posts/{comment.slug}
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                  <button
                    type="button"
                    className={confirming === comment.id
                      ? 'admin-secondary shrink-0 text-danger'
                      : 'admin-icon shrink-0 text-danger'}
                    title={confirming === comment.id ? '确认删除评论' : '删除评论'}
                    aria-label={confirming === comment.id
                      ? `确认删除 ${comment.author} 的评论`
                      : `删除 ${comment.author} 的评论`}
                    disabled={deleting === comment.id}
                    onClick={() => {
                      if (confirming === comment.id) {
                        void remove(comment);
                      } else {
                        setConfirming(comment.id);
                      }
                    }}
                  >
                    {deleting === comment.id
                      ? <LoaderCircle size={16} className="animate-spin" />
                      : <Trash2 size={16} />}
                    {confirming === comment.id && deleting !== comment.id && '确认删除'}
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-text-secondary">
                  {comment.content}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
