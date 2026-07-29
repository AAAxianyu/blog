import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export interface Comment {
  id: string;
  slug: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface NewComment {
  slug: string;
  author: string;
  content: string;
}

interface DeletedComment {
  type: 'delete';
  id: string;
  deletedAt: string;
}

let appendQueue = Promise.resolve();

export function getCommentsDirectory(): string {
  return process.env.BLOG_COMMENTS_DIR || path.join(process.cwd(), '.data', 'comments');
}

function getCommentsFile(): string {
  return path.join(getCommentsDirectory(), 'comments.jsonl');
}

function isComment(value: unknown): value is Comment {
  if (!value || typeof value !== 'object') return false;
  const comment = value as Partial<Comment>;
  return typeof comment.id === 'string'
    && typeof comment.slug === 'string'
    && typeof comment.author === 'string'
    && typeof comment.content === 'string'
    && typeof comment.createdAt === 'string';
}

function isDeletedComment(value: unknown): value is DeletedComment {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<DeletedComment>;
  return event.type === 'delete'
    && typeof event.id === 'string'
    && typeof event.deletedAt === 'string';
}

function readComments(): Comment[] {
  let source = '';
  try {
    source = fs.readFileSync(getCommentsFile(), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const comments = new Map<string, Comment>();
  for (const line of source.split('\n')) {
    if (!line.trim()) continue;
    try {
      const parsed: unknown = JSON.parse(line);
      if (isComment(parsed)) comments.set(parsed.id, parsed);
      if (isDeletedComment(parsed)) comments.delete(parsed.id);
    } catch {
      // A damaged line must not make every article's comments unavailable.
    }
  }

  return Array.from(comments.values());
}

async function appendRecord(record: Comment | DeletedComment): Promise<void> {
  const line = `${JSON.stringify(record)}\n`;
  const write = appendQueue.then(async () => {
    await fs.promises.mkdir(getCommentsDirectory(), { recursive: true });
    await fs.promises.appendFile(getCommentsFile(), line, { encoding: 'utf8', mode: 0o640 });
  });
  appendQueue = write.catch(() => undefined);
  await write;
}

export function listComments(slug: string): Comment[] {
  return readComments()
    .filter((comment) => comment.slug === slug)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export function listAllComments(): Comment[] {
  return readComments().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function createComment(input: NewComment): Promise<Comment> {
  const comment: Comment = {
    id: randomUUID(),
    slug: input.slug,
    author: input.author,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  await appendRecord(comment);

  return comment;
}

export async function deleteComment(id: string): Promise<boolean> {
  if (!readComments().some((comment) => comment.id === id)) return false;
  await appendRecord({ type: 'delete', id, deletedAt: new Date().toISOString() });
  return true;
}
