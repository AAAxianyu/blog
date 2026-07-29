import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createComment, deleteComment, listAllComments, listComments } from './comments';

let directory = '';

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'x1anyu-comments-'));
  process.env.BLOG_COMMENTS_DIR = directory;
});

afterEach(() => {
  delete process.env.BLOG_COMMENTS_DIR;
  fs.rmSync(directory, { recursive: true, force: true });
});

describe('comment repository', () => {
  it('persists comments and isolates article slugs', async () => {
    const first = await createComment({ slug: 'first-post', author: '读者甲', content: '第一条' });
    await createComment({ slug: 'second-post', author: '读者乙', content: '第二条' });

    expect(listComments('first-post')).toEqual([first]);
    expect(listComments('second-post')).toHaveLength(1);
  });

  it('ignores a damaged record without hiding valid comments', async () => {
    const comment = await createComment({ slug: 'post', author: '匿名读者', content: '有效评论' });
    fs.appendFileSync(path.join(directory, 'comments.jsonl'), '{damaged}\n');

    expect(listComments('post')).toEqual([comment]);
  });

  it('keeps a deletion tombstone across later reads', async () => {
    const comment = await createComment({ slug: 'post', author: '匿名读者', content: '待删除' });

    expect(await deleteComment(comment.id)).toBe(true);
    expect(await deleteComment(comment.id)).toBe(false);
    expect(listComments('post')).toEqual([]);
    expect(listAllComments()).toEqual([]);
  });
});
