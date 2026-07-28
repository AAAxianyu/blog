# x1anyu Blog

基于 Next.js App Router 的个人博客，包含公开阅读站点、Markdown 写作后台和自动化生产部署。

## 主要功能

- 首页、文章列表、归档、分类、标签和全文搜索
- Markdown / GFM、代码高亮、标题锚点和安全 HTML 清理
- RSS、sitemap、robots.txt 和文章分享
- `/admin` 写作后台：草稿、发布、编辑、归档、实时预览和图片上传
- 明暗主题和响应式布局
- GitHub Actions 自动测试、构建、发布、健康检查和失败回滚

## 本地开发

需要 Node.js 22 和 npm。

```bash
npm ci
npm run dev
```

站点默认运行在 `http://localhost:3000`。如需使用本地写作后台，在 `.env.local` 中配置：

```dotenv
ADMIN_PASSWORD=your-local-password
SESSION_SECRET=replace-with-at-least-32-random-characters
SITE_URL=http://localhost:3000
```

可用 `openssl rand -hex 32` 生成会话密钥。开发环境的文章默认读取 `content/posts`，后台归档默认写入 `.data/trash`。

## 内容格式

文章位于 `content/posts/*.md`，后台会生成相同格式：

```markdown
---
title: "文章标题"
date: "2026-07-27"
updated: "2026-07-27"
category: "技术"
tags: ["Next.js", "随笔"]
excerpt: "文章摘要"
cover: "/images/example.jpg"
author: "x1anyu"
draft: false
---

正文内容
```

`draft: true` 的文章只在后台可见。生产环境建议直接访问 `/admin` 写作，文章和上传图片会保存在服务器持久化目录，不受新版本发布影响。

## 质量检查

```bash
npm run lint
npm run test
npm run build
npm run check
npm audit --omit=dev
```

## 自动部署

推送 `main` 后，[GitHub Actions](.github/workflows/deploy.yml) 会：

1. 安装依赖并运行 lint、测试和生产构建。
2. 生成 Next.js standalone 发布包。
3. 通过 SCP 上传到服务器，不要求服务器连接 GitHub。
4. 原子切换 `/srv/x1anyu-blog/current` 并由 systemd 重启服务。
5. 检查 `/api/health`；失败时自动恢复上一个版本。

仓库需要配置以下 Actions secrets：

- `SSH_HOST`
- `SSH_USERNAME`
- `SSH_PASSWORD`

本地已通过检查后，可运行：

```bash
./deploy.sh
gh run watch --repo AAAxianyu/blog
```

生产数据与配置：

- 文章：`/var/lib/x1anyu-blog/posts`
- 上传：`/var/lib/x1anyu-blog/uploads`
- 可恢复归档：`/var/lib/x1anyu-blog/trash`
- 环境变量：`/etc/x1anyu-blog.env`
- 服务：`x1anyu-blog.service`

查看线上状态：

```bash
systemctl status x1anyu-blog
journalctl -u x1anyu-blog -n 100 --no-pager
curl -fsS https://x1anyu.top/api/health
```

后台初始密码在首次部署时随机生成，仅保存在服务器的 `/etc/x1anyu-blog.env`。修改密码或会话密钥后，需要运行 `systemctl restart x1anyu-blog`。
