import { describe, expect, it } from 'vitest';
import { markdownToHtml } from './markdown';

describe('markdown rendering', () => {
  it('adds heading ids and strips raw script markup', async () => {
    const html = await markdownToHtml('## 标题\n\n<script>alert(1)</script>\n\n[危险](javascript:alert(1))');
    expect(html).toContain('id="标题"');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('javascript:');
  });
});
