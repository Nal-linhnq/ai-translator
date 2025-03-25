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
      console.log(`Received file ${key}:`, file.originalFilename);
      newFile = fs.readFileSync(file.filepath);
    }
  });

  try {
    const pdfData = await pdfParse(newFile);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this PDF, keeping headings, paragraphs, lists, and tables intact.Then, summarize the key points concisely. If the document has sections, summarize each section separately. Do not change any single character. Write exact all sentences as it is in the PDF.",
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

    for await (const chunk of stream) {
      console.log(chunk);
      console.log(chunk.choices[0].delta);
      console.log("****************");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing pdf" });
  }
}
