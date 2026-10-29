import React from 'react';

/**
 * Lightweight, safe parser for assistant messages supporting:
 * - Bold (**text**)
 * - Italic (*text*)
 * - Unordered lists (- item or * item)
 * - Numbered lists (1. item)
 * - Basic markdown tables
 * - Code/blocks
 * - Paragraph breaks
 */
export function renderFormattedText(content: string): React.ReactNode {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
  let inTable: string[][] | null = null;

  const flushList = () => {
    if (inList) {
      if (inList.type === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 list-disc pl-5 text-[15px] leading-relaxed">
            {inList.items.map((item, idx) => (
              <li key={idx} className="marker:text-amber-700/60">
                {item}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2 space-y-1.5 list-decimal pl-5 text-[15px] leading-relaxed">
            {inList.items.map((item, idx) => (
              <li key={idx} className="marker:text-amber-700/60">
                {item}
              </li>
            ))}
          </ol>
        );
      }
      inList = null;
    }
  };

  const flushTable = () => {
    if (inTable && inTable.length > 0) {
      const headerRow = inTable[0];
      const bodyRows = inTable.slice(1);
      elements.push(
        <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-lg border border-stone-200/80 bg-white/50 text-[13.5px]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/70 font-semibold text-stone-700">
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3 py-2">
                    {parseInlineFormatting(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-stone-100 last:border-none hover:bg-stone-50/60">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-stone-700">
                      {parseInlineFormatting(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Table row detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      // Skip markdown divider row like |---|---|
      const isDivider = cells.every((c) => /^:?-+:?$/.test(c));
      if (!isDivider) {
        if (!inTable) inTable = [];
        inTable.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // List detection
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!inList || inList.type !== 'ul') {
        flushList();
        inList = { type: 'ul', items: [] };
      }
      inList.items.push(parseInlineFormatting(ulMatch[1]));
      continue;
    }

    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || inList.type !== 'ol') {
        flushList();
        inList = { type: 'ol', items: [] };
      }
      inList.items.push(parseInlineFormatting(olMatch[2]));
      continue;
    }

    // Not in list
    flushList();

    if (!trimmed) {
      // Empty line -> spacing
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // Header level 2 or 3
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="mt-3 mb-1 text-[15px] font-semibold tracking-tight text-stone-900">
          {parseInlineFormatting(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-1.5 text-[16px] font-bold tracking-tight text-stone-900">
          {parseInlineFormatting(trimmed.slice(3))}
        </h3>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1 text-[15px] leading-relaxed text-stone-800">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  }

  flushList();
  flushTable();

  return elements;
}

/**
 * Handle inline bold **bold**, italic *italic*, code `code`, and currency highlights
 */
function parseInlineFormatting(text: string): React.ReactNode {
  // Regex to split tokens by bold, code, and currency
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|₹[\d,]+(?:\.\d+)?)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-stone-900">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      parts.push(
        <code key={`c-${match.index}`} className="rounded bg-stone-200/70 px-1 py-0.5 font-mono text-[13px] text-stone-800">
          {matchedStr.slice(1, -1)}
        </code>
      );
    } else if (matchedStr.startsWith('₹')) {
      parts.push(
        <span key={`curr-${match.index}`} className="font-medium text-stone-900">
          {matchedStr}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
