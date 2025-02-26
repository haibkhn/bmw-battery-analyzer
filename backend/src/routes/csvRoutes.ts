import express from "express";
import multer from "multer";
import path from "path";
import { csvController } from "../controllers/csvController";

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../../uploads");
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000 * 1024 * 1024, // 1000MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "text/csv") {
      cb(new Error("Only CSV files are allowed"));
      return;
    }
    cb(null, true);
  },
});

router.post("/upload", upload.single("file"), csvController.uploadFile);
router.get("/status/:fileId", csvController.getProcessStatus);
router.get("/data", csvController.getData);

// Make sure to export the router correctly
export { router as csvRoutes };
