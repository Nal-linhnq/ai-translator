/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
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
    res.status(200).json({ text: pdfData.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing pdf" });
  }
}
