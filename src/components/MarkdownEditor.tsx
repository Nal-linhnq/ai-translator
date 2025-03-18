import React from "react";
import {
  Bold,
  Italic,
  Link,
  List,
  Code,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react";
import { Button } from "@headlessui/react";

interface MarkdownEditorProps {
  setMarkdown: (markdown: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ setMarkdown }) => {
  const insertMarkdown = (tag: string, wrapText = false) => {
    const textarea = document.getElementById(
      "markdown-input"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const after = text.substring(end);
    const selected = text.substring(start, end);

    const newText = wrapText
      ? `${before}${tag}${selected}${tag}${after}`
      : `${before}${tag}${after}`;
    setMarkdown(newText);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="grid grid-cols-8 gap-2">
      {[
        {
          icon: <Bold size={16} />,
          action: () => insertMarkdown("**", true),
          label: "Bold",
        },
        {
          icon: <Italic size={16} />,
          action: () => insertMarkdown("_", true),
          label: "Italic",
        },
        {
          icon: <Strikethrough size={16} />,
          action: () => insertMarkdown("~~", true),
          label: "Strike",
        },
        {
          icon: <Link size={16} />,
          action: () => insertMarkdown("[Link](https://)", false),
          label: "Link",
        },
        {
          icon: <List size={16} />,
          action: () => insertMarkdown("- ", false),
          label: "Bullet List",
        },
        {
          icon: <ListOrdered size={16} />,
          action: () => insertMarkdown("1. ", false),
          label: "Number List",
        },
        {
          icon: <Quote size={16} />,
          action: () => insertMarkdown("> ", false),
          label: "Quote",
        },
        {
          icon: <Code size={16} />,
          action: () => insertMarkdown("```\ncode\n```", false),
          label: "Code Block",
        },
      ].map(({ icon, action, label }, idx) => (
        <Button
          key={idx}
          onClick={action}
          className="p-2 border cursor-pointer rounded-lg flex items-center justify-center group hover:bg-gray-100 transition"
          title={label}
        >
          <span className="text-gray-700 group-hover:text-black">{icon}</span>
        </Button>
      ))}
    </div>
  );
};

export default MarkdownEditor;
