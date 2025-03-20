import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Textarea } from "@headlessui/react";
import { Check, Copy } from "lucide-react";
import { HELLO_TEXTS, LANGUAGES } from "@/shared/constants";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Head from "next/head";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import MarkdownEditor from "@/components/MarkdownEditor";
import TurndownService from "turndown";
import { AnimatePresence, motion } from "framer-motion";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});

export default function Home() {
  const { t } = useTranslation("common");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState("English");
  const [copied, setCopied] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [mode, setMode] = useState("translate");
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    let interval = null;

    interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % HELLO_TEXTS.length);
    }, 3000);

    if (result) {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [result]);

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

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult("");

    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText, targetLang, mode }),
    });

    const data = await response.json();
    setResult(data.summary);
    setLoading(false);
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
      <div className="relative max-w-2xl mx-auto p-6 space-y-4">
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
            className={`w-full p-2 border rounded-md cursor-pointer ${
              mode === "grammar" ? "bg-gray-100" : "bg-white"
            }`}
            disabled={mode === "grammar"}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* BUTTONS */}
        <p className="text-sm font-semibold mb-0">{t("mode")}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <button
            className={`px-4 cursor-pointer py-2 rounded text-md ${
              mode === "translate" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("translate")}
          >
            {t("translate")}
          </button>

          <button
            className={`px-4 cursor-pointer py-2 rounded text-md ${
              mode === "grammar" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("grammar")}
          >
            {t("grammar")}
          </button>

          <button
            className={`px-4 cursor-pointer py-2 rounded text-md ${
              mode === "summarize" ? "bg-yellow-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("summarize")}
          >
            {t("summarize")}
          </button>
          <button
            className={`px-4 cursor-pointer py-2 rounded text-md ${
              mode === "analyze" ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("analyze")}
          >
            {t("analyze")}
          </button>
        </div>

        <button
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded w-full"
          onClick={handleProcess}
          disabled={loading}
        >
          {loading ? t("processing") : t("submit")}
        </button>

        <div className="relative mt-4 p-6 border rounded bg-gray-100">
          {result ? (
            <>
              <MarkdownRenderer content={result} />
              <button
                onClick={() => copyToClipboard(result)}
                className="absolute top-3 right-3 text-gray-600  hover:text-gray-900 transition"
              >
                {copied === result ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-gray-700"
              >
                {HELLO_TEXTS[textIndex]}
              </motion.p>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}
