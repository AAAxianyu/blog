import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于',
  description: '关于本站和作者',
};

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--max-width-content)] px-4 sm:px-6 py-16 sm:py-20">
          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">关于</h1>
          <p className="text-lg text-text-secondary">
            关于这个博客，以及写博客的人。
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 sm:px-6 py-12 sm:py-16">
        <div className="prose">
          <h2>你好！👋</h2>
          <p>
            欢迎来到我的小天地。我是一名热爱编程的开发者，喜欢动手折腾各种有趣的东西，
            并通过写作来记录和分享自己的学习与思考。
          </p>

          <p>
            这个博客是我记录技术探索、设计心得和生活感悟的地方。
            我相信"教是最好的学"——把知识写下来，不仅能帮助他人，更能加深自己的理解。
          </p>

          <h2>在这里你会看到</h2>
          <ul>
            <li>Web 技术的前端探索与架构思考</li>
            <li>实用的教程和踩坑指南</li>
            <li>软件工程与代码工艺的反思</li>
            <li>读书笔记和学习资源推荐</li>
            <li>偶尔聊聊工具、效率和日常生活</li>
          </ul>

          <h2>技术栈</h2>
          <p>
            本站使用{' '}
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</a> 构建，
            使用{' '}
            <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">Tailwind CSS</a> 设计，
            内容全部以 Markdown 驱动。源代码在 GitHub 上开源。
          </p>

          <h2>联系我</h2>
          <p>
            如果你有任何想法、建议，或者只是想打个招呼，欢迎通过邮件或社交媒体联系我。
          </p>
        </div>
      </div>
    </div>
  );
}
