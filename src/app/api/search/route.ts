import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/posts';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').slice(0, 120);
  const posts = searchPosts(query);

  const response = NextResponse.json({
    posts: posts.slice(0, 10).map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      category: p.category,
      tags: p.tags,
      excerpt: p.excerpt,
      readingTime: p.readingTime,
    })),
    total: posts.length,
  });
  response.headers.set('Cache-Control', 'private, max-age=30');
  return response;
}
