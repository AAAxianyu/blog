'use client';

import { useState } from 'react';
import { Check, Link2, MessagesSquare, Share2 } from 'lucide-react';

export default function ArticleActions({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const issueUrl = `https://github.com/AAAxianyu/blog/issues/new?${new URLSearchParams({
    title: `关于文章：${title}`,
    body: `文章链接：${url}\n\n`,
  }).toString()}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await copyLink();
  };

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2 border-y border-border py-4">
      <button type="button" onClick={() => void copyLink()} className="admin-secondary">
        {copied ? <Check size={15} /> : <Link2 size={15} />}
        {copied ? '已复制' : '复制链接'}
      </button>
      <button type="button" onClick={() => void share()} className="admin-secondary">
        <Share2 size={15} />
        分享
      </button>
      <a href={issueUrl} target="_blank" rel="noreferrer" className="admin-secondary">
        <MessagesSquare size={15} />
        参与讨论
      </a>
    </div>
  );
}
