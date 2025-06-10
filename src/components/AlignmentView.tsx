import { useState, useRef, useEffect, useCallback } from "react";
import { colorMap } from "../consts/colorMap";

type Props = {
  firstValue: string;
  secondValue: string;
};

// Измеряет ширину одного символа с учётом реальных стилей
const measureCharWidth = (container: HTMLDivElement | null): number => {
  if (!container) return 8; // безопасный fallback

  const span = document.createElement("span");
  span.innerText = "A";
  span.style.visibility = "hidden";
  span.style.position = "absolute";
  span.style.whiteSpace = "pre";
  span.style.fontFamily = getComputedStyle(container).fontFamily;
  span.style.fontSize = getComputedStyle(container).fontSize;
  container.appendChild(span);

  const width = span.getBoundingClientRect().width;
  container.removeChild(span);
  return width;
};

// Разбивает строки на пары чанков по размеру
const getPairedChunks = (
  a: string,
  b: string,
  size: number
): [string, string][] => {
  const minLength = Math.min(a.length, b.length);
  const aTrimmed = a.slice(0, minLength);
  const bTrimmed = b.slice(0, minLength);
  const chunks: [string, string][] = [];

  for (let i = 0; i < minLength; i += size) {
    chunks.push([aTrimmed.slice(i, i + size), bTrimmed.slice(i, i + size)]);
  }

  return chunks;
};

export const AlignmentView = ({ firstValue, secondValue }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [chunkSize, setChunkSize] = useState(80);
  const copyTimeoutRef = useRef<number | null>(null);

  // Обновляем chunkSize при изменении размеров
  const updateChunkSize = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const charWidth = measureCharWidth(containerRef.current);
    const charsPerLine = Math.floor(containerWidth / charWidth);
    if (charsPerLine > 0) setChunkSize(charsPerLine);
  }, []);

  useEffect(() => {
    updateChunkSize();
    const resizeObserver = new ResizeObserver(() => {
      updateChunkSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [updateChunkSize]);

  // Копирование текста по выделению
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      navigator.clipboard.writeText(selectedText).then(() => {
        setCopied(true);
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = window.setTimeout(() => {
          setCopied(false);
        }, 1000);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Отображение символов с цветом
  const getColoredSpans = (value: string, compareWith?: string) => {
    const length = Math.min(value.length, compareWith?.length || value.length);
    return value.slice(0, length).split("").map((char, idx) => {
      const isDifferent = compareWith ? char !== compareWith[idx] : false;
      const bgColor = isDifferent
        ? colorMap[char] || "transparent"
        : colorMap[char] && !compareWith
        ? colorMap[char]
        : "transparent";

      return (
        <span
          key={idx}
          style={{
            backgroundColor: bgColor,
          }}
        >
          {char}
        </span>
      );
    });
  };

  const pairedChunks = getPairedChunks(firstValue, secondValue, chunkSize);

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className="mt-4 leading-[2rem] font-mono relative whitespace-pre box-border p-0"
    >
      {pairedChunks.map(([first, second], i) => (
        <div key={i}>
          <div>{getColoredSpans(first)}</div>
          <div>{getColoredSpans(second, first)}</div>
        </div>
      ))}
      {copied && (
        <div className="absolute top-[20px] right-[20px] bg-[#333] text-white px-1 py-2 rounded-md transition-opacity duration-300 ease-in opacity-100">
          Последовательность скопирована!
        </div>
      )}
    </div>
  );
};
