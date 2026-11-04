import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { absoluteUrl } from '@/data/site';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /**
   * 放在深色横幅上用 'dark'：文字改成浅色，对比度不低于 4.5:1。
   * 默认 'light'：浅色页面上的原有配色，文章页和品牌页不受影响。
   */
  tone?: 'light' | 'dark';
}

const TONES = {
  light: {
    list: 'text-slate-500',
    home: 'text-slate-500 hover:text-[#6955E8]',
    icon: 'text-slate-500',
    chevron: 'text-slate-500',
    current: 'text-slate-800',
    link: 'hover:text-[#6955E8]',
  },
  dark: {
    list: 'text-slate-200',
    home: 'text-slate-200 hover:text-white',
    icon: 'text-slate-200',
    chevron: 'text-slate-300',
    current: 'text-white',
    link: 'hover:text-white',
  },
} as const;

export function Breadcrumb({ items, tone = 'light' }: BreadcrumbProps) {
  const c = TONES[tone];
  // Generate JSON-LD BreadcrumbList
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: absoluteUrl('/'),
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href ? absoluteUrl(item.href) : undefined,
      })),
    ],
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <ol className={`flex flex-wrap items-center space-x-1.5 text-xs ${c.list}`}>
        <li className="inline-flex items-center">
          <Link
            href="/"
            className={`inline-flex items-center py-1 transition-colors ${c.home}`}
          >
            <Home className={`mr-1 h-3.5 w-3.5 ${c.icon}`} />
            <span>首页</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center space-x-1.5">
              <ChevronRight className={`h-3 w-3 ${c.chevron}`} />
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={`font-medium truncate max-w-[200px] sm:max-w-md ${c.current}`}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`inline-flex items-center py-1 transition-colors ${c.link}`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
