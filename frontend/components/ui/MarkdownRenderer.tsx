"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Parse markdown và render thành JSX
  const parseMarkdown = (text: string): React.ReactNode[] => {

    // Split by newlines để xử lý từng dòng
    const lines = text.split("\n");
    const processedLines: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === "") {
        processedLines.push(<br key={`br-${lineIndex}`} />);
        return;
      }

      // Tính indentation level (số khoảng trắng/tab ở đầu dòng)
      const indentMatch = line.match(/^(\s*)/);
      const indentLevel = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0; // Mỗi 2 spaces = 1 level

      // Check for headers (## hoặc ###)
      const headerMatch = trimmedLine.match(/^(#{2,3})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const HeaderTag = level === 2 ? "h2" : "h3";
        processedLines.push(
          React.createElement(
            HeaderTag,
            {
              key: `header-${lineIndex}`,
              className: level === 2
                ? "text-lg font-bold text-gray-900 mt-4 mb-2"
                : "text-base font-semibold text-gray-800 mt-3 mb-1",
            },
            parseInlineMarkdown(text)
          )
        );
        return;
      }

      // Check for bullet points (•, -, *, hoặc Unicode bullet)
      const bulletMatch = trimmedLine.match(/^[•\-\*]\s+(.+)$/);
      if (bulletMatch) {
        // Xác định style bullet dựa trên indentation level
        let bulletClass = "ml-4 list-disc text-sm"; // Cấp 0: disc (•)
        let bulletStyle: React.CSSProperties = {};
        
        if (indentLevel === 1) {
          // Cấp 1: circle (◦)
          bulletClass = "ml-8 list-[circle] text-sm";
        } else if (indentLevel >= 2) {
          // Cấp 2+: square (▪)
          bulletClass = "ml-12 list-[square] text-sm";
        }
        
        processedLines.push(
          <li
            key={`list-${lineIndex}-${indentLevel}`}
            className={bulletClass}
            style={bulletStyle}
          >
            {parseInlineMarkdown(bulletMatch[1])}
          </li>
        );
        return;
      }

      // Check for ordered list
      const orderedListMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (orderedListMatch) {
        processedLines.push(
          <li
            key={`ordered-list-${lineIndex}`}
            className="ml-4 list-decimal text-sm"
          >
            {parseInlineMarkdown(orderedListMatch[1])}
          </li>
        );
        return;
      }

      // Check for lines that look like section headers (text ending with colon, possibly with parentheses)
      // Example: "Khởi động (5-10 phút):" or "Bài tập chính:"
      const sectionHeaderMatch = trimmedLine.match(/^(.+?)\s*\([^)]+\)\s*:\s*$/);
      if (sectionHeaderMatch) {
        processedLines.push(
          <p key={`section-${lineIndex}`} className="text-sm font-semibold text-gray-800 mt-3 mb-2">
            {parseInlineMarkdown(trimmedLine)}
          </p>
        );
        return;
      }

      // Check for simple section headers (text ending with colon)
      if (trimmedLine.endsWith(":") && trimmedLine.length < 50) {
        processedLines.push(
          <p key={`section-simple-${lineIndex}`} className="text-sm font-semibold text-gray-800 mt-3 mb-2">
            {parseInlineMarkdown(trimmedLine)}
          </p>
        );
        return;
      }

      // Regular paragraph
      processedLines.push(
        <p key={`para-${lineIndex}`} className="text-sm mb-2">
          {parseInlineMarkdown(trimmedLine)}
        </p>
      );
    });

    // Group consecutive list items
    const grouped: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let listType: "ul" | "ol" | null = null;
    let currentIndentLevel = -1;

    processedLines.forEach((node, index) => {
      if (React.isValidElement(node) && node.type === "li") {
        const className = (node.props.className || "") as string;
        // Xác định indent level từ className
        let indentLevel = 0;
        if (className.includes("ml-8")) indentLevel = 1;
        else if (className.includes("ml-12")) indentLevel = 2;
        
        // Kiểm tra loại bullet (disc, circle, square, hoặc decimal)
        const isUnordered = className.includes("list-disc") || 
                           className.includes("list-[circle]") || 
                           className.includes("list-[square]");
        const isOrdered = className.includes("list-decimal");
        
        if (isUnordered) {
          // Xử lý unordered list (disc, circle, square)
          if (listType !== "ul" || currentIndentLevel !== indentLevel) {
            if (currentList.length > 0 && listType) {
              grouped.push(
                React.createElement(
                  listType,
                  {
                    key: `list-${index}-${currentIndentLevel}`,
                    className: currentIndentLevel === 0
                      ? "my-2 space-y-1"
                      : currentIndentLevel === 1
                      ? "my-1 space-y-0.5 ml-4"
                      : "my-1 space-y-0.5 ml-8",
                  },
                  currentList
                )
              );
            }
            currentList = [];
            listType = "ul";
            currentIndentLevel = indentLevel;
          }
          currentList.push(node);
        } else if (isOrdered) {
          if (listType !== "ol" || currentIndentLevel !== indentLevel) {
            if (currentList.length > 0 && listType) {
              grouped.push(
                React.createElement(
                  listType,
                  {
                    key: `list-${index}-${currentIndentLevel}`,
                    className: currentIndentLevel === 0
                      ? "my-2 space-y-1"
                      : currentIndentLevel === 1
                      ? "my-1 space-y-0.5 ml-4"
                      : "my-1 space-y-0.5 ml-8",
                  },
                  currentList
                )
              );
            }
            currentList = [];
            listType = "ol";
            currentIndentLevel = indentLevel;
          }
          currentList.push(node);
        } else {
          if (currentList.length > 0 && listType) {
            grouped.push(
              React.createElement(listType, { key: `list-${index}`, className: "my-2 space-y-1" }, currentList)
            );
            currentList = [];
            listType = null;
          }
          grouped.push(node);
        }
      } else {
        if (currentList.length > 0 && listType) {
          grouped.push(
            React.createElement(listType, { key: `list-${index}`, className: "my-2 space-y-1" }, currentList)
          );
          currentList = [];
          listType = null;
        }
        grouped.push(node);
      }
    });

    if (currentList.length > 0 && listType) {
      grouped.push(
        React.createElement(
          listType,
          {
            key: `list-final-${currentIndentLevel || 0}`,
            className: (currentIndentLevel || 0) === 0
              ? "my-2 space-y-1"
              : (currentIndentLevel || 0) === 1
              ? "my-1 space-y-0.5 ml-4"
              : "my-1 space-y-0.5 ml-8",
          },
          currentList
        )
      );
    }

    return grouped;
  };

  // Parse inline markdown (bold, italic, code, links)
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    // Combined regex để match tất cả inline elements
    const combinedRegex = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <React.Fragment key={`text-${key++}`}>
            {text.substring(lastIndex, match.index)}
          </React.Fragment>
        );
      }

      // Process match
      if (match[1].startsWith("**") || match[1].startsWith("__")) {
        // Bold
        const boldText = match[2] || match[3];
        parts.push(
          <strong key={`bold-${key++}`} className="font-semibold">
            {boldText}
          </strong>
        );
      } else if (match[1].startsWith("*") || match[1].startsWith("_")) {
        // Italic
        const italicText = match[4] || match[5];
        parts.push(
          <em key={`italic-${key++}`} className="italic">
            {italicText}
          </em>
        );
      } else if (match[1].startsWith("`")) {
        // Code
        const codeText = match[6];
        parts.push(
          <code
            key={`code-${key++}`}
            className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800"
          >
            {codeText}
          </code>
        );
      } else if (match[1].startsWith("[")) {
        // Link
        const linkText = match[7];
        const linkUrl = match[8];
        parts.push(
          <a
            key={`link-${key++}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            {linkText}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <React.Fragment key={`text-${key++}`}>
          {text.substring(lastIndex)}
        </React.Fragment>
      );
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={`markdown-content ${className}`.trim()}>
      {parseMarkdown(content)}
    </div>
  );
}

