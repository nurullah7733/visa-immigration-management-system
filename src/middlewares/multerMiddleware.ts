import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import os from "os";

// Multer config: allowed file types
const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir()); // Save to temp directory in production
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter function for allowed types
const fileFilter = (req: any, file: any, cb: any) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// Multer middleware: single or multiple file upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
});

export const multipleFileUpload = upload.array("files", 10);
export const singleFileUpload = upload.single("file");

// Custom middleware to handle form data with files
export const parseFormData = [
  upload.any(), // Handle multiple files using `upload.any()`
  (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];

    const nestedBody: Record<string, any> = {};

    // Convert text fields into nested structure
    Object.entries(req.body).forEach(([key, value]) => {
      const keys = key.split("."); // Split like 'judging.description'
      if (keys.length === 2) {
        const [section, subkey] = keys;
        if (!nestedBody[section]) nestedBody[section] = {};
        nestedBody[section][subkey] = value;
      } else {
        nestedBody[key] = value;
      }
    });

    // Map files to nested structure
    files.forEach((file) => {
      const fieldParts = file.fieldname.split("."); // Like 'judging.files'
      if (fieldParts.length === 2) {
        const [section, key] = fieldParts;
        if (!nestedBody[section]) nestedBody[section] = {};
        if (!nestedBody[section][key]) nestedBody[section][key] = [];
        nestedBody[section][key].push(file);
      } else {
        if (!nestedBody[file.fieldname]) nestedBody[file.fieldname] = [];
        nestedBody[file.fieldname].push(file);
      }
    });

    // ✅ Fix here: Attach parsed data directly to req
    (req as any).formData = nestedBody;
    next();
  },
];
