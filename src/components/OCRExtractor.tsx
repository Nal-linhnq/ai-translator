/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@headlessui/react";
import { UploadIcon, Clipboard, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js";

type Props = {
  handleExtractedText: (text: string, isPdf?: boolean) => void;
};

const MAX_FILE_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const MAX_FILE_PDF_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const OCRTextOverlay: React.FC<Props> = ({ handleExtractedText }) => {
  const { t } = useTranslation("common");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (fileData: File) => {
    console.log("Image uploaded");
    setImage(null);
    setLoading(true);

    if (!ALLOWED_TYPES.includes(fileData.type)) {
      setError(t("onlyImage"));
      setLoading(false);
      return;
    }

    if (fileData.size > MAX_FILE_IMAGE_SIZE) {
      setError(t("maxImageSize"));
      setLoading(false);
      return;
    }

    setError(null);

    if (image) {
      URL.revokeObjectURL(image);
    }

    const imageURL = URL.createObjectURL(fileData);
    setImage(imageURL);
    processOCR(imageURL);
  };

  const extractTextFromPDF = async (file: File) => {
    if (file.size > MAX_FILE_PDF_SIZE) {
      setError(t("maxPdfSize"));
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      setError(null);
      const pdfData = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }

      console.log("PDF Text:", text);
      handleExtractedText(text, true);
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type === "application/pdf") {
      extractTextFromPDF(file);
    } else if (file.type.startsWith("image/")) {
      handleImageFile(file);
    } else {
      setError(t("fileUploadError"));
      setLoading(false);
    }

    event.target.value = "";
  };

  const handlePasteClick = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image")) {
            const blob = await item.getType(type);
            handleImageFile(
              new File([blob], "pasted-image.png", { type: blob.type })
            );
            return;
          }
        }
      }
      setError(t("noImageCopy"));
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      setError(t("noClipboardSupport"));
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

  const processOCR = (imageURL: string) => {
    Tesseract.recognize(imageURL, "jpn+eng+vie")
      .then(({ data: { text } }) => {
        handleExtractedText(text);
        renderImage(imageURL);
      })
      .catch((err) => console.error("OCR Error:", err))
      .finally(() => setLoading(false));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    clearCanvas();
  };

  return (
    <div className="mx-auto mt-1 rounded-lg">
      {/* File Upload */}
      <label className="w-full flex flex-col items-center px-4 py-4  rounded-lg shadow-md tracking-wide uppercase border border-blue cursor-pointer transition hover:bg-gray-100 ">
        <UploadIcon size={24} />
        <span className="mt-2 text-sm">{t("chooseFile")}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf, image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>

      <p className="text-gray-500 text-sm mt-1">{t("acceptImage")}</p>

      {/* Error Message */}
      {error && <p className="mt-2 text-red-500">{error}</p>}

      <div className="mt-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full min-h-[350px] border rounded-lg bg-white"
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-lg border">
              {" "}
              <p className="text-lg font-medium">{t("loadingImage")}</p>
            </div>
          )}

          {!image ? (
            <Button
              onClick={handlePasteClick}
              className="absolute inset-0 flex flex-col items-center justify-center w-full h-full rounded-lg transition cursor-pointer hover:bg-gray-100 hover:border"
            >
              <Clipboard className="w-16 h-16 mb-2 text-gray-600" />
              <p className="text-lg font-medium">{t("pasteImage")}</p>
            </Button>
          ) : (
            !loading && (
              <Button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 cursor-pointer text-white p-2 rounded-full "
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRTextOverlay;
