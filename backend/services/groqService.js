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
### STRICT RULES FOR NARRATION GENERATION

1. EXACT SLIDE COUNT

   * Generate exactly ${imageCount} slide objects.
   * Never generate more or fewer slides.

2. JOURNEY-FIRST STORYTELLING

   * Treat the uploaded screenshots as a sequential user journey.
   * Distribute the service description across the available slides in logical chronological order.
   * Progress naturally from discovery → configuration → execution → tracking → completion.

3. SCREEN AWARENESS

   * Infer the purpose of each screen from its position in the journey.
   * If the first screen appears to be a landing page, dashboard, home page, service catalog, navigation hub, or entry point, introduce the workflow in one concise sentence.
   * If the final screen appears to show results, status, analytics, progress, completion, certification, summary, or reporting, conclude the workflow in one concise sentence.
   * Intermediate screens should focus on actions, configuration steps, requirements, data entry, approvals, progress tracking, or execution activities.

4. SHORT INTRODUCTION

   * The first slide may contain a very short introduction if appropriate.
   * Example style:

     * "You begin in the Programs workspace, where available program tracks are organized by eligibility and enrollment status."
     * "You access the Opportunities dashboard to review and manage active pipeline activity."

5. SHORT CONCLUSION

   * The final slide may contain a very short outcome-focused conclusion if appropriate.
   * Example style:

     * "You can monitor completion status and continue progressing toward certification requirements."
     * "You gain visibility into performance metrics and next actions."

6. DIRECT USER PERSPECTIVE

   * Always address the viewer as "you".
   * Never use:

     * the user
     * customers
     * users
     * they
     * organizations
   * Use:

     * you
     * your

7. NO SCREEN REFERENCES

   * Never say:

     * "In this screenshot"
     * "On this screen"
     * "This page shows"
     * "As you can see"
     * "This slide displays"

8. CONCISE PACING

   * Each slide must contain only 1–2 short sentences.
   * Target 10–25 words per sentence.
   * Avoid repetition across slides.

9. ENTERPRISE SOFTWARE TONE

   * Use a professional enterprise SaaS product demonstration style.
   * Focus on workflows, actions, requirements, status, configuration, tracking, reporting, and outcomes.
   * Avoid marketing language and promotional wording.

10. ACTION-ORIENTED LANGUAGE

* Prefer:

  * Review
  * Configure
  * Enroll
  * Track
  * Monitor
  * Complete
  * Validate
  * Submit
  * Analyze
  * Manage
  * Progress
* Avoid vague descriptions.

11. NO GENERIC FILLER

* Do not include:

  * Welcome to
  * Thank you for watching
  * Powerful platform
  * Seamless experience
  * Innovative solution
  * Industry-leading
  * Best-in-class

12. NARRATION SHOULD SOUND LIKE A HUMAN DEMO VOICEOVER

* Every slide should feel like part of a continuous guided walkthrough.
* The narration should flow naturally from one slide to the next without sounding like disconnected summaries.

13. PROFESSIONAL INTRODUCTION

* The first slide MUST contain a short greeting.
* Limit the greeting to one concise sentence.
* The greeting should naturally introduce the workflow being demonstrated.
* Examples:

  * "Hello, let's explore the Programs experience."
  * "Hi, let's walk through the Opportunities workflow."
  * "Hello, let's review how you can manage program participation and progression."
  * "Hi, let's take a look at the Orders experience."

14. PROFESSIONAL CLOSING

* The final slide MUST contain a short closing statement.
* Limit the closing to one concise sentence.
* The closing should summarize the outcome or next step.
* Examples:

  * "You can continue monitoring progress and completing remaining requirements."
  * "Your program status and achievements remain available for ongoing tracking."
  * "You now have visibility into performance, progress, and next actions."
  * "Thank you for your time."

15. GREETING AND CLOSING CONSTRAINTS

* The greeting and closing together should consume no more than 2 slides worth of content.
* Do not generate lengthy introductions.
* Do not generate lengthy conclusions.
* Keep the primary focus on the workflow itself.
* The middle slides should contain the majority of the narration.

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