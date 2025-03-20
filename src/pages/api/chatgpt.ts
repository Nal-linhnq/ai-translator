import { openai } from "@/lib/openai";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { text, targetLang, mode } = req.body;
  if (!text || !targetLang || !mode) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  let prompt = "";

  if (mode === "grammar") {
    prompt = `Your are a master developer (you know everything about frontend, backend, devops, testing) and you have been tasked with correcting the following text. Maintaining the structure and formatting of the original content. Input Text:`;
  } else if (mode === "translate") {
    prompt = `Your are a master developer (you know everything about frontend, backend, devops, testing) and you have been tasked with translating the following text into **${targetLang}**. Input Text:`;
  } else if (mode === "summarize") {
    prompt = `Your are a master developer (you know everything about frontend, backend, devops, testing) and you have been tasked with translating and summarize the following text into **${targetLang}**.. Using bullet points or structured paragraphs where necessary. Input Text:`;
  } else if (mode === "analyze") {
    prompt = `Your are a master developer (you know everything about frontend, backend, devops, testing) and you have been tasked with analyzing the following text in **${targetLang}**. Using headings, bullet points, and bold highlights where necessary. Input Text: `;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text },
      ],
    });

    res.status(200).json({
      summary: response.choices[0]?.message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "API Error" });
  }
}
