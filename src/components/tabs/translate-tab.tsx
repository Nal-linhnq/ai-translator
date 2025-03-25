"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/ui/copy-button";
import { useTranslation } from "next-i18next";
import { useAppStore } from "@/lib/store";

export default function TranslateTab() {
  const {
    translateState,
    setSourceText,
    setTranslatedText,
    setTargetLanguage,
    setTranslateLoading,
  } = useAppStore();

  const { sourceText, translatedText, targetLanguage, isLoading } =
    translateState;

  const { t } = useTranslation("common");

  const handleTranslate = async () => {
    if (!sourceText) return;
    setTranslateLoading(true);

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceText,
        targetLanguage,
      }),
    });

    const data = await response.json();
    setTranslatedText(data.translatedText);
    setTranslateLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("translateTitle")}</CardTitle>
        <CardDescription>{t("translateDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="source-text">{t("sourceText")}</Label>
          <Textarea
            id="source-text"
            placeholder={t("sourceTextPlaceholder")}
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
        {translatedText && (
          <div className="space-y-2">
            <Label htmlFor="translated-text">{t("translatedText")}</Label>
            <div className="relative">
              <Textarea
                id="translated-text"
                className="min-h-[150px]"
                value={translatedText}
                readOnly
              />
              <CopyButton text={translatedText} />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleTranslate}
          disabled={!sourceText || isLoading}
          className="w-full"
        >
          {isLoading ? t("translating") : t("translateButton")}
        </Button>
      </CardFooter>
    </Card>
  );
}
