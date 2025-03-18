import { openai } from "@/lib/openai";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Translate the following text into ${targetLang} while preserving its original Markdown formatting. Ensure that all bold, italic, lists, links, headings, and other Markdown elements remain intact. Maintain accuracy, fluency, and cultural nuances for a natural translation. The text to translate is:`,
        },
        { role: "user", content: text },
      ],
    });
    res.status(200).json({
      text: response.choices[0]?.message.content || "Translation failed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Translation failed" });
  }
}
