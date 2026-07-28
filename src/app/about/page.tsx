import type { Metadata } from 'next';
import { Code2, Rss } from 'lucide-react';

export const metadata: Metadata = {
  title: '关于',
  description: '关于 x1anyu 和这间记录技术、设计与生活的小屋。',
};

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[var(--max-width-content)] px-5 py-14 sm:px-6 sm:py-18">
          <p className="section-kicker mb-2">About</p>
          <h1 className="font-serif text-3xl font-bold text-text sm:text-4xl">关于这间小屋</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-secondary">
            一个把实践写清楚，也把生活慢慢存下来的地方。
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[var(--max-width-content)] px-5 py-12 sm:px-6 sm:py-16">
        <div className="prose">
          <h2>你好，我是 x1anyu</h2>
          <p>
            我喜欢编程，也喜欢把一个问题从“能跑”继续推到“为什么这样跑”。写作是整理这些过程最诚实的方式：它会暴露模糊的理解，也会留下以后仍然找得到的线索。
          </p>
          <h2>这里记录什么</h2>
          <ul>
            <li>Web 开发中的实践、架构选择与排错过程</li>
            <li>工具、效率和软件工程方法</li>
            <li>读书、设计，以及偶尔偏离屏幕的生活</li>
          </ul>
          <h2>关于本站</h2>
          <p>
            本站使用 Next.js 和 Tailwind CSS 构建，文章以 Markdown 保存。代码持续开源，部署过程也尽量保持简单、可恢复和可验证。
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
          <a href="https://github.com/AAAxianyu/blog" target="_blank" rel="noreferrer" className="admin-secondary">
            <Code2 size={16} />
            查看源码
          </a>
          <a href="/feed.xml" className="admin-secondary">
            <Rss size={16} />
            RSS 订阅
          </a>
        </div>
      </section>
    </div>
  );
}
