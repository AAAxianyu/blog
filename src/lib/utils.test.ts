import { describe, expect, it } from 'vitest';
import { countWords, decodeRouteSegment, estimateReadingTime, formatDate, slugify } from './utils';

describe('content utilities', () => {
  it('keeps Unicode letters in slugs', () => {
    expect(slugify('你好 Next.js 世界')).toBe('你好-next-js-世界');
    expect(decodeRouteSegment('%E4%BD%A0%E5%A5%BD')).toBe('你好');
    expect(decodeRouteSegment('你好')).toBe('你好');
  });

  it('counts CJK characters and Latin words', () => {
    expect(countWords('你好世界 hello world')).toBe(6);
  });

  it('estimates mixed-language reading time', () => {
    expect(estimateReadingTime('中文内容 '.repeat(400))).toBeGreaterThan(1);
  });

  it('formats ISO dates without timezone drift', () => {
    expect(formatDate('2026-07-15')).toBe('2026年7月15日');
  });
});
