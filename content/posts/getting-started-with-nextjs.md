---
title: "Getting Started with Next.js: A Practical Guide"
date: "2026-07-14"
updated: "2026-07-16"
category: "Web Development"
tags: ["nextjs", "react", "typescript", "tutorial"]
excerpt: "A hands-on introduction to building modern web applications with Next.js. Learn the fundamentals and build your first app."
author: "Blog Author"
---

## Introduction

[Next.js](https://nextjs.org) has become one of the most popular frameworks for building React applications. It provides a great developer experience with features like file-based routing, server-side rendering, and API routes out of the box.

In this guide, we'll explore the key concepts and build something practical.

## Why Next.js?

Next.js offers several advantages over plain React:

- **File-based routing** — No need for a routing library; files become routes
- **Server-side rendering (SSR)** — Better SEO and initial page load performance
- **Static site generation (SSG)** — Pre-render pages at build time for blazing-fast delivery
- **API routes** — Build your backend API within the same project
- **Built-in optimizations** — Image optimization, font loading, and more

## Setting Up Your First Project

Getting started is straightforward. Run this command in your terminal:

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
```

This creates a new Next.js project with:

- TypeScript support
- Tailwind CSS for styling
- The App Router (the modern way to build Next.js apps)

## Understanding the App Router

The App Router uses a directory-based routing system. Here's how it works:

```
src/app/
├── layout.tsx      # Root layout (shared across all pages)
├── page.tsx        # Home page (/)
├── about/
│   └── page.tsx    # About page (/about)
├── blog/
│   ├── page.tsx    # Blog list (/blog)
│   └── [slug]/
│       └── page.tsx # Blog post (/blog/my-post)
└── api/
    └── hello/
        └── route.ts # API endpoint (/api/hello)
```

### Server Components vs Client Components

By default, all components in the App Router are **Server Components**. They run on the server and send only HTML to the client — no JavaScript needed!

When you need interactivity (state, effects, event handlers), use the `'use client'` directive:

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

## Data Fetching in Next.js

Next.js provides several ways to fetch data:

### Server Components (Recommended)

```tsx
// This runs on the server — no useEffect needed!
async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 } // ISR: revalidate every hour
  }).then(res => res.json());

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Static Generation with `generateStaticParams`

For static routes, use `generateStaticParams`:

```tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

## Styling with Tailwind CSS

Tailwind CSS makes styling fast and consistent. Here's a quick comparison:

```html
<!-- Traditional CSS -->
<div class="card">
  <h2 class="card-title">
    Hello
  </h2>
</div>

<!-- Tailwind CSS -->
<div class="bg-white rounded-xl shadow-md p-6">
  <h2 class="text-xl font-bold text-gray-900">
    Hello
  </h2>
</div>
```

## Deployment

Next.js can be deployed anywhere:

- **Vercel** (creators of Next.js) — zero-config deployment
- **Self-hosted** — Use `next build && next start` with PM2 or Docker
- **Static export** — Use `next export` for purely static sites

Here's a basic PM2 configuration for self-hosting:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'blog',
    script: 'node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## Key Takeaways

Here's what you should remember:

1. **App Router** is the modern way to build Next.js apps
2. **Server Components** are the default — add `'use client'` only when needed
3. **File-based routing** makes navigation intuitive
4. **Data fetching** happens naturally in async Server Components
5. **Tailwind CSS** pairs perfectly with Next.js for styling

## What's Next?

In future articles, we'll explore:

- Authentication with NextAuth.js
- Database integration with Prisma
- Building a full-stack blog from scratch
- Performance optimization techniques

Stay tuned, and happy coding! 🎉
