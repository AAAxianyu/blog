'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import {
  Bold,
  Check,
  Code2,
  Columns2,
  Eye,
  ExternalLink,
  FileText,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  LoaderCircle,
  LogOut,
  MessageSquare,
  MonitorUp,
  Plus,
  Quote,
  Save,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { slugify } from '@/lib/utils';

interface AdminPostSummary {
  slug: string;
  title: string;
  date: string;
  category: string;
  draft: boolean;
  updated?: string;
}

interface EditorPost {
  title: string;
  slug: string;
  date: string;
  updated: string;
  category: string;
  tags: string[];
  excerpt: string;
  cover: string;
  author: string;
  draft: boolean;
  content: string;
}

type EditorMode = 'write' | 'split' | 'preview';

const today = () => new Date().toISOString().slice(0, 10);

const emptyPost = (): EditorPost => ({
  title: '',
  slug: '',
  date: today(),
  updated: '',
  category: '技术',
  tags: [],
  excerpt: '',
  cover: '',
  author: 'x1anyu',
  draft: true,
  content: '',
});

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options?.headers,
    },
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || '请求失败');
  return payload;
}

export default function AdminStudio({
  initialAuthenticated,
  configured,
}: {
  initialAuthenticated: boolean;
  configured: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authPending, setAuthPending] = useState(false);

  if (!authenticated) {
    return (
      <LoginPanel
        configured={configured}
        password={password}
        error={authError}
        pending={authPending}
        onPasswordChange={setPassword}
        onSubmit={async (event) => {
          event.preventDefault();
          setAuthPending(true);
          setAuthError('');
          try {
            await api('/api/admin/session', {
              method: 'POST',
              body: JSON.stringify({ password }),
            });
            setPassword('');
            setAuthenticated(true);
          } catch (error) {
            setAuthError(error instanceof Error ? error.message : '登录失败');
          } finally {
            setAuthPending(false);
          }
        }}
      />
    );
  }

  return <WritingStudio onSignedOut={() => setAuthenticated(false)} />;
}

