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
          content: `Translate and summarize the following text into ${targetLang} while preserving its original Markdown formatting. Ensure that all headings, bold, italic, lists, links, and other Markdown elements remain intact. The summary should be presented as bullet points, keeping it concise, fluent, and natural while retaining key points. The text to process is:`,
        },
        { role: "user", content: text },
      ],
    });

    res.status(200).json({
      summary: response.choices[0]?.message.content || "Summarize failed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Summarize failed" });
  }
}
