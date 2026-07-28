import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getAllPosts, getPostsByTag, searchPosts } from './posts';

let directory = '';

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'x1anyu-posts-'));
  process.env.BLOG_CONTENT_DIR = directory;
  fs.writeFileSync(path.join(directory, 'published.md'), `---
title: 可见文章
date: 2026-07-20
category: Web
tags: [Next.js, 测试]
excerpt: 公开摘要
---

正文里有一个只在全文出现的关键词：原子发布。
`);
  fs.writeFileSync(path.join(directory, 'draft.md'), `---
title: 私密草稿
date: 2026-07-21
category: Notes
tags: [private]
excerpt: 不应公开
draft: true
---

尚未发布。
`);
});

afterEach(() => {
  delete process.env.BLOG_CONTENT_DIR;
  fs.rmSync(directory, { recursive: true, force: true });
});

describe('post repository', () => {
  it('does not expose drafts publicly', () => {
    expect(getAllPosts().map((post) => post.slug)).toEqual(['published']);
    expect(getAllPosts({ includeDrafts: true })).toHaveLength(2);
  });

  it('searches article body text', () => {
    expect(searchPosts('原子发布').map((post) => post.slug)).toEqual(['published']);
  });

  it('matches tags containing punctuation exactly', () => {
    expect(getPostsByTag('Next.js').map((post) => post.slug)).toEqual(['published']);
  });
});
