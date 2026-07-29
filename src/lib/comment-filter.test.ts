import { describe, expect, it } from 'vitest';
import { filterCommentText, normalizeCommentText } from './comment-filter';

describe('comment filter', () => {
  it('masks only high-confidence profanity and slurs', () => {
    expect(filterCommentText('这个设计真傻逼，fuck this').text).toBe('这个设计真**，**** this');
    expect(filterCommentText('我们可以讨论敏感词过滤的边界').changed).toBe(false);
    expect(filterCommentText('这是妈妈的旧照片').changed).toBe(false);
  });

  it('catches lightly obfuscated phrases while preserving spaces', () => {
    expect(filterCommentText('去 你 妈').text).toBe('* * *');
  });

  it('normalizes whitespace without removing intentional paragraphs', () => {
    expect(normalizeCommentText('  第一段  \r\n\r\n\r\n第二段  ')).toBe('第一段\n\n第二段');
  });
});
