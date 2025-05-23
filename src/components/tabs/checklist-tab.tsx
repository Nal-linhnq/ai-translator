/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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

  const [copied, setCopied] = useState(false);
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
    const data = await response.json();
    setChecklistChecked(data.checklist);
    setChecklistLoading(false);
  };

  const handleToggleItem = (categoryIndex: number, itemIndex: number) => {
    const updatedChecklist = checklistState.checkList.map((category, cIdx) => {
      if (cIdx !== categoryIndex) return category;
      return {
        ...category,
        items: category.items.map((item, iIdx) =>
          iIdx === itemIndex ? { ...item, completed: !item.completed } : item
        ),
      };
    });
    setChecklistChecked(updatedChecklist);
  };

  const handleCopyToClipboard = () => {
    const text = checkList
      .map((category) => {
        return `## ${category.name}\n\n${category.items
          .map((item) => `- [ ] ${item.description}`)
          .join("\n")}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHappyPath = (description: string) => {
    return description.toLowerCase().includes("[happy path]");
  };

  const isAbnormalCase = (description: string) => {
    return description.toLowerCase().includes("[abnormal case]");
  };

  const completedItems = checkList.reduce((total, category) => {
    return total + category.items.filter((item) => item.completed).length;
  }, 0);

  const totalItems = checkList.reduce((total, category) => {
    return total + category.items.length;
  }, 0);

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

      {/* Results Section */}
      {checkList.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("frontEndCheckList")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("completedCheckList", {
                  completedItems,
                  totalItems,
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <div className="mb-4 overflow-x-auto pb-2">
                <TabsList className="flex-wrap h-auto">
                  <TabsTrigger value="all">
                    {t("all")} ({totalItems})
                  </TabsTrigger>
                  {checkList.map((category, index) => (
                    <TabsTrigger
                      key={index}
                      value={category.name.toLowerCase()}
                    >
                      {category.name} ({category.items.length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-6">
                {checkList.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      {category.name}
                      <span className="text-sm font-normal text-muted-foreground">
                        (
                        {category.items.filter((item) => item.completed).length}
                        /{category.items.length})
                      </span>
                    </h3>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li
                          key={item.id}
                          className="flex items-start gap-3 p-2 rounded hover:bg-muted/50"
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border cursor-pointer transition-colors ${
                              item.completed
                                ? "bg-primary border-primary"
                                : "border-primary/20 hover:border-primary/40"
                            }`}
                            onClick={() =>
                              handleToggleItem(categoryIndex, itemIndex)
                            }
                          >
                            {item.completed && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <div
                            className={`flex-1 ${
                              item.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                            onClick={() =>
                              handleToggleItem(categoryIndex, itemIndex)
                            }
                          >
                            {isHappyPath(item.description) ? (
                              <span className="mr-2 p-1 bg-green-50 text-green-700 border-green-200">
                                {t("happyCase")}
                              </span>
                            ) : isAbnormalCase(item.description) ? (
                              <span className="mr-2 p-1 bg-amber-50 text-amber-700 border-amber-200">
                                {t("abnormalCase")}
                              </span>
                            ) : null}
                            <span>
                              {item.description.replace(
                                /\[(Happy Path|Abnormal Case)\]\s*/i,
                                ""
                              )}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </TabsContent>

              {checkList.map((category, categoryIndex) => (
                <TabsContent
                  key={categoryIndex}
                  value={category.name.toLowerCase()}
                >
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 p-2 rounded hover:bg-muted/50"
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border cursor-pointer transition-colors ${
                            item.completed
                              ? "bg-primary border-primary"
                              : "border-primary/20 hover:border-primary/40"
                          }`}
                          onClick={() =>
                            handleToggleItem(categoryIndex, itemIndex)
                          }
                        >
                          {item.completed && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <div
                          className={`flex-1 ${
                            item.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                          onClick={() =>
                            handleToggleItem(categoryIndex, itemIndex)
                          }
                        >
                          {isHappyPath(item.description) ? (
                            <span className="mr-2 p-1 bg-green-50 text-green-700 border-green-200">
                              {t("happyCase")}
                            </span>
                          ) : isAbnormalCase(item.description) ? (
                            <span className="mr-2 p-1 bg-amber-50 text-amber-700 border-amber-200">
                              {t("abnormalCase")}
                            </span>
                          ) : null}
                          <span>
                            {item.description.replace(
                              /\[(Happy Path|Abnormal Case)\]\s*/i,
                              ""
                            )}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
