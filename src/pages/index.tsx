import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Button, Textarea } from "@headlessui/react";
import { Check, Copy } from "lucide-react";
import { LANGUAGES } from "@/shared/constants";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Head from "next/head";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import MarkdownEditor from "@/components/MarkdownEditor";
import TurndownService from "turndown";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export default function Home() {
  const { t } = useTranslation("common");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [summary, setSummary] = useState("");
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [targetLang, setTargetLang] = useState("English");
  const [copied, setCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useEffect(() => {
    setUndoStack((prev) => [...prev, inputText]);
  }, [inputText]);

  const undo = () => {
    if (undoStack.length > 1) {
      const lastState = undoStack[undoStack.length - 2];
      setRedoStack((prev) => [inputText, ...prev]);
      setUndoStack((prev) => prev.slice(0, -1));
      setInputText(lastState);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack((prev) => [...prev, inputText]);
      setRedoStack((prev) => prev.slice(1));
      setInputText(nextState);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey) {
      if (event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.key === "y") {
        event.preventDefault();
        redo();
      }
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoadingTranslate(true);
    setTranslatedText("");

    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText, targetLang }),
    });

    const data = await res.json();
    setTranslatedText(data.text);
    setLoadingTranslate(false);
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setLoadingSummary(true);
    setSummary("");

    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText, targetLang }),
    });

    const data = await response.json();
    setSummary(data.summary);
    setLoadingSummary(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    const timerId = setTimeout(() => setCopied(null), 2000);
    clearTimeout(timerId);
  };

  const handlePaste = async (
    event: React.ClipboardEvent<HTMLTextAreaElement>
  ) => {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const plainText = clipboardData.getData("text/plain");
    const htmlText = clipboardData.getData("text/html");
    let markdownText = plainText;

    if (htmlText) {
      const turndownService = new TurndownService({
        headingStyle: "atx",
        bulletListMarker: "-",
        codeBlockStyle: "fenced",
      });

      turndownService.addRule("preformatted", {
        filter: ["pre"],
        replacement: function (content) {
          return "```\n" + content + "\n```";
        },
      });

      turndownService.addRule("bold", {
        filter: ["b", "strong"],
        replacement: function (content) {
          return `**${content}**`;
        },
      });

      turndownService.addRule("italic", {
        filter: ["i", "em"],
        replacement: function (content) {
          return `*${content}*`;
        },
      });

      markdownText = turndownService.turndown(htmlText);
    }

    setInputText((prev) => {
      const textarea = event.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      return prev.substring(0, start) + markdownText + prev.substring(end);
    });
  };

  return (
    <>
      <Head>
        <title>🌍 AI Translator & Summarizer</title>
        <meta
          name="description"
          content="Translate and summarize text using AI."
        />
        <meta name="robots" content="noindex" />
      </Head>
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold">🌍 {t("title")}</h1>
          <LanguageSwitcher />
        </div>

        <MarkdownEditor markdown={inputText} setMarkdown={setInputText} />

        <Textarea
          id="markdown-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          rows={6}
          className="w-full p-3 border whitespace-pre-wrap break-words rounded-md focus:ring focus:ring-blue-300"
        />
        {/* SELECT LANGUAGE */}
        <div>
          <label className="block text-sm font-semibold">{t("label")}</label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full p-2 border rounded-md cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleTranslate}
            disabled={loadingTranslate}
            className="w-full sm:w-auto rounded-md bg-indigo-500 cursor-pointer px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {loadingTranslate ? t("translating") : t("translate")}
          </Button>
          <Button
            onClick={handleSummarize}
            disabled={loadingSummary}
            className="w-full sm:w-auto rounded-md bg-indigo-500 cursor-pointer px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {loadingSummary ? t("summarizing") : t("summary")}
          </Button>
          <Button
            onClick={() => setPreview(!preview)}
            disabled={inputText.trim().length === 0}
            className="w-full sm:w-auto rounded-md bg-indigo-500 cursor-pointer px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {preview ? t("hidePreview") : t("showPreview")}
          </Button>
        </div>

        {/* TRANSLATED TEXT */}
        <div className="relative p-4 bg-gray-100  rounded-md">
          <p className="font-semibold">{t("translate")}:</p>
          <MarkdownRenderer content={translatedText} />
          {translatedText && (
            <button
              onClick={() => copyToClipboard(translatedText)}
              className="absolute top-3 right-3 text-gray-600  hover:text-gray-900 transition"
            >
              {copied === translatedText ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* SUMMARY */}
        <div className="relative p-4 bg-gray-100  rounded-md">
          <p className="font-semibold">{t("summary")}:</p>
          <MarkdownRenderer content={summary} />
          {summary && (
            <Button
              onClick={() => copyToClipboard(summary)}
              className="absolute top-3 right-3 text-gray-600  hover:text-gray-900 transition"
            >
              {copied === summary ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>

        {/* PREVIEW */}
        {preview && (
          <div className="p-4 bg-gray-100  rounded-md">
            <p className="font-semibold">{t("preview")}:</p>
            <MarkdownRenderer content={inputText} />
          </div>
        )}
      </div>
    </>
  );
}
