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

  const prompt = `
You are a senior professional with extensive experience in Frontend Development, Backend Development, Quality Assurance, and Business Analysis. You will analyze a specific ticket/task context and technical specifications to create a comprehensive checklist that covers frontend implementation and QA testing aspects.

TICKET/TASK CONTEXT:
${context || "No specific context provided"}

TICKET/TASK SPECIFICATIONS:
${sourceText || "No specific technical specifications provided"}

COMPREHENSIVE ANALYSIS INSTRUCTIONS:
1. Analyze the ticket from multiple perspectives (Frontend, Backend, QA, Business Analysis)
2. Consider all technical and business aspects of the implementation
3. Think about UI/UX, API integration, data flow, business logic, and testing scenarios
4. BUT ONLY OUTPUT CHECKLIST ITEMS FOR FRONTEND AND QA ROLES

CRITICAL INSTRUCTIONS:
- CAREFULLY ANALYZE the provided ticket/task context and specifications from all perspectives
- ONLY create categories that are DIRECTLY RELATED to implementing this specific ticket/task
- Each category should have MAXIMUM 6 items covering different aspects of Frontend and QA
- SORT items with HAPPY CASES FIRST, then abnormal cases
- Focus on what needs to be done to complete THIS SPECIFIC TICKET successfully
- ONLY INCLUDE ITEMS WITH ROLES [FE], [QA], or [FE/QA] - DO NOT include any [BE] or [BA] items

For each category that is DIRECTLY RELATED to the ticket implementation, provide UP TO 6 items:
- Start with happy path tests (2-3 items for Frontend implementation)
- Follow with happy path tests (1-2 items for QA testing)
- Then include abnormal case tests (1-2 items covering error scenarios and edge cases)
- Each item should specify which role perspective it represents: ONLY [FE], [QA], or [FE/QA]

IMPORTANT: EVERY checklist item MUST be prefixed with either "[Happy Path]" or "[Abnormal Case]" as appropriate.
IMPORTANT: Each item should include a role indicator: ONLY [FE], [QA], or [FE/QA] for cross-cutting concerns.
IMPORTANT: Focus ONLY on what's needed to implement and validate THIS SPECIFIC TICKET.
IMPORTANT: If the ticket is simple, create fewer categories but ensure they're highly relevant.
IMPORTANT: DO NOT INCLUDE ANY [BE] or [BA] items in your response.
IMPORTANT: Use [FE/QA] for items that require both Frontend and QA collaboration.

FORMAT YOUR RESPONSE AS A VALID JSON ARRAY OF CATEGORIES. Each category should have a "name" and "items" array. Each item should have "id", "description", "completed" (always false), and "role" (only "FE", "QA", or "FE/QA").

ANALYSIS GUIDELINES:
- Read the ticket specifications carefully and identify SPECIFIC implementation requirements
- Look for: UI components to build, API endpoints to integrate with, business rules to implement, user interactions to handle
- Create categories based on ACTUAL work needed for this ticket
- Consider what Frontend developers and QA testers need to do to complete their part of this ticket
- Be SPECIFIC to the ticket requirements, not generic development practices
- REMEMBER: EVERY item MUST be prefixed with either "[Happy Path]" or "[Abnormal Case]"
- IMPORTANT: Sort items with happy cases first, then abnormal cases
- IMPORTANT: Maximum 6 items per category
- IMPORTANT: Focus on ticket completion, not entire project development
- IMPORTANT: ONLY include items with roles [FE], [QA], or [FE/QA]${languageInstruction}
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
