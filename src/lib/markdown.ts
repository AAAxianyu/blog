import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Root } from 'hast';

interface RehypePlugin {
  (options?: unknown): (tree: Root) => void;
}

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), 'ariaLabel', 'className'],
    code: [...(defaultSchema.attributes?.code || []), 'className', 'dataLanguage', 'dataTheme'],
    div: [...(defaultSchema.attributes?.div || []), 'className', 'dataRehypePrettyCodeFigure'],
    figure: ['className', 'dataRehypePrettyCodeFigure'],
    pre: [...(defaultSchema.attributes?.pre || []), 'className', 'dataLanguage', 'dataTheme'],
    span: [...(defaultSchema.attributes?.span || []), 'ariaHidden', 'className', 'style', 'dataLine'],
  },
  tagNames: [...(defaultSchema.tagNames || []), 'figure'],
};

const autolinkOptions = {
  behavior: 'append' as const,
  properties: {
    className: ['anchor-link'],
    ariaLabel: '复制此小节链接',
  },
  content: {
    type: 'element',
    tagName: 'span',
    properties: { ariaHidden: 'true' },
    children: [{ type: 'text', value: '#' }],
  },
};

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings as RehypePlugin, autolinkOptions)
    .use(rehypePrettyCode as RehypePlugin, {
      theme: { light: 'github-light', dark: 'github-dark' },
      keepBackground: false,
      defaultLang: 'plaintext',
    })
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}

export { stripMarkdownText as stripMarkdown } from './utils-internal';
