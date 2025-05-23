import { openai } from "@/lib/openai";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { sourceText, targetLanguage, context } = req.body;

  if (!sourceText || !targetLanguage || !context) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  const languageInstruction = `\n\nIMPORTANT: Translate all category names and checklist item descriptions into ${targetLanguage}. Ensure the translations are natural and professional.`;

  const prompt = `You are a senior frontend developer with extensive experience in building and testing web applications. You will analyze project context and technical specifications to create a concise self-test checklist for developers to minimize UI and logic bugs before passing their work to QA.

PROJECT CONTEXT:
${context || "No specific context provided"}

TECHNICAL SPECIFICATIONS:
${sourceText || "No specific technical specifications provided"}

Based on the provided context and specifications, identify the most important categories for a frontend self-test checklist. Use the context to understand the business requirements and user expectations, then use the specifications to identify specific features that need testing.

For each category, provide EXACTLY 2 items:
1. ONE happy path test - The single most important test to verify normal functionality
2. ONE abnormal case test - The single most important test to verify error handling or edge cases

IMPORTANT: EVERY checklist item MUST be prefixed with either "[Happy Path]" or "[Abnormal Case]" as appropriate.
IMPORTANT: Each item should be a specific, actionable test that a developer can perform themselves.
IMPORTANT: Focus on tests that can catch the most common and critical UI and logic bugs before they reach QA.
IMPORTANT: Each test should be comprehensive and cover both UI and logic aspects where relevant.

FORMAT YOUR RESPONSE AS A VALID JSON ARRAY OF CATEGORIES. Each category should have a "name" and "items" array. Each item should have "id", "description", and "completed" (always false).

Example format:
[
  {
    "name": "User Authentication",
    "items": [
      {
        "id": "auth-1",
        "description": "[Happy Path] Verify that login form displays correctly, all fields are accessible, and successful login stores the authentication token and redirects to the dashboard",
        "completed": false
      },
      {
        "id": "auth-2",
        "description": "[Abnormal Case] Verify that error messages appear with proper styling when login fails and the system handles expired tokens by redirecting to login page with appropriate message",
        "completed": false
      }
    ]
  }
]

Guidelines:
- Only include categories that are directly relevant to the context and specifications
- Be specific and actionable in your descriptions
- Write test items that developers can perform themselves without special QA tools
- Focus on tests that catch the most common and critical bugs
- Include both UI and logic aspects in each test where relevant
- REMEMBER: EVERY item MUST be prefixed with either "[Happy Path]" or "[Abnormal Case]"
${languageInstruction}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    let jsonText = text.trim();

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsedChecklist = JSON.parse(jsonText);

    res.json({ checklist: parsedChecklist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Analyze failed" });
  }
}
