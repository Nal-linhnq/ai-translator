import { openai } from "@/lib/openai";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { sourceText, targetLanguage, action = "" } = req.body;

  if (!sourceText || !targetLanguage) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: action
            ? action
            : `Translate and summarize the following text into ${targetLanguage} The summary should be presented as bullet points, keeping it concise, fluent, and natural while retaining key point. The text to process is:`,
        },
        { role: "user", content: sourceText },
      ],
    });

    res.status(200).json({
      summarizedText: response.choices[0]?.message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Summarize failed" });
  }
}
