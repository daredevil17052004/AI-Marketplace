"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into blocks by double newlines or code block fences
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];

  let inList = false;
  let listItems: string[] = [];
  let isNumberedList = false;

  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      const items = [...listItems];
      const numbered = isNumberedList;
      blocks.push(
        numbered ? (
          <ol key={`list-${blocks.length}`} className="my-3 space-y-2 list-decimal list-inside pl-1 text-[#201515] text-sm leading-relaxed">
            {items.map((item, idx) => (
              <li key={idx} className="marker:font-bold marker:text-[#FF4F00]">
                {parseInline(item)}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={`list-${blocks.length}`} className="my-3 space-y-2 text-[#201515] text-sm leading-relaxed">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2 shrink-0" />
                <span className="flex-1">{parseInline(item)}</span>
              </li>
            ))}
          </ul>
        )
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const rows = [...tableRows];
      const header = rows[0];
      const body = rows.slice(1).filter((r) => !r.every((c) => c.match(/^:?-+:?$/))); // remove separator row

      blocks.push(
        <div key={`table-${blocks.length}`} className="my-4 overflow-x-auto rounded-xl border border-[#EAE3D9]">
          <table className="w-full text-left text-xs border-collapse">
            {header && (
              <thead className="bg-[#FAF5EE] border-b border-[#EAE3D9] text-[#201515] font-bold">
                <tr>
                  {header.map((col, i) => (
                    <th key={i} className="p-3">
                      {parseInline(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-[#F0EAE1] bg-white">
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#FFFDF9]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-[#5C524C]">
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block fences
    if (trimmed.startsWith("```")) {
      flushList();
      flushTable();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.replace("```", "").trim() || "text";
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        const code = codeBlockLines.join("\n");
        blocks.push(
          <CodeBlockItem
            key={`code-${blocks.length}`}
            code={code}
            lang={codeBlockLang}
          />
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Markdown Table row
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty line -> flush list or add spacer
    if (trimmed === "") {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1
          key={`h1-${blocks.length}`}
          className="font-heading font-extrabold text-[#201515] text-xl sm:text-2xl mt-5 mb-2.5 pb-1.5 border-b border-[#EAE3D9]"
        >
          {parseInline(trimmed.replace(/^#\s+/, ""))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2
          key={`h2-${blocks.length}`}
          className="font-heading font-bold text-[#201515] text-lg sm:text-xl mt-4 mb-2"
        >
          {parseInline(trimmed.replace(/^##\s+/, ""))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push(
        <h3
          key={`h3-${blocks.length}`}
          className="font-heading font-bold text-[#201515] text-base mt-3 mb-1.5"
        >
          {parseInline(trimmed.replace(/^###\s+/, ""))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      flushList();
      blocks.push(
        <h4
          key={`h4-${blocks.length}`}
          className="font-heading font-bold text-[#201515] text-sm mt-3 mb-1"
        >
          {parseInline(trimmed.replace(/^####\s+/, ""))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList();
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="my-3 pl-4 py-2 border-l-4 border-[#FF4F00] bg-[#FFF2EB]/50 rounded-r-xl text-xs sm:text-sm text-[#5C524C] italic"
        >
          {parseInline(trimmed.replace(/^>\s+/, ""))}
        </blockquote>
      );
      continue;
    }

    // Unordered List item (* or -)
    const bulletMatch = trimmed.match(/^[*•-]\s+(.+)/);
    if (bulletMatch) {
      inList = true;
      isNumberedList = false;
      listItems.push(bulletMatch[1]);
      continue;
    }

    // Ordered List item (1. 2. etc)
    const numberMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (numberMatch) {
      inList = true;
      isNumberedList = true;
      listItems.push(numberMatch[1]);
      continue;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList();
      blocks.push(<hr key={`hr-${blocks.length}`} className="my-5 border-[#EAE3D9]" />);
      continue;
    }

    // Standard paragraph line
    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm text-[#201515] leading-relaxed my-2">
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  flushTable();

  return <div className={`space-y-1.5 ${className}`}>{blocks}</div>;
}

// Inline formatting parser: **bold**, *italic*, `code`, and links
function parseInline(text: string): React.ReactNode[] {
  // Regex splitting by code tokens, bold, italic, or links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Inline Code: `code`
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`([\s\S]*)$/);
    // 2. Bold: **text** or __text__
    const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*([\s\S]*)$/);
    // 3. Italic: *text* or _text_
    const italicMatch = remaining.match(/^(.*?)\*([^*]+)\*([\s\S]*)$/);
    // 4. Link: [label](url)
    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)([\s\S]*)$/);

    // Find the earliest match
    const candidates = [
      codeMatch ? { type: "code", index: codeMatch[1].length, match: codeMatch } : null,
      boldMatch ? { type: "bold", index: boldMatch[1].length, match: boldMatch } : null,
      italicMatch ? { type: "italic", index: italicMatch[1].length, match: italicMatch } : null,
      linkMatch ? { type: "link", index: linkMatch[1].length, match: linkMatch } : null,
    ].filter(Boolean) as { type: string; index: number; match: RegExpMatchArray }[];

    if (candidates.length === 0) {
      parts.push(remaining);
      break;
    }

    // Pick closest to start
    candidates.sort((a, b) => a.index - b.index);
    const earliest = candidates[0];

    const prefix = earliest.match[1];
    if (prefix) {
      parts.push(prefix);
    }

    if (earliest.type === "code") {
      parts.push(
        <code
          key={`code-${keyIdx++}`}
          className="px-1.5 py-0.5 rounded-md bg-[#FAF5EE] text-[#D43F00] font-mono text-[12px] border border-[#EAE3D9]"
        >
          {earliest.match[2]}
        </code>
      );
      remaining = earliest.match[3];
    } else if (earliest.type === "bold") {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold text-[#201515]">
          {earliest.match[2]}
        </strong>
      );
      remaining = earliest.match[3];
    } else if (earliest.type === "italic") {
      parts.push(
        <em key={`italic-${keyIdx++}`} className="italic text-[#201515]">
          {earliest.match[2]}
        </em>
      );
      remaining = earliest.match[3];
    } else if (earliest.type === "link") {
      parts.push(
        <a
          key={`link-${keyIdx++}`}
          href={earliest.match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF4F00] hover:underline font-medium"
        >
          {earliest.match[2]}
        </a>
      );
      remaining = earliest.match[4];
    }
  }

  return parts;
}

function CodeBlockItem({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl bg-[#1C1614] border border-[#3A2D28] overflow-hidden text-xs font-mono shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[#140F0D] border-b border-[#2C211C] text-[#A69C96]">
        <span className="uppercase text-[10px] tracking-wider font-bold text-[#FF4F00]">{lang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre data-lenis-prevent className="p-4 overflow-auto custom-scrollbar overscroll-contain text-[#FAF5EE] leading-relaxed max-h-72">
        <code>{code}</code>
      </pre>
    </div>
  );
}
