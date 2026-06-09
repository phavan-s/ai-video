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
  imageCount
) {

  const prompt = `
You are an expert enterprise software B2B motion graphics director. Your sole task is to break down a product user journey into a frame-accurate narration timeline.

Analyze the provided technical description and generate exactly ${imageCount} sequence slides. 

### OUTPUT FORMAT SPECIFICATION ###
You must return ONLY a raw, valid JSON object matching the schema below. Do not include markdown formatting blocks (such as json). 

{
  "slides": [
    {
      "slideNumber": 1,
      "narration": "First, developers initialize the workflow engine by connecting their production data repositories directly to the secure environment pipeline."
    }
  ]
}

### STRICT RULES FOR NARRATION GENERATION ###
1. QUANTITY BOUNDARY: Generate exactly ${imageCount} slide objects. No more, no less.
2. SOURCE OF TRUTH: Use the provided service description to slice the user journey across slides in a chronological, step-by-step sequential order.
3. ABSOLUTE FORBIDDEN PHRASES: Do not include intros, outros, greetings, or filler words (e.g., Delete "Welcome to", "Thank you", "In this screenshot", "As you can see here", "This slide shows"). 
4. CRICK & CRISP PACING: Limit each slide narration to exactly 1-2 direct, high-impact sentences. Focus purely on user actions and system responses.
5. NO MARKETING HYPERBOLE: Maintain a cold, authoritative, corporate enterprise B2B tone. Use active verbs (e.g., "Configure," "Deploy," "Analyze") instead of passive or promotional language.
6. STRICTLY USE SECOND PERSON. Address the user directly as "you" and avoid third-person references.
### PRODUCT SERVICE DESCRIPTION SOURCE OF TRUTH ###
${description}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "user",
        content: prompt
      }
    ],

    temperature: 0.2
  });

  const content =
    response.choices[0].message.content;

  console.log(
    "Narration Response:",
    content
  );

  return extractJson(content);
}