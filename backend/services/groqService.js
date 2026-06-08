import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function analyzeScreenshots(imageUrls, description) {

  const prompt = `
You are a product demo expert.

Application Description:
${description}

Images:
${imageUrls.join("\n")}

For each screen generate:

{
  "slides": [
    {
      "title": "",
      "caption": "",
      "voiceover": ""
    }
  ]
}

Return ONLY JSON.
`;
    console.log("Calling Groq...");
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
  console.log("Groq Response:", response);
  return response.choices[0].message.content;
}