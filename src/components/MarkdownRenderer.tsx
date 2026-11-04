import React from 'react';
import Link from 'next/link';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let inOrderedList = false;
  let orderedListItems: React.ReactNode[] = [];

  const flushTable = (key: number) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(2); // skip separator row

      elements.push(
        <div key={`table-${key}`} className="my-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#18243B] text-white">
              <tr>
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="min-w-[5.5rem] py-2.5 px-3 font-semibold">
                    {parseInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="min-w-[5.5rem] py-2.5 px-3">
                      {parseInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="my-4 list-disc pl-5 space-y-1 text-slate-700 text-sm sm:text-base leading-relaxed">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushOrderedList = (key: number) => {
    if (orderedListItems.length > 0) {
      elements.push(
        <ol key={`olist-${key}`} className="my-4 list-decimal pl-5 space-y-1.5 text-slate-700 text-sm sm:text-base leading-relaxed">
          {orderedListItems}
        </ol>
      );
      orderedListItems = [];
      inOrderedList = false;
    }
  };

  // Helper to parse inline markdown (links, bold, code)
  function parseInline(text: string): React.ReactNode {
    // Regex for markdown links [text](url)
    const parts: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseFormattedText(text.substring(lastIndex, match.index)));
      }
      const linkText = match[1];
      const linkUrl = match[2];

      if (linkUrl.startsWith('/') || linkUrl.startsWith('#')) {
        parts.push(
          <Link
            key={match.index}
            href={linkUrl}
            className="text-[#6955E8] font-semibold underline decoration-purple-300 underline-offset-2 hover:text-[#5642D8]"
          >
            {linkText}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="text-[#6955E8] font-semibold underline decoration-purple-300 underline-offset-2 hover:text-[#5642D8]"
          >
            {linkText}
          </a>
        );
      }
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(parseFormattedText(text.substring(lastIndex)));
    }

    return parts;
  }

  function parseFormattedText(text: string): React.ReactNode {
    // Parse bold **text** and code `code`
    const chunks: React.ReactNode[] = [];
    // Combined regex for **bold** and `code`
    const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        chunks.push(text.substring(lastIndex, match.index));
      }
      if (match[2]) {
        // bold
        chunks.push(
          <strong key={match.index} className="font-bold text-[#18243B]">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // inline code
        chunks.push(
          <code
            key={match.index}
            className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-purple-700 border border-slate-200"
          >
            {match[3]}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      chunks.push(text.substring(lastIndex));
    }

    return chunks;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table detection
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        flushList(i);
        flushOrderedList(i);
        inTable = true;
      }
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        flushOrderedList(i);
        inList = true;
      }
      listItems.push(
        <li key={i}>{parseInline(line.substring(2))}</li>
      );
      continue;
    } else if (inList) {
      flushList(i);
    }

    // Ordered List
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (!inOrderedList) {
        flushList(i);
        inOrderedList = true;
      }
      orderedListItems.push(
        <li key={i}>{parseInline(orderedMatch[2])}</li>
      );
      continue;
    } else if (inOrderedList) {
      flushOrderedList(i);
    }

    // Empty lines
    if (!line) {
      continue;
    }

    // Dividers
    if (line === '---' || line === '***') {
      elements.push(
        <hr key={i} className="my-8 border-slate-200" />
      );
      continue;
    }

    // Headings
    if (line.startsWith('## ')) {
      // Check for anchor syntax {#anchor}
      let title = line.replace('## ', '');
      let anchorId = '';
      const anchorMatch = title.match(/\{#([^}]+)\}/);
      if (anchorMatch) {
        anchorId = anchorMatch[1];
        title = title.replace(anchorMatch[0], '').trim();
      } else {
        anchorId = `heading-${i}`;
      }

      elements.push(
        <h2
          key={i}
          id={anchorId}
          className="mt-10 mb-4 text-xl sm:text-2xl font-bold tracking-tight text-[#18243B] scroll-mt-24 pb-2 border-b border-slate-100 flex items-center"
        >
          <span className="h-4 w-1 rounded-full bg-[#6955E8] mr-2.5"></span>
          <span>{parseInline(title)}</span>
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      const title = line.replace('### ', '');
      elements.push(
        <h3
          key={i}
          className="mt-6 mb-3 text-lg font-bold text-slate-900 scroll-mt-24"
        >
          {parseInline(title)}
        </h3>
      );
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      const quoteText = line.replace('> ', '');
      elements.push(
        <blockquote
          key={i}
          className="my-5 rounded-r-xl border-l-4 border-[#6955E8] bg-purple-50/50 p-4 text-xs sm:text-sm text-slate-700 italic"
        >
          {parseInline(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Paragraph
    elements.push(
      <p
        key={i}
        className="my-3.5 text-sm sm:text-base text-slate-700 leading-relaxed"
      >
        {parseInline(line)}
      </p>
    );
  }

  // Flush remaining
  if (inTable) flushTable(lines.length);
  if (inList) flushList(lines.length);
  if (inOrderedList) flushOrderedList(lines.length);

  return <div className="article-content font-normal">{elements}</div>;
}
