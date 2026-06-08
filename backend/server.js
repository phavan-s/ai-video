import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import s3Client from "./services/s3Service.js";

import { PutObjectCommand } from "@aws-sdk/client-s3";
//import { analyzeScreenshots } from "./services/bedrockService.js";
import { analyzeScreenshots } from "./services/groqService.js";

dotenv.config();

const app = express();
app.use(cors());

const storage = multer.memoryStorage();

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.post("/upload", upload.array("images", 10), async (req, res) => {

  console.log("UPLOAD ROUTE HIT");

  try {

    const imageUrls = [];

    for (const file of req.files) {

      const fileName =
        `${Date.now()}-${file.originalname}`;

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

    const analysis = await analyzeScreenshots(imageUrls,
        "This is a programme management application.");
        console.log("AI Analysis:", analysis);

    res.json({
    success: true,
    imageUrls,
    analysis
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