import fs from "fs";
import multer from "multer";
import path from "path";

const TEMP_UPLOAD_DIR = "public/temp";
const TRIP_UPLOAD_DIR = "uploads/images";

fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(TRIP_UPLOAD_DIR, { recursive: true });

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

const imageFileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
    return;
  }

  cb(new Error("Only images (jpeg, jpg, png) are allowed."));
};

const createUploader = (storage) =>
  multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter,
  });

export const uploadTempImage = createUploader(createStorage(TEMP_UPLOAD_DIR));

const uploadTripPhotos = createUploader(createStorage(TRIP_UPLOAD_DIR));

export default uploadTripPhotos;
