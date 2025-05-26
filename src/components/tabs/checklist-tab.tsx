/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "next-i18next";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import CopyButton from "../ui/copy-button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function ChecklistTab() {
  const {
    checklistState,
    translateState,
    setSourceText,
    setTargetLanguage,
    setChecklistLoading,
    setChecklistChecked,
    setChecklistContext,
  } = useAppStore();

  const { sourceText, targetLanguage } = translateState;
  const { checkList, isLoading, context } = checklistState;

  const { t } = useTranslation("common");

  const handleGenCheckList = async () => {
    if (!sourceText || !context) return;
    setChecklistLoading(true);

    const response = await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceText,
        targetLanguage,
        context,
      }),
    });

    if (!response.ok) {
      console.error("Error fetching checklist");
      setChecklistLoading(false);
      return;
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported or empty response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      const cleaned = accumulatedText.replace(
        /^```(?:markdown)?\s*|```$/gim,
        ""
      );
      setChecklistChecked(cleaned);
    }

    setChecklistLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("checkListTitle")}</CardTitle>
          <CardDescription>{t("checkListDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-text">{t("context")}</Label>
            <Textarea
              id="context-text"
              placeholder={t("contextPlaceholder")}
              className="min-h-[150px]"
              value={context}
              onChange={(e) => setChecklistContext(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-text">{t("specifications")}</Label>
            <Textarea
              id="source-text"
              placeholder={t("specificationsPlaceholder")}
              className="min-h-[150px]"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="language" className="flex-shrink-0">
              {t("translateTo")}
            </Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="language" className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenCheckList}
            disabled={!sourceText || isLoading}
            className="w-full"
          >
            {isLoading ? t("checkListGenerating") : t("checkListButton")}
          </Button>
        </CardFooter>
      </Card>

      {checkList && (
        <Card>
          <CardContent>
            <div className="relative prose max-w-none dark:prose-invert prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-table:my-6 prose-table:w-full prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-tr:border-b prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded prose-pre:my-6">
              <CopyButton text={checkList} />
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="font-bold text-3xl mt-10 mb-6" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="font-bold text-2xl mt-8 mb-4" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="font-bold text-xl mt-6 mb-3" {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4 className="font-bold text-lg mt-4 mb-2" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 my-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 my-4" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <table
                      className="border-collapse border border-gray-300 w-full my-6"
                      {...props}
                    />
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="bg-gray-100 border px-3 py-2 font-semibold"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border px-3 py-2" {...props} />
                  ),
                  code: ({
                    inline,
                    children,
                    ...props
                  }: React.ComponentProps<"code"> & { inline?: boolean }) =>
                    inline ? (
                      <code
                        className="bg-muted px-1 rounded"
                        {...(props as React.ComponentProps<"code">)}
                      >
                        {children}
                      </code>
                    ) : (
                      <pre
                        className="bg-muted p-4 rounded overflow-x-auto my-6"
                        {...(props as React.ComponentProps<"pre">)}
                      >
                        <code>{children}</code>
                      </pre>
                    ),
                  p: ({ node, ...props }) => <p className="my-4" {...props} />,
                }}
              >
                {checkList}
              </Markdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
