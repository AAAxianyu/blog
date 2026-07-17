'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Only grab h2 and h3 within the article
    const article = document.querySelector('article.prose');
    if (!article) return;

    const elements = article.querySelectorAll('h2, h3');
    const items: TocItem[] = [];

    elements.forEach((el) => {
      if (el.id) {
        items.push({
          id: el.id,
          text: el.textContent || '',
          level: parseInt(el.tagName[1]),
        });
      }
    });

    setHeadings(items);

    // Scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    elements.forEach((el) => {
      if (el.id) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm" aria-label="Table of contents">
      <h4 className="text-xs font-semibold tracking-wider uppercase text-text-tertiary mb-3">
        目录
      </h4>
      <ul className="space-y-0.5 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block py-1 text-sm leading-snug transition-all duration-200
                ${heading.level === 3 ? 'pl-4' : 'pl-3'}
                ${
                  activeId === heading.id
                    ? 'text-accent font-medium border-l-2 border-accent -ml-px'
                    : 'text-text-tertiary hover:text-text-secondary border-l-2 border-transparent -ml-px'
                }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
