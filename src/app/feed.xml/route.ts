import { getAllPosts } from '@/lib/posts';

export async function GET() {
  const posts = getAllPosts();
  const siteUrl = process.env.SITE_URL || 'https://x1anyu.top';

  const feedItems = posts
    .map(
      (post) => `
    <entry>
      <title><![CDATA[${post.title}]]></title>
      <link href="${siteUrl}/posts/${post.slug}" />
      <id>${siteUrl}/posts/${post.slug}</id>
      <published>${post.date}T00:00:00Z</published>
      <updated>${post.updated || post.date}T00:00:00Z</updated>
      <summary><![CDATA[${post.excerpt}]]></summary>
      <category term="${post.category}" />
      ${post.tags.map((tag) => `<category term="${tag}" />`).join('\n      ')}
    </entry>`
    )
    .join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>x1anyu的小屋</title>
  <subtitle>记录技术、设计、生活的思考和感悟。</subtitle>
  <link href="${siteUrl}/feed.xml" rel="self" />
  <link href="${siteUrl}" />
  <updated>${posts[0]?.date || new Date().toISOString().split('T')[0]}T00:00:00Z</updated>
  <id>${siteUrl}</id>
  <author>
    <name>x1anyu</name>
  </author>
  ${feedItems}
</feed>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
