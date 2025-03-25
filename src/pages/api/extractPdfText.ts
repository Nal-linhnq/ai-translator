/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/lib/openai";
import formidable, { IncomingForm } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const data: { files: formidable.Files } = await new Promise(
    (resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, _fields, files: formidable.Files) => {
        if (err) reject({ err });
        resolve({ files });
      });
    }
  );

  let newFile: any = null;

  Object.keys(data.files).forEach((key) => {
    if (data.files[key] && data.files[key].length > 0) {
      const file = data.files[key][0];
      newFile = fs.readFileSync(file.filepath);
    }
  });

  try {
    const pdfData = await pdfParse(newFile);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all readable text from the uploaded PDF and output it as structured text. Maintain formatting, including headings, bullet points, and numbered lists. If the document includes tables or code snippets, keep them structured for better readability. Text:",
            },
            {
              type: "text",
              text: pdfData.text,
            },
          ],
        },
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
    res.status(500).json({ message: "Error processing pdf" });
  }
}
