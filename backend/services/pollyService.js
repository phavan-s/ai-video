import {
  PollyClient,
  SynthesizeSpeechCommand
} from "@aws-sdk/client-polly";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const polly = new PollyClient({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function generateSpeech(text) {

  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Matthew"
  });

  const response = await polly.send(command);

  const audioPath =
    path.join(
      "generated/audio",
      `audio-${Date.now()}.mp3`
    );

  const audioBuffer = Buffer.from(
    await response.AudioStream.transformToByteArray()
  );

  fs.writeFileSync(audioPath, audioBuffer);

  return audioPath;
}

export async function generateSlideAudios(slides) {

  const audioFiles = [];

  const outputDir = "generated/audio";

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {
      recursive: true
    });
  }

  for (const slide of slides) {

    const command =
      new SynthesizeSpeechCommand({
        Text: slide.narration,
        OutputFormat: "mp3",
        VoiceId: "Matthew"
      });

    const response =
      await polly.send(command);

    const audioBuffer = Buffer.from(
      await response.AudioStream.transformToByteArray()
    );

    const audioPath =
      path.join(
        outputDir,
        `slide${slide.slideNumber}.mp3`
      );

    fs.writeFileSync(
      audioPath,
      audioBuffer
    );

    audioFiles.push({
      slideNumber: slide.slideNumber,
      audioPath
    });

    console.log(
      `Generated slide${slide.slideNumber}.mp3`
    );
  }

  return audioFiles;
}