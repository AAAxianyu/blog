'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function Sidebar() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const article = document.querySelector('article.prose');
    if (!article) return;
    const els = article.querySelectorAll('h2, h3');
    const tocs: TocItem[] = [];
    els.forEach((el) => {
      if (el.id) tocs.push({ id: el.id, text: el.textContent || '', level: +el.tagName[1] });
    });
    setItems(tocs);

    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-80px 0px -75% 0px' }
    );
    els.forEach((el) => { if (el.id) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  if (items.length < 2) return null;

  return (
    <nav className="text-sm" aria-label="目录">
      <h4 className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-text-muted mb-4 font-sans">
        目录
      </h4>
      <ul className="space-y-0.5">
        {items.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`block py-1.5 leading-snug transition-all duration-200 text-[0.8125rem]
                ${h.level === 3 ? 'pl-4' : ''}
                ${active === h.id
                  ? 'text-accent font-medium'
                  : 'text-text-muted hover:text-text-secondary'
                }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
