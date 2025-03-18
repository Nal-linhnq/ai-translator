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
  markdown: string;
  setMarkdown: (markdown: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  markdown,
  setMarkdown,
}) => {
  const insertAtCursor = (
    before: string,
    after: string = "",
    placeholder = "",
    isMultiLine = false
  ) => {
    const textarea = document.getElementById(
      "markdown-input"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end) || placeholder;

    let newText = selectedText;

    if (isMultiLine) {
      const lines = selectedText.split("\n");
      if (before === "1. ") {
        newText = lines.map((line, i) => `${i + 1}. ${line}`).join("\n");
      } else {
        newText = lines.map((line) => `${before}${line}`).join("\n");
      }
    } else {
      newText = before + selectedText + after;
    }

    setMarkdown(
      markdown.substring(0, start) + newText + markdown.substring(end)
    );

    setTimeout(() => {
      textarea.setSelectionRange(
        start + before.length,
        start + newText.length - after.length
      );
    }, 0);
  };

  return (
    <div className="grid grid-cols-8 gap-2">
      {[
        {
          icon: <Bold size={16} />,
          action: () => insertAtCursor("**", "**", "bold"),
          label: "Bold",
        },
        {
          icon: <Italic size={16} />,
          action: () => insertAtCursor("_", "_", "italic"),
          label: "Italic",
        },
        {
          icon: <Strikethrough size={16} />,
          action: () => insertAtCursor("~~", "~~", "strike"),
          label: "Strike",
        },
        {
          icon: <Link size={16} />,
          action: () =>
            insertAtCursor("[Link text](https://example.com/)", "", "link"),
          label: "Link",
        },
        {
          icon: <List size={16} />,
          action: () => insertAtCursor("- ", "", "list item", true),
          label: "Bullet List",
        },
        {
          icon: <ListOrdered size={16} />,
          action: () => insertAtCursor("1. ", "", "list item", true),
          label: "Number List",
        },
        {
          icon: <Quote size={16} />,
          action: () => insertAtCursor("> ", "", "quote", true),
          label: "Quote",
        },
        {
          icon: <Code size={16} />,
          action: () => insertAtCursor("`", "`", "code"),
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
