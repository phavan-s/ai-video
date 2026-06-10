import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import s3Client from "./services/s3Service.js";
import fs from "fs";
import path from "path";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { generateNarration } from "./services/groqService.js";
import { generateSpeech, generateSlideAudios } from "./services/pollyService.js";
import { createSlideVideo, mergeVideos } from "./services/videoService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();

const upload = multer({ storage });

app.use(
  "/generated",
  express.static(
    path.join(process.cwd(), "generated")
  )
);

if (!fs.existsSync("generated/images")) {
  fs.mkdirSync("generated/images", {
    recursive: true
  });
}

if (!fs.existsSync("generated/audio")) {
  fs.mkdirSync("generated/audio", {
    recursive: true
  });
}

if (!fs.existsSync("generated/video")) {
  fs.mkdirSync("generated/video", {
    recursive: true
  });
}

if (!fs.existsSync("generated/final")) {
  fs.mkdirSync("generated/final", {
    recursive: true
  });
}



app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.post("/upload", upload.array("images", 10), async (req, res) => {

  console.log("UPLOAD ROUTE HIT");

  try {

    const imageUrls = [];
    const localImages = [];

    // Save locally + Upload to S3
    for (let i = 0; i < req.files.length; i++) {

      const file = req.files[i];

      const localImagePath =
        `generated/images/slide${i + 1}.png`;

      fs.writeFileSync(
        localImagePath,
        file.buffer
      );

      localImages.push(localImagePath);

      const fileName =
        `slide-${i + 1}-${Date.now()}.png`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
      });

      await s3Client.send(command);

      const imageUrl =
        `https://${process.env.AWS_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${fileName}`;

      imageUrls.push(imageUrl);
    }

    const description =
      req.body.description ||
      "No description provided";

    console.log("Step 1 - Upload complete");

    // Narration Generation
    const narrationData =
      await generateNarration(
        description,
        imageUrls.length
      );

    console.log(
      "Narration Generated:",
      narrationData
    );

    // Audio Generation
    const audioFiles =
      await generateSlideAudios(
        narrationData.slides
      );

    console.log(
      "Audio Files Generated:",
      audioFiles
    );

    localImages.reverse();
    
    // Video Generation
    const slideVideos = [];

    for (
      let i = 0;
      i < audioFiles.length;
      i++
    ) {

      const videoPath =
        `generated/video/slide${i + 1}.mp4`;

      await createSlideVideo(
        localImages[i],
        audioFiles[i].audioPath,
        videoPath
      );

      slideVideos.push(videoPath);

      console.log(
        `Generated slide${i + 1}.mp4`
      );
    }

    // Merge Videos

    const finalVideoPath = "generated/final/demo.mp4";
    await mergeVideos(
       slideVideos,
       finalVideoPath
    );

console.log(
  "Final Video Created:",
  finalVideoPath
);
const videoUrl = `http://localhost:5000/generated/final/demo.mp4`;

    res.json({
      success: true,
      imageUrls,
      narration: narrationData,
      audioFiles,
      slideVideos,
      finalVideoPath,
      videoUrl
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});