function LoginPanel({
  configured,
  password,
  error,
  pending,
  onPasswordChange,
  onSubmit,
}: {
  configured: boolean;
  password: string;
  error: string;
  pending: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="admin-login px-5 py-20">
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm" aria-label="后台登录">
        <div className="mb-8">
          <p className="mb-2 font-mono text-xs text-accent">WRITING STUDIO</p>
          <h1 className="font-serif text-3xl font-semibold text-text">回到写字台</h1>
          <p className="mt-2 text-sm text-text-secondary">登录后管理文章与草稿。</p>
        </div>

        <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-text">
          管理密码
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          disabled={!configured || pending}
          className="admin-input w-full"
          placeholder="输入密码"
        />
        {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
        {!configured && (
          <p className="mt-3 text-sm text-danger" role="alert">
            服务器尚未配置后台密码。
          </p>
        )}
        <button
          type="submit"
          disabled={!configured || !password || pending}
          className="admin-primary mt-5 w-full"
        >
          {pending ? <LoaderCircle size={16} className="animate-spin" /> : <MonitorUp size={16} />}
          登录
        </button>
      </form>
    </div>
  );
}

function WritingStudio({ onSignedOut }: { onSignedOut: () => void }) {
  const [posts, setPosts] = useState<AdminPostSummary[]>([]);
  const [post, setPost] = useState<EditorPost>(emptyPost);
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [mode, setMode] = useState<EditorMode>('write');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      const data = await api<{ posts: AdminPostSummary[] }>('/api/admin/posts');
      setPosts(data.posts);
    } catch (caught) {
      if (caught instanceof Error && caught.message.includes('登录')) onSignedOut();
      else setError(caught instanceof Error ? caught.message : '文章列表加载失败');
    } finally {
      setLoading(false);
    }
  }, [onSignedOut]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void loadPosts());
    return () => window.cancelAnimationFrame(frame);
  }, [loadPosts]);

  useEffect(() => {
    if (mode === 'write') return;
    const timeout = window.setTimeout(async () => {
      try {
        const result = await api<{ html: string }>('/api/admin/preview', {
          method: 'POST',
          body: JSON.stringify({ markdown: post.content }),
        });
        setPreviewHtml(result.html);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : '预览生成失败');
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [mode, post.content]);

  useEffect(() => {
    const key = `x1anyu-editor-${originalSlug || 'new'}`;
    const timeout = window.setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(post));
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [originalSlug, post]);

  const filteredPosts = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase('zh-CN');
    if (!query) return posts;
    return posts.filter((item) =>
      `${item.title} ${item.category} ${item.slug}`.toLocaleLowerCase('zh-CN').includes(query)
    );
  }, [filter, posts]);

  const update = <K extends keyof EditorPost>(key: K, value: EditorPost[K]) => {
    setPost((current) => ({ ...current, [key]: value }));
  };

  const createPost = () => {
    const draft = emptyPost();
    const local = localStorage.getItem('x1anyu-editor-new');
    if (local) {
      try {
        Object.assign(draft, JSON.parse(local) as Partial<EditorPost>);
      } catch {
        localStorage.removeItem('x1anyu-editor-new');
      }
    }
    setPost(draft);
    setOriginalSlug(null);
    setSlugTouched(false);
    setNotice('');
    setError('');
  };

  const openPost = async (slug: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api<{ post: EditorPost }>(`/api/admin/posts/${encodeURIComponent(slug)}`);
      const normalized = {
        ...data.post,
        updated: data.post.updated || '',
        cover: data.post.cover || '',
      };
      setPost(normalized);
      setOriginalSlug(slug);
      setSlugTouched(true);
      setNotice('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '文章加载失败');
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (publish?: boolean) => {
    setSaving(true);
    setError('');
    setNotice('');
    const payload = { ...post, draft: publish === undefined ? post.draft : !publish };
    try {
      const data = await api<{ post: EditorPost }>(
        originalSlug ? `/api/admin/posts/${encodeURIComponent(originalSlug)}` : '/api/admin/posts',
        {
          method: originalSlug ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      localStorage.removeItem(`x1anyu-editor-${originalSlug || 'new'}`);
      setPost({ ...data.post, updated: data.post.updated || '', cover: data.post.cover || '' });
      setOriginalSlug(data.post.slug);
      setSlugTouched(true);
      setNotice(data.post.draft ? '草稿已保存' : '文章已发布');
      await loadPosts();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const archivePost = async () => {
    if (!originalSlug || !window.confirm(`将《${post.title}》移入回收站？文章可从服务器回收目录恢复。`)) return;
    setSaving(true);
    try {
      await api(`/api/admin/posts/${encodeURIComponent(originalSlug)}`, { method: 'DELETE' });
      localStorage.removeItem(`x1anyu-editor-${originalSlug}`);
      createPost();
      setNotice('文章已移入回收站');
      await loadPosts();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '移入回收站失败');
    } finally {
      setSaving(false);
    }
  };

  const insertMarkdown = (before: string, after = '', placeholder = '文字') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = post.content.slice(start, end) || placeholder;
    const next = `${post.content.slice(0, start)}${before}${selected}${after}${post.content.slice(end)}`;
    update('content', next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError('');
    const body = new FormData();
    body.append('file', file);
    try {
      const result = await api<{ url: string }>('/api/admin/upload', { method: 'POST', body });
      insertMarkdown(`![${file.name}](`, ')', result.url);
      setNotice('图片已上传并插入');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '图片上传失败');
    } finally {
      setUploading(false);
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-mono text-[0.65rem] text-text-muted">WRITING STUDIO</p>
            <p className="text-sm font-semibold text-text">文章管理</p>
          </div>
          <button type="button" className="admin-icon" title="新建文章" onClick={createPost}>
            <Plus size={17} />
          </button>
        </div>
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="筛选文章"
              className="admin-input w-full pl-9"
            />
          </div>
        </div>
        <div className="admin-post-list">
          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-10 text-text-muted"><LoaderCircle size={18} className="animate-spin" /></div>
          ) : filteredPosts.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-text-muted">暂无文章</p>
          ) : filteredPosts.map((item) => (
            <button
              type="button"
              key={item.slug}
              onClick={() => void openPost(item.slug)}
              className={`admin-post-row ${originalSlug === item.slug ? 'is-active' : ''}`}
            >
              <span className="line-clamp-2 text-left text-sm font-medium">{item.title}</span>
              <span className="mt-1 flex items-center gap-2 text-[0.68rem] text-text-muted">
                <span>{item.date}</span>
                <span>{item.category}</span>
                {item.draft && <span className="text-accent">草稿</span>}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-border p-3">
          <Link href="/admin/comments" className="admin-icon" title="管理评论" aria-label="管理评论">
            <MessageSquare size={16} />
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="在新标签页打开"
            className="admin-secondary text-xs"
          >
            <ExternalLink size={15} />
            查看博客
          </Link>
          <button
            type="button"
            className="admin-icon"
            title="退出登录"
            onClick={async () => {
              await api('/api/admin/session', { method: 'DELETE' });
              onSignedOut();
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="admin-workspace">
        <div className="admin-toolbar">
          <div className="min-w-0">
            <p className="truncate text-xs text-text-muted">
              {originalSlug ? `/posts/${originalSlug}` : '新文章'}
            </p>
            <div className="mt-1 flex min-h-5 items-center gap-2 text-xs">
              {notice && <span className="flex items-center gap-1 text-success"><Check size={13} />{notice}</span>}
              {error && <span className="flex items-center gap-1 text-danger"><X size={13} />{error}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {originalSlug && (
              <button type="button" className="admin-icon text-danger" title="移入回收站" onClick={() => void archivePost()}>
                <Trash2 size={16} />
              </button>
            )}
            <button type="button" className="admin-secondary" disabled={saving} onClick={() => void savePost()}>
              {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
              保存
            </button>
            <button type="button" className="admin-primary" disabled={saving} onClick={() => void savePost(true)}>
              <Send size={15} />
              发布
            </button>
          </div>
        </div>

        <div className="admin-scroll">
          <section className="admin-meta">
            <input
              value={post.title}
              onChange={(event) => {
                const title = event.target.value;
                update('title', title);
                if (!slugTouched && !originalSlug) update('slug', slugify(title));
              }}
              placeholder="文章标题"
              className="admin-title"
            />
            <div className="admin-meta-grid">
              <Field label="链接名称">
                <input
                  value={post.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    update('slug', slugify(event.target.value));
                  }}
                  className="admin-input w-full"
                  placeholder="post-slug"
                />
              </Field>
              <Field label="发布日期">
                <input type="date" value={post.date} onChange={(event) => update('date', event.target.value)} className="admin-input w-full" />
              </Field>
              <Field label="分类">
                <input value={post.category} onChange={(event) => update('category', event.target.value)} className="admin-input w-full" />
              </Field>
              <Field label="作者">
                <input value={post.author} onChange={(event) => update('author', event.target.value)} className="admin-input w-full" />
              </Field>
              <Field label="标签" wide>
                <input
                  value={post.tags.join(', ')}
                  onChange={(event) => update('tags', event.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))}
                  className="admin-input w-full"
                  placeholder="Next.js, 随笔"
                />
              </Field>
              <Field label="封面地址" wide>
                <input
                  value={post.cover}
                  onChange={(event) => update('cover', event.target.value)}
                  className="admin-input w-full"
                  placeholder="/uploads/..."
                />
              </Field>
              <Field label="摘要" wide>
                <textarea
                  value={post.excerpt}
                  onChange={(event) => update('excerpt', event.target.value)}
                  className="admin-input min-h-20 w-full resize-y"
                  maxLength={300}
                />
              </Field>
            </div>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={post.draft}
                onChange={(event) => update('draft', event.target.checked)}
                className="admin-checkbox"
              />
              保存为草稿
            </label>
          </section>

          <section className="admin-editor">
            <div className="admin-editor-bar">
              <div className="flex items-center gap-0.5">
                <ToolButton label="二级标题" icon={<Heading2 size={16} />} onClick={() => insertMarkdown('\n## ', '\n', '小节标题')} />
                <ToolButton label="加粗" icon={<Bold size={16} />} onClick={() => insertMarkdown('**', '**')} />
                <ToolButton label="斜体" icon={<Italic size={16} />} onClick={() => insertMarkdown('*', '*')} />
                <ToolButton label="链接" icon={<Link2 size={16} />} onClick={() => insertMarkdown('[', '](https://)', '链接文字')} />
                <ToolButton label="行内代码" icon={<Code2 size={16} />} onClick={() => insertMarkdown('`', '`', 'code')} />
                <ToolButton label="引用" icon={<Quote size={16} />} onClick={() => insertMarkdown('\n> ', '\n', '引用内容')} />
                <ToolButton label="列表" icon={<List size={16} />} onClick={() => insertMarkdown('\n- ', '\n', '列表项')} />
                <ToolButton
                  label="上传图片"
                  icon={uploading ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  onClick={() => uploadRef.current?.click()}
                />
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadImage(file);
                  }}
                />
              </div>
              <div className="admin-segmented" aria-label="编辑视图">
                <button type="button" title="编辑" className={mode === 'write' ? 'is-active' : ''} onClick={() => setMode('write')}><FileText size={15} /></button>
                <button type="button" title="分栏" className={mode === 'split' ? 'is-active' : ''} onClick={() => setMode('split')}><Columns2 size={15} /></button>
                <button type="button" title="预览" className={mode === 'preview' ? 'is-active' : ''} onClick={() => setMode('preview')}><Eye size={15} /></button>
              </div>
            </div>
            <div className={`admin-editor-panes mode-${mode}`}>
              {mode !== 'preview' && (
                <textarea
                  ref={textareaRef}
                  value={post.content}
                  onChange={(event) => update('content', event.target.value)}
                  spellCheck={false}
                  className="admin-markdown"
                  aria-label="Markdown 内容"
                  placeholder="从这里开始写正文…"
                />
              )}
              {mode !== 'write' && (
                <article
                  className="prose admin-preview"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={wide ? 'sm:col-span-2' : ''}>
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

function ToolButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="admin-icon" title={label} aria-label={label} onClick={onClick}>
      {icon}
    </button>
  );
}
