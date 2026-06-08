import dotenv from "dotenv";
import {
  BedrockRuntimeClient,
  ConverseCommand
} from "@aws-sdk/client-bedrock-runtime";

dotenv.config();

const client = new BedrockRuntimeClient({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function analyzeScreenshots(imageUrls, description) {

  const prompt = `
You are an expert product demo creator.

Analyze the application screenshots.

User description:
${description}

For each screenshot return:

{
  "title": "...",
  "caption": "...",
  "voiceover": "..."
}

Return ONLY valid JSON.
`;

  const command = new ConverseCommand({
    modelId: "arn:aws:bedrock:eu-north-1:227022022836:application-inference-profile/jumb6bj3dg2j",
    messages: [
      {
        role: "user",
        content: [
          {
            text: prompt
          }
        ]
      }
    ]
  });

  const response = await client.send(command);

  return response.output.message.content[0].text;
}   