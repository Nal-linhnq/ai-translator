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
  if (!targetLang) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: !text
            ? `Translate text from "No valid text found." into ${targetLang}. Just translate and nothing else.`
            : `Correct the given text by fixing spelling, grammar, and formatting errors. Remove unnecessary characters while preserving the original meaning. If the text consists entirely of meaningless characters and translate it to ${targetLang}.  

Input text: ${text} 

Output format:  

**Corrected Text:**  
[Fixed version] / "No valid text found."  

---  

**Translation ({targetLanguage}):**  
[Translated version]`,
        },
      ],
    });

    res.status(200).json({
      text: response.choices[0]?.message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "API failed" });
  }
}
