import { UploadIcon } from "lucide-react";
import { useTranslation } from "next-i18next";
import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

type Props = {
  handleExtractedText: (text: string) => void;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const OCRTextOverlay: React.FC<Props> = ({ handleExtractedText }) => {
  const { t } = useTranslation("common");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Image uploaded");
    setImage(null);
    setLoading(true);
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PNG, JPG, and JPEG images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 2MB.");
      return;
    }

    setError(null);

    if (image) {
      URL.revokeObjectURL(image);
    }

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
    Tesseract.recognize(imageURL, "eng+vie+jpn")
      .then(({ data: { text } }) => {
        console.log("OCR Text:", text);
        handleExtractedText(text);
        renderImage(imageURL);
      })
      .catch((err) => console.error("OCR Error:", err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto mt-1 rounded-lg">
      {/* File Upload */}
      <label className="w-full flex flex-col items-center px-4 py-4 bg-gray-100 rounded-lg shadow-md tracking-wide uppercase border border-blue cursor-pointer transition">
        <UploadIcon size={24} />
        <span className="mt-2 text-sm">
          {loading ? t("loadingImage") : t("chooseImage")}
        </span>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

      <p className="text-gray-500 text-sm mt-1">{t("acceptImage")}</p>

      {/* Error Message */}
      {error && <p className="mt-2 text-red-500">{error}</p>}

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
