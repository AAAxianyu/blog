---
title: "The Complete Markdown Syntax Guide"
date: "2026-07-10"
category: "Writing"
tags: ["markdown", "guide", "reference", "writing"]
excerpt: "A comprehensive reference for Markdown syntax — from basic formatting to advanced features like tables, footnotes, and code blocks."
author: "Blog Author"
---

## Overview

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents. It was created by John Gruber in 2004 and has become one of the most popular markup languages.

This guide covers everything you need to know about writing Markdown.

## Basic Syntax

### Headings

Use `#` for headings. The number of `#` symbols corresponds to the heading level:

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

### Text Formatting

- **Bold text** — use `**double asterisks**`
- *Italic text* — use `*single asterisks*`
- ~~Strikethrough~~ — use `~~double tildes~~`
- `Inline code` — use backticks

### Blockquotes

> "Any application that can be written in JavaScript, will eventually be written in JavaScript."
> — Jeff Atwood

Blockquotes can also be nested:

> First level
>> Second level
>>> Third level

### Lists

Unordered lists:

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

Ordered lists:

1. First step
2. Second step
   1. Sub-step 2.1
   2. Sub-step 2.2
3. Third step

## Links and Images

### Links

[Basic link](https://example.com)

[Link with title](https://example.com "Example Website")

### Images

![Alt text for accessibility](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800)

## Code Blocks

### JavaScript

```javascript
// Quick sort implementation
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

const sorted = quickSort([3, 6, 8, 10, 1, 2, 1]);
console.log(sorted); // [1, 1, 2, 3, 6, 8, 10]
```

### TypeScript

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json();
}
```

### Python

```python
from typing import Generator

def fibonacci(n: int) -> Generator[int, None, None]:
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Print first 10 Fibonacci numbers
for num in fibonacci(10):
    print(num)
```

### Bash

```bash
#!/bin/bash
# Deploy script

set -e

echo "Building application..."
npm run build

echo "Restarting server..."
pm2 restart blog

echo "Deployment complete! ✓"
```

## Tables

| Feature | Support | Notes |
|---------|---------|-------|
| Tables | ✅ | Column alignment supported |
| Code blocks | ✅ | Syntax highlighting |
| Footnotes | ✅ | Extended syntax |
| Task lists | ✅ | With checkboxes |
| Math | ❌ | Needs a plugin |

Alignment:

| Left aligned | Center aligned | Right aligned |
|:-------------|:--------------:|--------------:|
| Content | Content | Content |
| Cell | Cell | Cell |

## Task Lists

- [x] Set up the blog
- [x] Write the first article
- [ ] Add more content
- [ ] Set up analytics
- [ ] Share on social media

## Horizontal Rules

Three or more dashes, asterisks, or underscores:

---

## Emoji

Modern Markdown supports emoji shortcodes:

:rocket: :sparkles: :fire: :heart: :computer: :books:

## Extended Syntax

### Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content. It can span multiple lines.

### Definition Lists

Term
: Definition of the term

Another term
: Another definition

### Abbreviations

*[HTML]: Hyper Text Markup Language
*[CSS]: Cascading Style Sheets

## Best Practices

1. **Be consistent** — Pick a style and stick with it
2. **Use headings wisely** — They create the document structure
3. **Alt text matters** — Always add descriptive alt text to images
4. **Keep it readable** — Markdown should be readable as plain text too
5. **Preview before publishing** — Always check the rendered output

## Resources

- [Markdown Guide](https://www.markdownguide.org)
- [CommonMark Spec](https://commonmark.org)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

---

_This guide itself is written in Markdown. You can view the raw source to see how each element is written!_
