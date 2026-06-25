import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

function extractJson(content) {

  try {
    return JSON.parse(content);
  } catch (error) {

    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  }

}

export async function generateNarration(
  description,
  slideOCRData = []
) {

  const imageCount =
    slideOCRData.length;

  const ocrContext =
    slideOCRData
      .map(
        slide =>

`SLIDE ${slide.slideNumber}

OCR TEXT:
${slide.ocrText}

========================================`
      )
      .join("\n");

  console.log(
    "================================"
  );

  console.log(
    "OCR CONTEXT SENT TO GROQ"
  );

  console.log(
    ocrContext
  );

  console.log(
    "================================"
  );

  const prompt = `

You are an enterprise software walkthrough narrator.

Your job is to generate narration that precisely follows the uploaded screenshots.

==================================================
SERVICE DESCRIPTION
==================================================

${description}

==================================================
SCREEN CONTENT DETECTED BY OCR
==================================================

${ocrContext}

==================================================
VERY IMPORTANT
==================================================

Treat each OCR block as one screenshot.

SLIDE 1 OCR
must generate
SLIDE 1 narration.

SLIDE 2 OCR
must generate
SLIDE 2 narration.

SLIDE 3 OCR
must generate
SLIDE 3 narration.

Never mix OCR content between slides.

OCR is the PRIMARY source of truth.

The service description is SECONDARY context.

If OCR contains:

Programs

Then discuss Programs.

If OCR contains:

Requirements

Then discuss Requirements.

If OCR contains:

Trainings

Then discuss Trainings.

Do not invent screens, buttons, workflows, or features that are not visible in OCR.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

{
  "slides": [
    {
      "slideNumber": 1,
      "narration": "",
      "focusElement": ""
    }
  ]
}

==================================================
NARRATION RULES
==================================================

1. Generate exactly ${imageCount} slides.

2. Each slide MUST contain:
   - slideNumber
   - narration
   - focusElement

3. Each narration must contain 1-2 short sentences.

4. Use second person.

Use:
- you
- your

Never use:
- users
- customers
- organizations
- they

5. Never say:

- in this screenshot
- on this screen
- this page shows
- as you can see
- this slide displays

6. First slide must start with a short greeting.

Example:

"Hello, let's explore the Programs experience."

7. Final slide must end with a short conclusion.

Example:

"Thank you for your time."

8. focusElement rules:

- 1 to 4 words
- Must exist in OCR text
- Must represent the primary area discussed

Examples:

Programs
Requirements
Trainings
Dashboard
Orders
Certification
Opportunities

9. Return ONLY JSON.

No markdown.

No explanations.

`;

  const response =
    await groq.chat.completions.create({

      model:
        "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0.1

    });

  const content =
    response.choices[0].message.content;

  console.log(
    "================================"
  );

  console.log(
    "NARRATION RESPONSE"
  );

  console.log(
    content
  );

  console.log(
    "================================"
  );

  return extractJson(content);

}