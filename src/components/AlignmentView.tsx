import { useState, useRef, useEffect } from "react";

import { colorMap } from "../consts/colorMap";

type Props = {
  firstValue: string;
  secondValue: string;
};

export const AlignmentView = ({ firstValue, secondValue }: Props) => {
  const length = Math.min(firstValue.length, secondValue.length);

  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const getColoredSpans = (value: string, compareWith?: string) => {
    return value
      .slice(0, length)
      .split("")
      .map((char, idx) => {
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

  return (
    <div onMouseUp={handleMouseUp} className="mt-4 break-words leading-[2rem]">
      <div>{getColoredSpans(firstValue)}</div>
      <div>{getColoredSpans(secondValue, firstValue)}</div>
      {copied && (
        <div
          className={`absolute top-[20px] right-[20px] bg-[#333] text-white px-1 py-2
                rounded-md ${
                  copied ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300 ease-in`}
        >
          Последовательность скопирована!
        </div>
      )}
    </div>
  );
};
