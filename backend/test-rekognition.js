import fs from "fs";

import {
  detectText
} from "./services/rekognitionService.js";

const imageBuffer =
  fs.readFileSync(
    "generated/images/slide1.png"
  );

const result =
  await detectText(imageBuffer);

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);