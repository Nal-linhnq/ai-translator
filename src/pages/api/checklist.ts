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

  const prompt = `You are a QA and Frontend Developer Expert.

I will provide you with a **feature context** and **technical/business specification**.

Your task is to generate a complete and practical **Frontend Development Checklist** in **Markdown format**, suitable for both development and verification.

---

### 📥 Input from User:

- Context: ${context}
- Specifications: ${specifications}

---

### 📤 Your Output Format (Markdown):

Please structure your response with the following sections:

---

## 🧠 Summary Logic  
> Explain the expected feature behavior clearly and simply.


## 📊 Acceptance Criteria  
> Use simple bullet points or Gherkin style (Given – When – Then).


## 🎨 UI Checklist  
> Validate the frontend rendering and interaction:
- [ ] Layout is consistent across screen sizes  
- [ ] Labels/texts are correct  
- [ ] Tabs/buttons/states are styled correctly  
- [ ] Element visibility and responsiveness  
- [ ] Error messages are positioned and styled correctly


## 🧮 Frontend Logic Checklist  
> Validate any in-browser logic or flow:
- [ ] Conditional rendering  
- [ ] Input validation (format, required fields...)  
- [ ] Pre-rendering behavior (if SSR/SSG involved)  
- [ ] Tab navigation, link routing, state syncing  
- [ ] Edge cases handled gracefully


## 😄 Happy Case Scenarios  
> Describe full ideal user flows with correct data and expected behavior.


## ❌ Abnormal Case Scenarios  
> List edge/failure cases:
- [ ] Missing/invalid input  
- [ ] Data not available  
- [ ] API not ready  
- [ ] Wrong tab state on reload


## 🧪 Test Data Suggestions  
> Suggest practical data for dev/QA:
- [ ] Normal values  
- [ ] Empty/invalid inputs  
- [ ] Boundary values  
- [ ] Broken link test case (if applicable)


## 🧪 Unit Test Suggestion  
> Suggest how to write unit tests (optional if FE test enforced):
- [ ] Functions/methods to test  
- [ ] Tools (e.g., Jest, React Testing Library)  
- [ ] Typical valid/invalid flows  
- [ ] Expected coverage


## 💡 Code Implementation Hint (Optional)  
> Suggest how this can be coded (function name, hook usage, component structure...)


## 📈 UX & Performance Notes  
> - Avoid layout shifts (FCP, LCP)  
> - Debounce user input where needed  
> - Optimize initial paint for SSR/SSG  
> - Prefetch tab content?


### 🔁 Notes:
- Output MUST be in **Markdown format** with headings and checkboxes.  
- Be concise but detailed enough for real-world development.  
- Always return real examples when possible.
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
