import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { csvController } from "../controllers/csvController";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Wrapper function to handle async routes
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(csvController.uploadFile)
);

router.get("/status/:fileId", asyncHandler(csvController.getProcessStatus));

router.get("/data", asyncHandler(csvController.getData));

export const csvRoutes = router;
