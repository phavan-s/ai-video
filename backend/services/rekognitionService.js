import {
  RekognitionClient,
  DetectTextCommand
} from "@aws-sdk/client-rekognition";

import dotenv from "dotenv";

dotenv.config();

const rekognition =
  new RekognitionClient({
    region: process.env.REKOGNITION_REGION,
    credentials: {
      accessKeyId:
        process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey:
        process.env.AWS_SECRET_ACCESS_KEY
    }
  });

export async function detectText(
  imageBuffer
) {

  const command =
    new DetectTextCommand({
      Image: {
        Bytes: imageBuffer
      }
    });

  const response =
    await rekognition.send(command);

  return response.TextDetections
  .filter(
    item => item.Type === "LINE"
  )
  .map(item => ({
    text: item.DetectedText,
    confidence: item.Confidence,
    boundingBox:
      item.Geometry.BoundingBox
  }));
}