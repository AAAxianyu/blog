'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/ui/ThemeProvider';

// Change this to true and fill in your repo details to enable comments
const GISCUS_ENABLED = false;
const GISCUS_CONFIG = {
  repo: 'YOUR_GITHUB_USERNAME/YOUR_REPO' as `${string}/${string}`,
  repoId: 'YOUR_REPO_ID',
  category: 'Announcements',
  categoryId: 'YOUR_CATEGORY_ID',
};

export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!GISCUS_ENABLED) return;

    const container = ref.current;
    if (!container) return;

    const existingFrame = container.querySelector('iframe');

    // Theme change: send message to existing iframe
    if (existingFrame) {
      existingFrame.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: {
              theme: theme === 'dark' ? 'dark' : 'light',
            },
          },
        },
        'https://giscus.app'
      );
      return;
    }

    // Initial load
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const script = document.createElement('script');
          script.src = 'https://giscus.app/client.js';
          script.setAttribute('data-repo', GISCUS_CONFIG.repo);
          script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId);
          script.setAttribute('data-category', GISCUS_CONFIG.category);
          script.setAttribute('data-category-id', GISCUS_CONFIG.categoryId);
          script.setAttribute('data-mapping', 'pathname');
          script.setAttribute('data-strict', '0');
          script.setAttribute('data-reactions-enabled', '1');
          script.setAttribute('data-emit-metadata', '0');
          script.setAttribute('data-input-position', 'bottom');
          script.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
          script.setAttribute('data-lang', 'zh-CN');
          script.setAttribute('crossorigin', 'anonymous');
          script.async = true;

          container.appendChild(script);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [theme]);

  // Not configured — show setup guide
  if (!GISCUS_ENABLED) {
    return (
      <section className="mt-16 pt-8 border-t border-border">
        <h2 className="text-xl font-bold text-text mb-4">评论</h2>
        <div className="rounded-xl bg-bg-secondary/50 border border-border p-8 text-center">
          <p className="text-text-secondary mb-4">
            评论功能尚未配置。
          </p>
          <div className="text-sm text-text-tertiary leading-relaxed max-w-md mx-auto text-left space-y-2">
            <p className="font-medium text-text-secondary">如何开启评论：</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                前往{' '}
                <a
                  href="https://giscus.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  giscus.app
                </a>
                {' '}配置你的 GitHub 仓库
              </li>
              <li>复制 repo、repo-id、category、category-id</li>
              <li>
                在{' '}
                <code className="text-xs bg-code-bg px-1 py-0.5 rounded font-mono">src/components/Comments.tsx</code>
                {' '}中设置{' '}
                <code className="text-xs bg-code-bg px-1 py-0.5 rounded font-mono">GISCUS_ENABLED = true</code>
              </li>
            </ol>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16 pt-8 border-t border-border">
      <h2 className="text-xl font-bold text-text mb-6">评论</h2>
      <div ref={ref} className="min-h-[200px] rounded-xl bg-bg-secondary/50" />
    </section>
  );
}
