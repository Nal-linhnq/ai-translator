import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/lib/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { base64Image } = JSON.parse(req.body);

  if (!base64Image) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Act like just a OCR Optical Character Recognition system. I will provide you an image so you will extract all text from image including all punctuation, space properly. Do not change any single character . Write exact all sentences as it is on image.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    res.status(200).json({ result: response.choices[0]?.message?.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing image" });
  }
}
