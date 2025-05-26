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

  const prompt = `You are a QA and Developer Expert. I will provide the **feature context and specifications**.

Your task is to generate a **comprehensive QA checklist and implementation guide** in structured Markdown format.

---

### 📥 Input Provided by User:
- **Feature context**: ${context}
- **Specifications**: ${specifications}

---

### 📤 Output Format (Markdown):

Please return the checklist with the following sections:

---

## 🧠 Summary Logic  
> Explain the core behavior of the feature in the simplest and clearest language possible.


## 📊 Acceptance Criteria  
> Bullet list of business rules that must be met. Format in simple plain-text or Gherkin (Given-When-Then) style.


## 🎨 UI Checklist  
> List everything that should be validated in the UI:  
- [ ] Visibility of elements  
- [ ] Correct labels and text  
- [ ] Layout and responsiveness  
- [ ] Error states/messages  
- [ ] Button enable/disable states  
- [ ] Accessibility (optional)


## 🧮 Logic Checklist  
> Checklist of backend/business logic validations:
- [ ] Field validation rules  
- [ ] Conditional logic  
- [ ] DB constraints  
- [ ] API behavior if involved


## 💡 Suggested Code Implementation  
> Suggest how the feature could be implemented in code.  
Can include: function names, input/output handling, logic branching, error handling.


## 👀 UI Verification Guide  
> Manual steps a QA can follow to verify the feature on a real UI.  
Use simple and practical instructions.


## 🧪 Test Data Suggestions  
> Suggest realistic data for different test types:
- Normal cases
- Edge cases
- Boundary values
- Invalid formats


## 😄 Happy Case  
> Describe a complete, ideal scenario with valid input and successful behavior.


## ❌ Abnormal Cases  
> List of failure scenarios:
- Invalid inputs
- Missing fields
- Business rule violations
- Backend/API failures (if any)


## 🧩 Dependency Checklist  
> Any dependencies that must be ready:
- APIs, services, or DB states  
- Environment-specific configs  
- Auth/login setups if required


## 🧪 Unit Test Coverage  
> Suggest unit test breakdowns:
- Core functions/methods to be tested  
- Expected logic branches  
- Test cases per function (valid, invalid, edge)  
- Coverage expectation (e.g., 80–90%)  
- Framework (e.g., Jest, JUnit, Mocha...)


## 📈 Performance / UX Hint  
> Any note on user experience or responsiveness:  
- Should loading be instant?  
- Debounce inputs?  
- Handle slow APIs?  
- Frontend optimizations?


### 📌 Notes:
- Use clear Markdown format.
- Keep lists well structured with bullet points or checkboxes.
- Be practical, realistic, and developer/QA-friendly.
- Translate everything into ${targetLanguage} as per the language instruction.
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
    res.status(500).json({ message: "Analyze failed" });
  }
}
