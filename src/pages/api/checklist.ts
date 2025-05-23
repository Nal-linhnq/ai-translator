import { openai } from "@/lib/openai";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { sourceText: specifications, targetLanguage, context } = req.body;

  if (!specifications || !targetLanguage || !context) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  const languageInstruction = `\n\nIMPORTANT: Translate all category names and checklist item descriptions into ${targetLanguage}. Ensure the translations are natural and professional.`;

  const prompt = `
You are a senior professional with extensive experience in Frontend Development, Backend Development, Quality Assurance, and Business Analysis. You will analyze a specific ticket/task context and technical specifications to create a highly targeted, comprehensive checklist that covers frontend implementation and QA testing aspects.

TICKET/TASK CONTEXT:
${context || "No specific context provided"}

TICKET/TASK SPECIFICATIONS:
${specifications || "No specific technical specifications provided"}

COMPREHENSIVE ANALYSIS INSTRUCTIONS:
1. Analyze the ticket from multiple perspectives (Frontend, Backend, QA, Business Analysis)
2. Consider all technical and business aspects of the implementation
3. Think about UI/UX, API integration, data flow, business logic, and testing scenarios
4. BUT ONLY OUTPUT CHECKLIST ITEMS FOR FRONTEND AND QA ROLES

ABSOLUTE ZERO-REDUNDANCY REQUIREMENTS:
- UNLIMITED ITEMS per category - include ALL necessary items that are DIRECTLY relevant
- ZERO REDUNDANCY: Each item must be completely unique with no overlap whatsoever
- ZERO GENERIC ITEMS: Every item must be hyper-specific to this exact ticket
- ZERO FILLER CONTENT: Only include items that are absolutely essential
- ZERO DUPLICATION: No two items should test or implement the same thing
- MAXIMUM PRECISION: Each item must address a distinct, specific aspect of the ticket

CRITICAL UNIQUENESS VALIDATION:
Before including any item, ask yourself:
1. Is this item testing/implementing something completely different from all other items?
2. Is this item specifically required by THIS ticket's context and specifications?
3. Would removing this item leave a gap in the implementation or testing coverage?
4. Does this item provide unique value that no other item provides?
5. Is this item actionable and measurable for the assigned role?

MANDATORY PREFIX AND ROLE REQUIREMENTS:
- EVERY SINGLE ITEM must start with either "[Happy Path]" or "[Abnormal Case]"
- EVERY SINGLE ITEM must include role indicator "[FE]", "[QA]", or "[FE/QA]"
- Format: "[Happy Path/Abnormal Case] [Role] Specific description tied to ticket requirements"
- NO EXCEPTIONS - every item must follow this exact format

ITEM GENERATION STRATEGY:
1. Extract SPECIFIC requirements from the ticket context and specifications
2. Identify UNIQUE implementation tasks for Frontend developers
3. Identify UNIQUE testing scenarios for QA testers
4. Identify UNIQUE collaborative tasks requiring both FE and QA
5. Ensure each item addresses a DISTINCT aspect of the ticket
6. Eliminate any items that overlap in scope or purpose
7. Sort with [Happy Path] items first, then [Abnormal Case] items

QUALITY GATES - REJECT ANY ITEM THAT:
- Duplicates functionality already covered by another item
- Uses generic language not specific to the ticket
- Could be merged with another item without losing meaning
- Tests the same component/feature as another item from a different angle
- Implements the same requirement as another item
- Is not directly traceable to the ticket specifications

FOCUS AREAS FOR UNIQUE ITEMS:
- Specific UI components mentioned in the ticket
- Exact API endpoints or data flows described
- Particular business rules or validation logic
- Specific user interactions or workflows
- Exact error scenarios mentioned in requirements
- Particular performance or accessibility requirements
- Specific browser/device compatibility needs
- Exact integration points with other systems

IMPORTANT: Focus ONLY on what's needed to implement and validate THIS SPECIFIC TICKET.
IMPORTANT: If the ticket is simple, create fewer items but ensure they're highly relevant.
IMPORTANT: DO NOT INCLUDE ANY [BE] or [BA] items in your response.
IMPORTANT: Use [FE/QA] for items that require both Frontend and QA collaboration.
IMPORTANT: NO ITEM LIMITS - but every item must pass the uniqueness validation.
IMPORTANT: Each item must be so specific that it cannot be confused with any other item.

FORMAT YOUR RESPONSE AS A VALID JSON ARRAY OF CATEGORIES. Each category should have a "name" and "items" array. Each item should have "id", "description", "completed" (always false), and "role" (only "FE", "QA", or "FE/QA").

FINAL VALIDATION CHECKLIST:
Before finalizing, ensure:
- No two items address the same component, feature, or scenario
- Each item is directly traceable to specific ticket requirements
- Each item provides unique, non-overlapping value
- All items are essential for ticket completion
- No generic or template-like items exist
- Every item follows the mandatory prefix format${languageInstruction}
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
