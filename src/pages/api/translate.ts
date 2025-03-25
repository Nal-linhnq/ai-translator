import { openai } from "@/lib/openai";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { sourceText, targetLanguage } = req.body;

  if (!sourceText || !targetLanguage) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Translate the following text into ${targetLanguage} Maintain accuracy, fluency, and cultural nuances for a natural translation. The text to translate is:`,
        },
        { role: "user", content: sourceText },
      ],
    });
    res.status(200).json({
      translatedText: response.choices[0]?.message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Translation failed" });
  }
}
