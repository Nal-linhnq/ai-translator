"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Scissors, FileSearch } from "lucide-react";
import QuickActionButton from "@/components/ui/quick-action-button";
import CopyButton from "@/components/ui/copy-button";
import { useTranslation } from "next-i18next";
import { useAppStore } from "@/lib/store";
import { fetchStream } from "@/shared/fetchStream";

export default function SummarizeTab() {
  const {
    summarizeState,
    setSummarizeSourceText,
    setSummarizedText,
    setEditAction,
    setEditedText,
    setSummarizeLoading,
    translateState,
  } = useAppStore();

  const { sourceText, summarizedText, editedText, editAction, isLoading } =
    summarizeState;
  const { targetLanguage } = translateState;

  const { t } = useTranslation("common");

  const handleSummarize = async () => {
    if (!sourceText) return;

    setSummarizeLoading(true);

    fetchStream(
      "/api/summarize",
      {
        sourceText,
        targetLanguage,
      },
      setSummarizedText,
      setSummarizeLoading
    );
  };

  const handleEditAction = async (action: string) => {
    setEditAction(action);
    setSummarizeLoading(true);

    let result = "";

    if (action === "concise") {
      result =
        "Option 1 (Make More Concise): Shorten the text while preserving key points.";
    } else if (action === "detailed") {
      result =
        "Option 2 (Make More Detailed): Add more details and explanations for better clarity.";
    }

    fetchStream(
      "/api/summarize",
      {
        sourceText: summarizedText,
        targetLanguage,
        action: result,
      },
      setEditedText,
      setSummarizeLoading
    );
  };

  const quickActions = [
    {
      id: "concise",
      icon: Scissors,
      title: t("makeMoreConcise"),
      description: t("conciseDescription"),
    },
    {
      id: "detailed",
      icon: FileSearch,
      title: t("makeMoreDetailed"),
      description: t("detailedDescription"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("summarizeTitle")}</CardTitle>
        <CardDescription>{t("summarizeDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="source-text-summary">{t("sourceText")}</Label>
          <Textarea
            id="source-text-summary"
            placeholder={t("summarizeTextPlaceholder")}
            className="min-h-[150px]"
            value={sourceText}
            onChange={(e) => setSummarizeSourceText(e.target.value)}
          />
        </div>
        {summarizedText && (
          <>
            <div className="space-y-2">
              <Label htmlFor="summarized-text">{t("summary")}</Label>
              <div className="relative">
                <Textarea
                  id="summarized-text"
                  className="min-h-[150px]"
                  value={summarizedText}
                  readOnly
                />
                <CopyButton text={summarizedText} />
              </div>
            </div>

            {/* Edit Actions */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">{t("refineSummary")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <QuickActionButton
                    key={action.id}
                    id={action.id}
                    icon={action.icon}
                    title={action.title}
                    isActive={editAction === action.id}
                    isLoading={isLoading}
                    onClick={() => handleEditAction(action.id)}
                    description={action.description}
                  />
                ))}
              </div>
            </div>

            {editedText && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="edited-text">{t("editedText")}</Label>
                <div className="relative">
                  <Textarea
                    id="edited-text"
                    className="min-h-[150px]"
                    value={editedText}
                    readOnly
                  />
                  <CopyButton text={editedText} />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSummarize}
          disabled={!sourceText || isLoading}
          className="w-full"
        >
          {isLoading ? t("summarizing") : t("summarizeButton")}
        </Button>
      </CardFooter>
    </Card>
  );
}
