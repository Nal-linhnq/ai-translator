import { openai } from "@/lib/openai";
import { extractFixedText } from "@/shared/utils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { text, targetLang, isPdf = false } = req.body;
  if (!targetLang) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  const content = isPdf
    ? `Extract text from the provided PDF file. Ensure the text is structured correctly, preserving paragraphs and formatting.

1. Automatically correct spelling, grammar, and punctuation mistakes while maintaining the original meaning.
2. Translate the corrected text into **${targetLang}** naturally and contextually.
3. Ensure the translation is **clear, accurate, and culturally appropriate**.

**Output:** Translated text in ${targetLang}.
 The PDF text is: ${text}  
`
    : !text
    ? `Translate text from "No valid text found." into ${targetLang}. Just translate and nothing else.`
    : `Correct the given text by fixing spelling, grammar, and formatting errors. Remove unnecessary characters while preserving the original meaning. If the text consists entirely of meaningless characters and translate it to ${targetLang}.  

Input text: ${text} 

Output format:  

**Corrected Text:**  
[Fixed version]

---  

**Translation ({targetLanguage}):**  
[Translated version]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content,
        },
      ],
    });

    const correctedText = extractFixedText(
      response.choices[0]?.message.content || ""
    );

    res.status(200).json({
      text: response.choices[0]?.message.content,
      isPdf,
      correctedText,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "API failed" });
  }
}
