const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  const value = ISO_DATE_PATTERN.test(date) ? `${date}T00:00:00.000Z` : date;
  return new Date(value);
}

export function formatDate(date: string | Date): string {
  const parsed = parseDate(date);
  if (Number.isNaN(parsed.getTime())) return String(date);

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function formatDateISO(date: string | Date): string {
  const parsed = parseDate(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${String(date)}`);
  }
  return parsed.toISOString().slice(0, 10);
}

export function slugify(text: string): string {
  return text
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export function decodeRouteSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function countWords(text: string): number {
  const plain = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ');

  const cjkCount = (plain.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu) || []).length;
  const latinText = plain.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, ' ');
  const latinCount = (latinText.match(/[\p{Letter}\p{Number}]+(?:['’-][\p{Letter}\p{Number}]+)*/gu) || []).length;

  return cjkCount + latinCount;
}

export function estimateReadingTime(text: string): number {
  const cjkCount = (text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu) || []).length;
  const latinCount = countWords(
    text.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, ' ')
  );
  return Math.max(1, Math.ceil(cjkCount / 300 + latinCount / 200));
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '').trim()}…`;
}
