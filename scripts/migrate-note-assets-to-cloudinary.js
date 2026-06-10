/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");

function loadEnvFile(envPath) {
  const contents = fs.readFileSync(envPath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    process.env[key] = value;
  }
}

function guessFileType(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (lower.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".md")) return "text/markdown";
  return "application/octet-stream";
}

function getThumbnailUrl(result, fileType) {
  if (result.resource_type === "image") {
    return result.secure_url;
  }

  if (fileType === "application/pdf") {
    return cloudinary.url(result.public_id, {
      resource_type: "image",
      format: "jpg",
      page: 1,
      quality: "auto",
      crop: "fill",
      gravity: "north",
      width: 640,
      height: 420,
    });
  }

  return undefined;
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  await mongoose.connect(process.env.MONGODB_URI);

  const noteSchema = new mongoose.Schema({}, { strict: false, collection: "notes" });
  const Note = mongoose.models.NoteAssetMigration || mongoose.model("NoteAssetMigration", noteSchema);

  const notes = await Note.find({ fileUrl: /^\/uploads\// }).lean();
  console.log(`Found ${notes.length} note(s) using local upload paths.`);

  for (const note of notes) {
    const relativePath = String(note.fileUrl || "").replace(/^\/+/, "");
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`Skipping ${note._id}: local file is missing at ${absolutePath}`);
      continue;
    }

    const fileName = String(note.fileName || path.basename(absolutePath));
    const fileType = String(note.fileType || guessFileType(fileName));
    console.log(`Migrating ${note._id} -> ${fileName}`);

    const uploadResult = await cloudinary.uploader.upload(absolutePath, {
      folder: "ulsan_notes",
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
      filename_override: fileName,
    });

    await Note.updateOne(
      { _id: note._id },
      {
        $set: {
          fileUrl: uploadResult.secure_url,
          fileName,
          fileType,
          thumbnailUrl: getThumbnailUrl(uploadResult, fileType),
        },
      }
    );
  }

  await mongoose.disconnect();
  console.log("Note asset migration complete.");
}

main().catch((error) => {
  console.error("Note asset migration failed:", error);
  process.exitCode = 1;
});
