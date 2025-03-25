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
          content: `Translate the following text into ${targetLanguage} while preserving its technical accuracy and professional tone. Text:`,
        },
        { role: "user", content: sourceText },
      ],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of response) {
      const text = chunk.choices[0]?.delta?.content || "";

      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Translation failed" });
  }
}
