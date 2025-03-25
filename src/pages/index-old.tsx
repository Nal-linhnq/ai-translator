"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Maximize2,
  Clipboard,
  AlertCircle,
  Globe,
  MessageSquare,
  Send,
  ArrowRight,
  Scissors,
  FileSearch,
  Briefcase,
  Check,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { imageToBase64 } from "@/shared/utils";

const translations = {
  en: {
    appTitle: "TextMaster",
    appDescription:
      "Translate, summarize, and extract text from images and PDFs",
    translate: "Translate",
    summarize: "Summarize",
    extract: "Extract Text",
    translateTitle: "Translate Text",
    translateDescription: "Enter text to translate into another language",
    sourceText: "Source Text",
    sourceTextPlaceholder: "Enter text to translate...",
    translateTo: "Translate to:",
    translatedText: "Translated Text",
    translateButton: "Translate",
    translating: "Translating...",
    summarizeTitle: "Summarize Text",
    summarizeDescription: "Enter long text to get a concise summary",
    summarizeTextPlaceholder: "Enter text to summarize...",
    summary: "Summary",
    summarizeButton: "Summarize",
    summarizing: "Summarizing...",
    extractTitle: "Extract Text from Files",
    extractDescription: "Upload an image or PDF to extract text",
    uploadFile: "Upload File",
    fileRestrictions: "PDF (max 5MB), Images: webp, png, jpg, jpeg (max 2MB)",
    pasteImage: "Or paste image from clipboard",
    clickAndPaste: "Click and paste image (Ctrl+V)",
    pasteSupports: "Supports webp, png, jpg, jpeg (max 2MB)",
    extractedText: "Extracted Text",
    clearButton: "Clear and Start Over",
    processing: "Processing...",
    howItWorks: "How It Works",
    translationFeature: "Translation",
    translationDescription:
      "Our advanced translation engine supports over 100 languages with high accuracy and natural-sounding results.",
    summarizationFeature: "Summarization",
    summarizationDescription:
      "AI-powered summarization condenses long documents while preserving key information and main points.",
    extractionFeature: "Text Extraction",
    extractionDescription:
      "Extract text from images and PDFs with high accuracy using advanced OCR technology.",
    error: "Error",
    languageSwitcher: "Language:",
    english: "English",
    japanese: "Japanese",
    extractText: "Extract Text",
    extractTextDescription: "Extract text from the document",
    translateContent: "Translate Content",
    translateContentDescription: "Translate the extracted content",
    askQuestions: "Ask Questions",
    askQuestionsDescription: "Ask questions about the content",
    translatedContent: "Translated Content",
    askAboutDocument: "Ask about the document",
    askQuestionPlaceholder: "Ask a question about the document...",
    chatWelcome: "Hello! What would you like to know about this document?",
    makeMoreConcise: "Make More Concise",
    makeMoreDetailed: "Make More Detailed",
    makeMoreProfessional: "Make More Professional",
    fixGrammar: "Fix Grammar",
    conciseDescription: "Shorten the text while preserving key points",
    detailedDescription: "Add more details and explanations",
    professionalDescription: "Make the text more formal and professional",
    grammarDescription: "Correct grammar and spelling errors",
    editedText: "Edited Text",
  },
  ja: {
    appTitle: "テキストマスター",
    appDescription: "テキストの翻訳、要約、画像やPDFからのテキスト抽出",
    translate: "翻訳",
    summarize: "要約",
    extract: "テキスト抽出",
    translateTitle: "テキスト翻訳",
    translateDescription: "他の言語に翻訳するテキストを入力してください",
    sourceText: "原文",
    sourceTextPlaceholder: "翻訳するテキストを入力...",
    translateTo: "翻訳先:",
    translatedText: "翻訳されたテキスト",
    translateButton: "翻訳する",
    translating: "翻訳中...",
    summarizeTitle: "テキスト要約",
    summarizeDescription: "長いテキストを入力して簡潔な要約を取得",
    summarizeTextPlaceholder: "要約するテキストを入力...",
    summary: "要約",
    summarizeButton: "要約する",
    summarizing: "要約中...",
    extractTitle: "ファイルからテキストを抽出",
    extractDescription: "画像やPDFをアップロードしてテキストを抽出",
    uploadFile: "ファイルをアップロード",
    fileRestrictions: "PDF (最大5MB)、画像: webp, png, jpg, jpeg (最大2MB)",
    pasteImage: "またはクリップボードから画像を貼り付け",
    clickAndPaste: "クリックして画像を貼り付け (Ctrl+V)",
    pasteSupports: "対応形式: webp, png, jpg, jpeg (最大2MB)",
    extractedText: "抽出されたテキスト",
    clearButton: "クリアして再開",
    processing: "処理中...",
    howItWorks: "仕組み",
    translationFeature: "翻訳",
    translationDescription:
      "高度な翻訳エンジンは100以上の言語をサポートし、高精度で自然な翻訳結果を提供します。",
    summarizationFeature: "要約",
    summarizationDescription:
      "AI駆動の要約機能は、重要な情報と要点を保持しながら長文書を簡潔にまとめます。",
    extractionFeature: "テキスト抽出",
    extractionDescription:
      "高度なOCR技術を使用して、画像やPDFからテキストを高精度で抽出します。",
    error: "エラー",
    languageSwitcher: "言語:",
    english: "英語",
    japanese: "日本語",
    extractText: "テキストを抽出",
    extractTextDescription: "ドキュメントからテキストを抽出する",
    translateContent: "テキストを翻訳",
    translateContentDescription: "抽出されたテキストを翻訳する",
    askQuestions: "ドキュメントについて質問",
    askQuestionsDescription: "ドキュメントの内容について質問する",
    translatedContent: "翻訳されたコンテンツ",
    askAboutDocument: "ドキュメントについて質問する",
    askQuestionPlaceholder: "ドキュメントについて質問する...",
    chatWelcome: "こんにちは！このドキュメントについて質問がありますか？",
    makeMoreConcise: "より簡潔にする",
    makeMoreDetailed: "より詳細にする",
    makeMoreProfessional: "よりプロフェッショナルにする",
    fixGrammar: "文法を修正する",
    conciseDescription: "重要なポイントを保持しながらテキストを短くする",
    detailedDescription: "より多くの詳細と説明を追加する",
    professionalDescription: "テキストをより形式的でプロフェッショナルにする",
    grammarDescription: "文法とスペルの誤りを修正する",
    editedText: "編集されたテキスト",
  },
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

type QuickAction = "extract" | "translate" | "ask" | null;

export default function Home() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("vi");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("translate");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pasteAreaActive, setPasteAreaActive] = useState(false);
  const [appLanguage, setAppLanguage] = useState<"en" | "ja">("en");
  const [image, setImage] = useState<string | null>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentAction, setCurrentAction] = useState<QuickAction>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [editAction, setEditAction] = useState<string | null>(null);

  const t = translations[appLanguage];

  const handleTranslate = () => {
    if (!text) return;

    setIsLoading(true);
    setTimeout(() => {
      if (selectedLanguage === "vi") {
        setTranslatedText(
          `Đây là bản dịch tiếng Việt của văn bản bạn đã nhập. Trong một ứng dụng thực tế, điều này sẽ được dịch bằng API dịch thuật.`
        );
      } else if (selectedLanguage === "ja") {
        setTranslatedText(
          `これはあなたが入力したテキストの日本語訳です。実際のアプリケーションでは、翻訳APIを使用して翻訳されます。`
        );
      } else {
        setTranslatedText(
          `This is a translation of the text you entered. In a real application, this would be translated using a translation API.`
        );
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleSummarize = () => {
    if (!text) return;

    setIsLoading(true);
    setTimeout(() => {
      if (appLanguage === "ja") {
        setSummarizedText(
          `これはあなたが入力したテキストの要約です。実際のアプリケーションでは、要約APIを使用して生成されます。`
        );
      } else {
        setSummarizedText(
          `This is a summary of the text you entered. In a real application, this would be generated using a summarization API.`
        );
      }
      setIsLoading(false);
      setEditedText("");
      setEditAction(null);
    }, 1500);
  };

  const validateFile = (file: File): boolean => {
    setError(null);

    if (file.type.includes("pdf")) {
      if (file.size > 5 * 1024 * 1024) {
        setError(
          appLanguage === "ja"
            ? "PDFファイルのサイズが5MBの制限を超えています"
            : "PDF file size exceeds 5MB limit"
        );
        return false;
      }
    } else if (file.type.includes("image")) {
      if (file.size > 2 * 1024 * 1024) {
        setError(
          appLanguage === "ja"
            ? "画像ファイルのサイズが2MBの制限を超えています"
            : "Image file size exceeds 2MB limit"
        );
        return false;
      }

      const validImageTypes = [
        "image/webp",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (!validImageTypes.includes(file.type)) {
        setError(
          appLanguage === "ja"
            ? "webp、png、jpg、jpegの画像形式のみがサポートされています"
            : "Only webp, png, jpg, and jpeg image formats are supported"
        );
        return false;
      }
    } else {
      setError(
        appLanguage === "ja"
          ? "サポートされていないファイル形式です。PDFまたは画像（webp、png、jpg、jpeg）をアップロードしてください"
          : "Unsupported file type. Please upload a PDF or image (webp, png, jpg, jpeg)"
      );
      return false;
    }

    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      setUploadedFile(file);

      setIsLoading(true);
      setTimeout(() => {
        if (appLanguage === "ja") {
          setExtractedText(
            "これはアップロードされたファイルから抽出されたテキストです。実際のアプリケーションでは、OCR技術を使用して処理されます。"
          );
        } else {
          setExtractedText(
            "This is the extracted text from your uploaded file. In a real application, this would be processed using OCR technology."
          );
        }
        setIsLoading(false);
      }, 2000);
    } else if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderImage = (imageURL: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageURL;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
    };
  };

  const handleImageFile = async (fileData: File) => {
    setImage(null);

    const imageURL = URL.createObjectURL(fileData);
    setUploadedFile(fileData);
    setImage(imageURL);
    renderImage(imageURL);

    const base64Image = await imageToBase64(fileData);

    const res = await fetch("/api/extractText", {
      method: "POST",
      body: JSON.stringify({ base64Image }),
    });

    const data = await res.json();
    setExtractedText(data.result);
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
      setError("noImageCopy");
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      setError("noClipboardSupport");
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    if (!e.clipboardData) return;

    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();

        const blob = items[i].getAsFile();
        if (!blob) continue;

        const file = new File(
          [blob],
          `pasted-image-${Date.now()}.${items[i].type.split("/")[1]}`,
          {
            type: items[i].type,
          }
        );

        if (validateFile(file)) {
          setUploadedFile(file);

          setIsLoading(true);
          setTimeout(() => {
            if (appLanguage === "ja") {
              setExtractedText(
                "これは貼り付けられた画像から抽出されたテキストです。実際のアプリケーションでは、OCR技術を使用して処理されます。"
              );
            } else {
              setExtractedText(
                "This is the extracted text from your pasted image. In a real application, this would be processed using OCR technology."
              );
            }
            setIsLoading(false);
          }, 2000);
        }

        break;
      }
    }
  };

  const toggleLanguage = () => {
    setAppLanguage(appLanguage === "en" ? "ja" : "en");
  };

  useEffect(() => {
    const pasteArea = pasteAreaRef.current;

    if (pasteArea && activeTab === "extract") {
      pasteArea.addEventListener("paste", handlePaste);

      return () => {
        pasteArea.removeEventListener("paste", handlePaste);
      };
    }
  }, [activeTab, handlePaste]);

  const handleQuickAction = (action: QuickAction) => {
    setCurrentAction(action);

    if (action === "extract") {
    } else if (action === "translate") {
      setIsLoading(true);
      setTimeout(() => {
        if (appLanguage === "ja") {
          setTranslatedContent(
            "これは抽出されたテキストの翻訳です。実際のアプリケーションでは、翻訳APIを使用して処理されます。"
          );
        } else {
          setTranslatedContent(
            "This is a translation of the extracted text. In a real application, this would be processed using a translation API."
          );
        }
        setIsLoading(false);
      }, 1500);
    } else if (action === "ask") {
      setMessages([
        {
          role: "assistant",
          content:
            appLanguage === "ja"
              ? "こんにちは！このドキュメントについて質問がありますか？"
              : "Hello! What would you like to know about this document?",
        },
      ]);
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !uploadedFile) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentMessage,
      },
    ]);

    setCurrentMessage("");
    setIsLoading(true);

    setTimeout(() => {
      let response = "";

      if (
        currentMessage.toLowerCase().includes("summary") ||
        currentMessage.toLowerCase().includes("summarize")
      ) {
        response =
          appLanguage === "ja"
            ? "このドキュメントはビジネスにおけるデジタル変革についてのものです。企業が効率性と顧客体験を向上させるために新しいテクノロジーを採用する方法について説明しています。"
            : "This document appears to be about digital transformation in businesses. It discusses how companies are adopting new technologies to improve efficiency and customer experience.";
      } else if (
        currentMessage.toLowerCase().includes("author") ||
        currentMessage.toLowerCase().includes("who wrote")
      ) {
        response =
          appLanguage === "ja"
            ? "PDFのメタデータによると、このドキュメントはジョン・スミスによって書かれました。"
            : "The document was written by John Smith, according to the metadata in the PDF.";
      } else if (
        currentMessage.toLowerCase().includes("date") ||
        currentMessage.toLowerCase().includes("when")
      ) {
        response =
          appLanguage === "ja"
            ? "このドキュメントは2023年3月15日に公開されました。"
            : "The document was published on March 15, 2023.";
      } else if (
        currentMessage.toLowerCase().includes("main point") ||
        currentMessage.toLowerCase().includes("key point")
      ) {
        response =
          appLanguage === "ja"
            ? "このドキュメントの主なポイントは、企業が今日の市場で競争力を維持するためにデジタル変革を受け入れる必要があるということです。"
            : "The main point of this document is that businesses need to embrace digital transformation to remain competitive in today's market.";
      } else {
        response =
          appLanguage === "ja"
            ? "ドキュメントの内容に基づいて、トピックのさまざまな側面について説明されています。実際のアプリケーションでは、ドキュメントの実際の内容に基づいてより具体的な回答を提供します。"
            : "Based on the content of your document, I can tell you that it discusses various aspects of the topic. In a real application, I would provide a more specific answer based on the actual content of your document.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
        },
      ]);

      setIsLoading(false);
    }, 1500);
  };

  const handleEditAction = (action: string) => {
    setEditAction(action);
    setIsLoading(true);

    setTimeout(() => {
      let result = "";

      if (action === "concise") {
        if (appLanguage === "ja") {
          result =
            "これは要約をより簡潔にしたバージョンです。重要なポイントだけを含み、余分な詳細は省略されています。実際のアプリケーションでは、AIを使用してテキストを短縮します。";
        } else {
          result =
            "This is a more concise version of the summary. It contains only the essential points, omitting extra details. In a real application, AI would be used to shorten the text.";
        }
      } else if (action === "detailed") {
        if (appLanguage === "ja") {
          result =
            "これはより詳細な要約です。追加の情報、例、および説明が含まれています。実際のアプリケーションでは、AIを使用してテキストに詳細を追加します。";
        } else {
          result =
            "This is a more detailed summary. It includes additional information, examples, and explanations. In a real application, AI would be used to add details to the text.";
        }
      } else if (action === "professional") {
        if (appLanguage === "ja") {
          result =
            "これはよりプロフェッショナルな要約です。フォーマルな言葉遣い、適切な専門用語、および構造化された形式を使用しています。実際のアプリケーションでは、AIを使用してテキストをより専門的にします。";
        } else {
          result =
            "This is a more professional summary. It uses formal language, appropriate terminology, and structured format. In a real application, AI would be used to make the text more professional.";
        }
      } else if (action === "grammar") {
        if (appLanguage === "ja") {
          result =
            "これは文法とスペルが修正された要約です。すべての文法的な誤り、句読点の問題、およびスペルミスが修正されています。実際のアプリケーションでは、AIを使用して文法を修正します。";
        } else {
          result =
            "This is a grammar-corrected summary. All grammatical errors, punctuation issues, and spelling mistakes have been fixed. In a real application, AI would be used to correct grammar.";
        }
      }

      setEditedText(result);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{t.languageSwitcher}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${appLanguage === "en" ? "font-bold" : ""}`}
              >
                {t.english}
              </span>
              <Switch
                checked={appLanguage === "ja"}
                onCheckedChange={toggleLanguage}
                aria-label="Toggle language"
              />
              <span
                className={`text-sm ${appLanguage === "ja" ? "font-bold" : ""}`}
              >
                {t.japanese}
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{t.appTitle}</h1>
          <p className="text-xl text-muted-foreground">{t.appDescription}</p>
        </div>

        <Tabs
          defaultValue="translate"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="translate" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span>{t.translate}</span>
            </TabsTrigger>
            <TabsTrigger value="summarize" className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4" />
              <span>{t.summarize}</span>
            </TabsTrigger>
            <TabsTrigger value="extract" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{t.extract}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="translate" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.translateTitle}</CardTitle>
                <CardDescription>{t.translateDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source-text">{t.sourceText}</Label>
                  <Textarea
                    id="source-text"
                    placeholder={t.sourceTextPlaceholder}
                    className="min-h-[150px]"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="language" className="flex-shrink-0">
                    {t.translateTo}
                  </Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger id="language" className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {translatedText && (
                  <div className="space-y-2">
                    <Label htmlFor="translated-text">{t.translatedText}</Label>
                    <Textarea
                      id="translated-text"
                      className="min-h-[150px]"
                      value={translatedText}
                      readOnly
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleTranslate}
                  disabled={!text || isLoading}
                  className="w-full"
                >
                  {isLoading && activeTab === "translate"
                    ? t.translating
                    : t.translateButton}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="summarize" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.summarizeTitle}</CardTitle>
                <CardDescription>{t.summarizeDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source-text-summary">{t.sourceText}</Label>
                  <Textarea
                    id="source-text-summary"
                    placeholder={t.summarizeTextPlaceholder}
                    className="min-h-[150px]"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                {summarizedText && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="summarized-text">{t.summary}</Label>
                      <Textarea
                        id="summarized-text"
                        className="min-h-[150px]"
                        value={summarizedText}
                        readOnly
                      />
                    </div>

                    {/* Edit Actions */}
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3">
                        Refine your summary:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Button
                          variant={
                            editAction === "concise" ? "default" : "outline"
                          }
                          className={`flex items-center gap-3 h-auto py-4 px-4 transition-all ${
                            editAction === "concise"
                              ? "shadow-md"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => handleEditAction("concise")}
                          disabled={isLoading}
                        >
                          <Scissors
                            className={`h-5 w-5 ${
                              editAction === "concise"
                                ? "text-primary-foreground"
                                : "text-primary"
                            }`}
                          />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              {t.makeMoreConcise}
                            </span>
                            <span className="text-xs text-muted-foreground text-left">
                              {t.conciseDescription}
                            </span>
                          </div>
                          {editAction === "concise" && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </Button>

                        <Button
                          variant={
                            editAction === "detailed" ? "default" : "outline"
                          }
                          className={`flex items-center gap-3 h-auto py-4 px-4 transition-all ${
                            editAction === "detailed"
                              ? "shadow-md"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => handleEditAction("detailed")}
                          disabled={isLoading}
                        >
                          <FileSearch
                            className={`h-5 w-5 ${
                              editAction === "detailed"
                                ? "text-primary-foreground"
                                : "text-primary"
                            }`}
                          />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              {t.makeMoreDetailed}
                            </span>
                            <span className="text-xs text-muted-foreground text-left">
                              {t.detailedDescription}
                            </span>
                          </div>
                          {editAction === "detailed" && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </Button>

                        <Button
                          variant={
                            editAction === "professional"
                              ? "default"
                              : "outline"
                          }
                          className={`flex items-center gap-3 h-auto py-4 px-4 transition-all ${
                            editAction === "professional"
                              ? "shadow-md"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => handleEditAction("professional")}
                          disabled={isLoading}
                        >
                          <Briefcase
                            className={`h-5 w-5 ${
                              editAction === "professional"
                                ? "text-primary-foreground"
                                : "text-primary"
                            }`}
                          />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              {t.makeMoreProfessional}
                            </span>
                            <span className="text-xs text-muted-foreground text-left">
                              {t.professionalDescription}
                            </span>
                          </div>
                          {editAction === "professional" && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </Button>

                        <Button
                          variant={
                            editAction === "grammar" ? "default" : "outline"
                          }
                          className={`flex items-center gap-3 h-auto py-4 px-4 transition-all ${
                            editAction === "grammar"
                              ? "shadow-md"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => handleEditAction("grammar")}
                          disabled={isLoading}
                        >
                          <Check
                            className={`h-5 w-5 ${
                              editAction === "grammar"
                                ? "text-primary-foreground"
                                : "text-primary"
                            }`}
                          />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{t.fixGrammar}</span>
                            <span className="text-xs text-muted-foreground text-left">
                              {t.grammarDescription}
                            </span>
                          </div>
                          {editAction === "grammar" && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {editedText && (
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="edited-text">{t.editedText}</Label>
                        <Textarea
                          id="edited-text"
                          className="min-h-[150px]"
                          value={editedText}
                          readOnly
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSummarize}
                  disabled={!text || isLoading}
                  className="w-full"
                >
                  {isLoading && !editAction ? t.summarizing : t.summarizeButton}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="extract" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.extractTitle}</CardTitle>
                <CardDescription>{t.extractDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t.error}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!uploadedFile ? (
                  <div className="grid w-full items-center gap-4">
                    <div>
                      <Label htmlFor="file-upload">{t.uploadFile}</Label>
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
                        {t.fileRestrictions}
                      </p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button
                        variant={
                          currentAction === "extract" ? "default" : "outline"
                        }
                        className="flex items-center justify-center gap-2 h-auto py-4"
                        onClick={() => handleQuickAction("extract")}
                      >
                        <FileText className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {appLanguage === "ja"
                              ? "テキストを抽出"
                              : "Extract Text"}
                          </span>
                          <span className="text-xs text-muted-foreground text-left">
                            {appLanguage === "ja"
                              ? "ドキュメントからテキストを抽出する"
                              : "Extract text from the document"}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>

                      <Button
                        variant={
                          currentAction === "translate" ? "default" : "outline"
                        }
                        className="flex items-center justify-center gap-2 h-auto py-4"
                        onClick={() => handleQuickAction("translate")}
                      >
                        <Languages className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {appLanguage === "ja"
                              ? "テキストを翻訳"
                              : "Translate Content"}
                          </span>
                          <span className="text-xs text-muted-foreground text-left">
                            {appLanguage === "ja"
                              ? "抽出されたテキストを翻訳する"
                              : "Translate the extracted content"}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>

                      <Button
                        variant={
                          currentAction === "ask" ? "default" : "outline"
                        }
                        className="flex items-center justify-center gap-2 h-auto py-4"
                        onClick={() => handleQuickAction("ask")}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {appLanguage === "ja"
                              ? "ドキュメントについて質問"
                              : "Ask Questions"}
                          </span>
                          <span className="text-xs text-muted-foreground text-left">
                            {appLanguage === "ja"
                              ? "ドキュメントの内容について質問する"
                              : "Ask questions about the content"}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </div>

                    {/* Content based on selected action */}
                    {currentAction === "extract" && extractedText && (
                      <div className="space-y-2">
                        <Label htmlFor="extracted-text">
                          {t.extractedText}
                        </Label>
                        <Textarea
                          id="extracted-text"
                          className="min-h-[150px]"
                          value={extractedText}
                          readOnly
                        />
                      </div>
                    )}

                    {currentAction === "translate" && translatedContent && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="translated-content">
                            {appLanguage === "ja"
                              ? "翻訳されたコンテンツ"
                              : "Translated Content"}
                          </Label>
                          <Select
                            value={selectedLanguage}
                            onValueChange={setSelectedLanguage}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vi">Vietnamese</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea
                          id="translated-content"
                          className="min-h-[150px]"
                          value={translatedContent}
                          readOnly
                        />
                      </div>
                    )}

                    {currentAction === "ask" && (
                      <div className="space-y-4 border rounded-md p-4">
                        <h3 className="font-medium text-lg">
                          {appLanguage === "ja"
                            ? "ドキュメントについて質問する"
                            : "Ask about the document"}
                        </h3>

                        <ScrollArea className="h-[200px] pr-4">
                          <div className="space-y-4">
                            {messages.map((message, index) => (
                              <div
                                key={index}
                                className={`flex ${
                                  message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    message.role === "assistant"
                                      ? "bg-muted text-foreground"
                                      : "bg-primary text-primary-foreground"
                                  }`}
                                >
                                  <div className="text-sm whitespace-pre-wrap">
                                    {message.content}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                        <div className="flex gap-2">
                          <Input
                            placeholder={
                              appLanguage === "ja"
                                ? "ドキュメントについて質問する..."
                                : "Ask a question about the document..."
                            }
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            disabled={isLoading}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!currentMessage.trim() || isLoading}
                            size="icon"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!uploadedFile && (
                  <div className="space-y-2">
                    <Label>{t.pasteImage}</Label>
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
                      {!image && (
                        <>
                          <Clipboard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {t.clickAndPaste}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.pasteSupports}
                          </p>
                        </>
                      )}

                      <canvas
                        ref={canvasRef}
                        className={image ? "w-full" : "w-0 h-0"}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => {
                    setUploadedFile(null);
                    setExtractedText("");
                    setError(null);
                    setCurrentAction(null);
                    setMessages([]);
                    setCurrentMessage("");
                    setTranslatedContent("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? t.processing : t.clearButton}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{t.howItWorks}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{t.translationFeature}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.translationDescription}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{t.summarizationFeature}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.summarizationDescription}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{t.extractionFeature}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.extractionDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
