import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type CloudinaryAsset = {
  url: string;
  fileName: string;
  fileType: string;
  thumbnailUrl?: string;
  storage: "cloudinary" | "local";
};

export const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;

const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
]);

let configured = false;

function getMissingCloudinaryKeys() {
  return [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((key) => !process.env[key]);
}

function hasCloudinaryConfig() {
  return getMissingCloudinaryKeys().length === 0;
}

export function ensureCloudinary() {
  const missing = getMissingCloudinaryKeys();
  if (missing.length > 0) {
    throw new Error("Uploads are not configured yet. Please add the Cloudinary environment variables.");
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
}

function sanitizeFolder(folder?: string) {
  if (!folder) return "ulsan_campus_assets";
  return folder.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 80) || "ulsan_campus_assets";
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function validateUploadFile(file: File) {
  if (!file) {
    throw new Error("No file detected.");
  }

  if (file.size <= 0) {
    throw new Error("The selected file is empty.");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("This file is too large. Please keep uploads under 15MB.");
  }

  if (file.type.startsWith("image/")) {
    return;
  }

  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    throw new Error("This file type is not supported. Please upload an image, PDF, Word document, PowerPoint, or text file.");
  }
}

function getThumbnailUrl(result: UploadApiResponse, fallbackType: string) {
  if (result.resource_type === "image") {
    return result.secure_url;
  }

  if (fallbackType === "application/pdf") {
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

async function uploadFileLocally(file: File, folder?: string): Promise<CloudinaryAsset> {
  const targetFolder = sanitizeFolder(folder);
  const safeFolder = targetFolder.split("/").join(path.sep);
  const uploadsDir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(uploadsDir, { recursive: true });

  const extension = path.extname(file.name) || "";
  const baseName = sanitizeFileName(path.basename(file.name, extension)) || "upload";
  const finalName = `${Date.now()}-${randomUUID()}-${baseName}${extension}`;
  const fullPath = path.join(uploadsDir, finalName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  const publicPath = `/uploads/${targetFolder}/${finalName}`.replace(/\\/g, "/");
  const fileType = file.type || "application/octet-stream";

  return {
    url: publicPath,
    fileName: file.name || finalName,
    fileType,
    thumbnailUrl: fileType.startsWith("image/") ? publicPath : undefined,
    storage: "local",
  };
}

export async function uploadFileToCloudinary(file: File, folder?: string): Promise<CloudinaryAsset> {
  validateUploadFile(file);

  if (!hasCloudinaryConfig()) {
    return uploadFileLocally(file, folder);
  }

  ensureCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());
  const targetFolder = sanitizeFolder(folder);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: targetFolder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error, uploadedResult) => {
        if (error || !uploadedResult) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(uploadedResult);
      }
    );

    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    fileName: file.name || result.original_filename || "uploaded-file",
    fileType: file.type || `${result.resource_type}/${result.format || "unknown"}`,
    thumbnailUrl: getThumbnailUrl(result, file.type),
    storage: "cloudinary",
  };
}
