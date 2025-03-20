import { LANGUAGES } from "@/shared/constants";
import { useTranslation } from "next-i18next";
import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

type Props = {
  handleExtractedText: (text: string) => void;
  lang: string;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const OCRTextOverlay: React.FC<Props> = ({ handleExtractedText, lang }) => {
  const targetLang = LANGUAGES.find((l) => l.lang === lang)?.lang || "eng";
  const { t } = useTranslation("common");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(file.size);

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 2MB.");
      return;
    }

    setError(null);
    const imageURL = URL.createObjectURL(file);
    setImage(imageURL);
    processOCR(imageURL);
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
    Tesseract.recognize(imageURL, targetLang)
      .then(({ data: { text } }) => {
        handleExtractedText(text);
        renderImage(imageURL);
      })
      .catch((err) => console.error("OCR Error:", err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto mt-1 rounded-lg">
      {/* File Upload */}
      <label className="w-full flex flex-col items-center px-4 py-4 bg-gray-100 text-blue-600 rounded-lg shadow-md tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-200 transition">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="mt-2 text-sm">{t("chooseImage")}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

      {/* Error Message */}
      {error && <p className="mt-2 text-red-500">{error}</p>}

      {/* Loading Indicator */}
      {loading && (
        <p className="mt-4 text-blue-600 text-center">{t("extracting")}</p>
      )}

      {/* Image Preview & Canvas */}
      <div className="mt-4">
        {image && (
          <div className="relative">
            <canvas ref={canvasRef} className="w-full border rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRTextOverlay;
