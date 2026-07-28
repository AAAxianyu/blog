import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { slugify } from '@/lib/utils';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const extensions: Record<string, string> = {
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function uploadRoot(): string {
  return process.env.BLOG_UPLOAD_DIR?.trim() || '/tmp/x1anyu-blog-uploads';
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request, true);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '请选择图片' }, { status: 400 });
  }
  if (!extensions[file.type]) {
    return NextResponse.json({ error: '仅支持 JPG、PNG、WebP、GIF 和 AVIF 图片' }, { status: 415 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: '图片不能超过 8 MB' }, { status: 413 });
  }

  const now = new Date();
  const relativeDirectory = path.join(String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, '0'));
  const directory = path.join(/* turbopackIgnore: true */ uploadRoot(), relativeDirectory);
  fs.mkdirSync(directory, { recursive: true });

  const originalBase = slugify(path.basename(file.name, path.extname(file.name))) || 'image';
  const filename = `${Date.now()}-${originalBase.slice(0, 60)}-${randomBytes(4).toString('hex')}${extensions[file.type]}`;
  fs.writeFileSync(
    path.join(/* turbopackIgnore: true */ directory, filename),
    Buffer.from(await file.arrayBuffer()),
    { mode: 0o640 }
  );

  return NextResponse.json({
    url: `/uploads/${relativeDirectory.split(path.sep).join('/')}/${filename}`,
  }, { status: 201 });
}
