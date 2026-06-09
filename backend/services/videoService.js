import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

ffmpeg.setFfmpegPath(
  "C:/Users/SESA846921/Downloads/ffmpeg/ffmpeg-8.1.1-essentials_build/bin/ffmpeg.exe"
);

export function createSlideVideo(
  imagePath,
  audioPath,
  outputPath
) {

  return new Promise((resolve, reject) => {

    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true
      });
    }

    ffmpeg()
      .input(imagePath)
      .inputOptions(["-loop 1"])

      .input(audioPath)

      .videoCodec("libx264")
      .audioCodec("aac")

      .audioFrequency(44100)
      .audioChannels(2)

      .videoFilters(
        "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"
      )

      .outputOptions([
        "-pix_fmt yuv420p",
        "-shortest"
      ])

      .on("start", (cmd) => {
        console.log("Create Video Command:");
        console.log(cmd);
      })

      .on("end", () => {
        console.log(`Created ${outputPath}`);
        resolve(outputPath);
      })

      .on("error", (err) => {
        console.error("Video Creation Error:");
        console.error(err);
        reject(err);
      })

      .save(outputPath);

  });

}

export function mergeVideos(
  videoPaths,
  outputPath
) {

  return new Promise((resolve, reject) => {

    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true
      });
    }

    const fileListPath = path.resolve(
      "generated/video/videos.txt"
    );

    const fileContent =
      videoPaths
        .map(video =>
          `file '${path.resolve(video).replace(/\\/g, "/")}'`
        )
        .join("\n");

    fs.writeFileSync(
      fileListPath,
      fileContent
    );

    console.log("================================");
    console.log("VIDEOS.TXT CONTENT");
    console.log("================================");
    console.log(fileContent);
    console.log("================================");

    ffmpeg()
      .input(fileListPath)
      .inputOptions([
        "-f concat",
        "-safe 0"
      ])
      .outputOptions([
        "-c copy"
      ])

      .on("start", (cmd) => {
        console.log("Merge Command:");
        console.log(cmd);
      })

      .on("stderr", (line) => {
        console.log("FFMPEG:", line);
      })

      .on("end", () => {
        console.log("Final Demo Created");
        resolve(outputPath);
      })

      .on("error", (err) => {
        console.error("Merge Error:");
        console.error(err);
        reject(err);
      })

      .save(path.resolve(outputPath));

  });

}