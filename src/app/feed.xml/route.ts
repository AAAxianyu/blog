import { getAllPosts } from '@/lib/posts';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const posts = getAllPosts();
  const siteUrl = process.env.SITE_URL || 'https://x1anyu.top';
  const entries = posts.map((post) => {
    const url = `${siteUrl}/posts/${encodeURIComponent(post.slug)}`;
    return `
    <entry>
      <title>${escapeXml(post.title)}</title>
      <link href="${escapeXml(url)}" />
      <id>${escapeXml(url)}</id>
      <published>${post.date}T00:00:00Z</published>
      <updated>${post.updated || post.date}T00:00:00Z</updated>
      <summary>${escapeXml(post.excerpt)}</summary>
      <category term="${escapeXml(post.category)}" />
      ${post.tags.map((tag) => `<category term="${escapeXml(tag)}" />`).join('\n      ')}
    </entry>`;
  }).join('');

  const latest = posts[0]?.updated || posts[0]?.date || new Date().toISOString().slice(0, 10);
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>x1anyu的小屋</title>
  <subtitle>记录技术、设计与生活。</subtitle>
  <link href="${escapeXml(siteUrl)}/feed.xml" rel="self" />
  <link href="${escapeXml(siteUrl)}" />
  <updated>${latest}T00:00:00Z</updated>
  <id>${escapeXml(siteUrl)}</id>
  <author><name>x1anyu</name></author>
  ${entries}
</feed>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
