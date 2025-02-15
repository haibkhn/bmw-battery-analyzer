import { Request, Response } from "express";
import { csvService } from "../services/csvService";
import { v4 as uuidv4 } from "uuid";

export const csvController = {
  uploadFile: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
        return;
      }

      const fileId = uuidv4();

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
      res.status(500).json({
        success: false,
        error: "Error uploading file",
      });
    }
  },

  getProcessStatus: async (req: Request, res: Response): Promise<void> => {
    const { fileId } = req.params;
    const status = csvService.getProcessStatus(fileId);

    if (!status) {
      res.status(404).json({
        success: false,
        error: "File not found",
      });
      return;
    }

    res.json({ success: true, status });
  },

  getData: async (req: Request, res: Response): Promise<void> => {
    try {
      const { startCycle, endCycle, limit, offset } = req.query;

      const data = await csvService.getData({
        startCycle: startCycle ? parseInt(startCycle as string) : undefined,
        endCycle: endCycle ? parseInt(endCycle as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error retrieving data",
      });
    }
  },
};
