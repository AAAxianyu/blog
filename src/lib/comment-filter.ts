export interface FilteredText {
  text: string;
  changed: boolean;
}

const FILTER_PATTERNS = [
  /操\s*你\s*妈/giu,
  /草\s*你\s*妈/giu,
  /肏\s*你\s*妈/giu,
  /去\s*你\s*妈/giu,
  /你\s*妈\s*死\s*了/giu,
  /他\s*妈\s*的/giu,
  /傻\s*[逼屌]/giu,
  /煞\s*笔/giu,
  /狗\s*日\s*的/giu,
  /脑\s*残/giu,
  /支\s*那/giu,
  /黑\s*鬼/giu,
  /\bnmsl\b/giu,
  /\bcnm\b/giu,
  /\bfuck(?:ing|er|ed)?\b/giu,
  /\bshit(?:ty)?\b/giu,
  /\bbitch(?:es)?\b/giu,
  /\bnigg(?:er|a)s?\b/giu,
];

function maskMatch(value: string): string {
  return Array.from(value, (character) => (/\s/u.test(character) ? character : '*')).join('');
}

export function normalizeCommentText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function filterCommentText(value: string): FilteredText {
  let text = normalizeCommentText(value);
  let changed = false;

  for (const pattern of FILTER_PATTERNS) {
    text = text.replace(pattern, (match) => {
      changed = true;
      return maskMatch(match);
    });
  }

  return { text, changed };
}
