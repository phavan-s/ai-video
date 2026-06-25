import fs from "fs";

import {
  analyzeScreen
}
from "./services/bedrockAnalysisService.js";

const ocrResults =
  JSON.parse(
    fs.readFileSync(
      "generated/ocr/slide1.json",
      "utf8"
    )
  );

const result =
  await analyzeScreen(
    ocrResults
  );

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);