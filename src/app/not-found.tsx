import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grid min-h-[65vh] place-items-center px-5 py-16 text-center">
      <div>
        <p className="font-mono text-sm font-semibold text-accent">404</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-text">这页暂时没有内容</h1>
        <p className="mt-3 text-text-secondary">链接可能已更改，或者文章仍在草稿箱。</p>
        <Link href="/" className="admin-primary mt-7">
          <ArrowLeft size={16} />
          返回首页
        </Link>
      </div>
    </div>
  );
}
