import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

import dotenv from "dotenv";

dotenv.config();

const bedrock =
  new BedrockRuntimeClient({
    region: process.env.AWS_REGION
  });

export async function analyzeScreen(
  ocrResults
) {

  const ocrText =
    ocrResults
      .map(item => item.text)
      .join("\n");

  const prompt = `
You are an enterprise software analyst.

Analyze this OCR output from a software screenshot.

OCR CONTENT:

${ocrText}

Return ONLY valid JSON.

{
  "screenName": "",
  "screenPurpose": "",
  "primaryAction": "",
  "features": []
}
`;

  const body = JSON.stringify({
    anthropic_version:
      "bedrock-2023-05-31",

    max_tokens: 500,

    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const command =
    new InvokeModelCommand({
      modelId:
        "anthropic.claude-3-5-sonnet-20241022-v2:0",

      body,

      contentType:
        "application/json",

      accept:
        "application/json"
    });

  const response =
    await bedrock.send(command);

  const responseBody =
    JSON.parse(
      Buffer
        .from(response.body)
        .toString()
    );

  const content =
    responseBody.content[0].text;

  console.log(
    "BEDROCK RESPONSE:"
  );

  console.log(content);

  return JSON.parse(content);

}