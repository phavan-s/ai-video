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
import { createSlideVideo, mergeVideos, getImageDimensions } from "./services/videoService.js";
import { detectText } from "./services/rekognitionService.js";

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

app.post("/upload", upload.array("images", 50), async (req, res) => {

  console.log("UPLOAD ROUTE HIT");

  try {

    const imageUrls = [];
    const localImages = [];
    const slideOCRData = [];

    console.log("FILE ORDER RECEIVED:");

req.files.forEach((file, index) => {

  console.log(
    index + 1,
    file.originalname
  );

});

    // Save locally + Upload to S3
    for (let i = 0; i < req.files.length; i++) {

      const file = req.files[i];
      const ocrResults =
  await detectText(
    file.buffer
  );

const ocrText =
  ocrResults
    .map(item => item.text)
    .join("\n");

slideOCRData.push({

  slideNumber: i + 1,

  ocrText

});

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
  const correctedOCRData =
  [...slideOCRData]
    .reverse()
    .map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));

console.log("CORRECTED OCR ORDER");

correctedOCRData.forEach(slide => {

  console.log(
    slide.slideNumber,
    slide.ocrText.split("\n")[0]
  );

});

const narrationData =
  await generateNarration(
    description,
    correctedOCRData
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

    for (let i = 0; i < audioFiles.length; i++) {
      const videoPath = `generated/video/slide${i + 1}.mp4`;

      // Try to use effect metadata from narration slides if available
      const slideMeta = (narrationData.slides && narrationData.slides[i]) || {};
      const effect = slideMeta.effect || slideMeta.focus || slideMeta.box || null;

      // probe image size to pass accurate original dimensions
      let originalW = null;
      let originalH = null;
      try {
        const dims = await getImageDimensions(localImages[i]);
        originalW = dims.width;
        originalH = dims.height;
      } catch (err) {
        // fallback to defaults
        originalW = 1903;
        originalH = 1046;
        console.warn('Could not probe image dimensions, using defaults', err.message);
      }

      console.log("PAIRING");
console.log(
  "IMAGE:",
  localImages[i]
);

console.log(
  "AUDIO:",
  audioFiles[i].audioPath
);

console.log(
  "NARRATION:",
  narrationData.slides[i].focusElement
);


        await createSlideVideo(
          localImages[i],
          audioFiles[i].audioPath,
          videoPath
        );

      slideVideos.push(videoPath);

      console.log(`Generated slide${i + 1}.mp4`);
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
console.log(
  "OCR DATA:"
);

console.log(
  JSON.stringify(
    slideOCRData,
    null,
    2
  )
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