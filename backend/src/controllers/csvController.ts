import { Request, Response } from "express";
import { csvService } from "../services/csvService";
import { v4 as uuidv4 } from "uuid";

export const csvController = {
  uploadFile: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Upload request received");
      console.log("File:", req.file);

      if (!req.file) {
        console.log("No file in request");
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      const fileId = uuidv4();
      console.log("Generated fileId:", fileId);

      // Start processing in background
      csvService
        .processCSV(req.file.path, fileId)
        .catch((error) => console.error("Error processing CSV:", error));

      res.json({
        success: true,
        message: "File upload started",
        fileId,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getProcessStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Status request received for fileId:", req.params.fileId);
      const { fileId } = req.params;
      const status = csvService.getProcessStatus(fileId);

      console.log("Status found:", status);

      if (!status) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
        return;
      }

      res.json({ success: true, status });
    } catch (error) {
      console.error("Error in getProcessStatus:", error);
      res.status(500).json({
        success: false,
        message: "Error checking status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getData: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Fetching data from service...");

      const result = await csvService.getData();

      console.log("Data fetched:", {
        rowCount: result.data.length,
        stats: result.stats,
      });

      res.json({
        success: true,
        data: result.data,
        stats: result.stats,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
