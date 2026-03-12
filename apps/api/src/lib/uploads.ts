import fs from "fs";
import path from "path";
import multer from "multer";
import { nanoid } from "nanoid";

const uploadDir = process.env.UPLOAD_DIR || "uploads";

export function ensureUploadDir() {
  const abs = path.isAbsolute(uploadDir) ? uploadDir : path.join(process.cwd(), uploadDir);
  fs.mkdirSync(abs, { recursive: true });
  return abs;
}

export function getPublicUploadBaseUrl() {
  return "/uploads";
}

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const abs = ensureUploadDir();
      cb(null, abs);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      cb(null, `${nanoid()}${ext || ".jpg"}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  }
});
