"use client";

import type React from "react";

import { useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  ImageIcon,
  Languages,
  Clipboard,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CopyButton from "@/components/ui/copy-button";
import { useTranslation } from "next-i18next";
import { useAppStore } from "@/lib/store";
import { imageToBase64 } from "@/shared/utils";
import { fetchStream } from "@/shared/fetchStream";

type QuickAction = "extract" | "translate" | null;

export default function ExtractTab() {
  const [pasteAreaActive, setPasteAreaActive] = useState(false);

  const {
    extractState,
    setUploadedFile,
    setExtractedText,
    setExtractTargetLanguage,
    setCurrentAction,
    setExtractLoading,
    setExtractError,
    resetExtractState,
    setTranslatedContent,
  } = useAppStore();

  const {
    uploadedFile,
    extractedText,
    translatedContent,
    targetLanguage,
    currentAction,
    isLoading,
    error,
  } = extractState;

  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation("common");

  const validateFile = (file: File): boolean => {
    setExtractError(null);

    if (file.type.includes("pdf")) {
      if (file.size > 5 * 1024 * 1024) {
        setExtractError(t("pdfLimit"));
        return false;
      }
    } else if (file.type.includes("image")) {
      if (file.size > 2 * 1024 * 1024) {
        setExtractError(t("imageLimit"));
        return false;
      }

      const validImageTypes = [
        "image/webp",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (!validImageTypes.includes(file.type)) {
        setExtractError(t("onlySupports"));
        return false;
      }
    } else {
      setExtractError(t("unsupportedFile"));
      return false;
    }

    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      setUploadedFile(file);
      setExtractLoading(false);
    } else if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageFile = async (fileData: File) => {
    setUploadedFile(fileData);
  };

  const handlePasteClick = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image")) {
            const blob = await item.getType(type);
            handleImageFile(
              new File([blob], `image-${Date.now()}.jpg`, {
                type: blob.type,
              })
            );
            return;
          }
        }
      }
      setExtractError(t("noImageCopy"));
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      setExtractError(t("noClipboardSupport"));
    }
  };

  const handleTranslate = async (dataText: string, lang?: string) => {
    setExtractLoading(true);

    fetchStream(
      "/api/translate",
      {
        sourceText: dataText,
        targetLanguage: lang || targetLanguage,
      },
      setTranslatedContent,
      setExtractLoading
    );
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (!uploadedFile) return;

    setExtractLoading(true);
    setCurrentAction(action);
    let dataText = extractedText;

    if (!extractedText) {
      if (uploadedFile.type.includes("image")) {
        const base64Image = await imageToBase64(uploadedFile);

        const res = await fetch("/api/extractImageText", {
          method: "POST",
          body: JSON.stringify({ base64Image }),
        });

        if (res.body) {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let newMessage = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            newMessage += chunk;
            setExtractedText(newMessage);
          }

          dataText = newMessage;
        }
      } else if (uploadedFile.type.includes("pdf")) {
        const formData = new FormData();
        formData.append("file", uploadedFile);

        const res = await fetch("/api/extractPdfText", {
          method: "POST",
          body: formData,
        });

        if (res.body) {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let newMessage = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            newMessage += chunk;
            setExtractedText(newMessage);
          }

          dataText = newMessage;
        }
      }
    }

    if (action === "translate" && dataText && !translatedContent) {
      handleTranslate(dataText);
    }

    setExtractLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("extractTitle")}</CardTitle>
        <CardDescription>{t("extractDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!uploadedFile ? (
          <div className="grid w-full items-center gap-4">
            <div>
              <Label htmlFor="file-upload">{t("uploadFile")}</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t("fileRestrictions")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("pasteImage")}</Label>
              <div
                ref={pasteAreaRef}
                className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
                  pasteAreaActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20"
                }`}
                onFocus={() => setPasteAreaActive(true)}
                onBlur={() => setPasteAreaActive(false)}
                onClick={() => {
                  pasteAreaRef.current?.focus();
                  handlePasteClick();
                }}
                tabIndex={0}
              >
                <Clipboard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{t("clickAndPaste")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("pasteSupports")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 border rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                {uploadedFile.type.includes("image") ? (
                  <ImageIcon className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className="font-medium">{uploadedFile.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({Math.round(uploadedFile.size / 1024)} KB)
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant={currentAction === "extract" ? "default" : "outline"}
                className="flex items-center justify-center gap-2 h-auto py-4"
                onClick={() => handleQuickAction("extract")}
              >
                <FileText className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t("extractText")}</span>
                  <span className="text-xs text-muted-foreground text-left">
                    {t("extractTextDescription")}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button
                variant={currentAction === "translate" ? "default" : "outline"}
                className="flex items-center justify-center gap-2 h-auto py-4"
                onClick={() => handleQuickAction("translate")}
              >
                <Languages className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t("translateContent")}</span>
                  <span className="text-xs text-muted-foreground text-left">
                    {t("translateContentDescription")}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>

            {/* Content based on selected action */}
            {currentAction === "extract" && extractedText && (
              <div className="space-y-2">
                <Label htmlFor="extracted-text">{t("extractedText")}</Label>
                <div className="relative">
                  <Textarea
                    id="extracted-text"
                    className="min-h-[150px]"
                    value={extractedText}
                    readOnly
                  />
                  <CopyButton text={extractedText} />
                </div>
              </div>
            )}

            {currentAction === "translate" && translatedContent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="translated-content">
                    {t("translatedContent")}
                  </Label>
                  <Select
                    value={targetLanguage}
                    onValueChange={(lang) => {
                      setExtractTargetLanguage(lang);
                      handleTranslate(extractedText, lang);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Textarea
                    id="translated-content"
                    className="min-h-[150px]"
                    value={translatedContent}
                    readOnly
                  />
                  <CopyButton text={translatedContent} />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            resetExtractState();
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? t("processing") : t("clearButton")}
        </Button>
      </CardFooter>
    </Card>
  );
}
