import Papa from "papaparse";
import { ProcessStatus, CSVData } from "../types";

interface UploadResponse {
  success: boolean;
  fileId: string;
  message?: string;
  error?: string;
}

class ApiService {
  private processMap = new Map<string, ProcessStatus>();

  async uploadFile(file: File): Promise<UploadResponse> {
    return new Promise((resolve) => {
      const fileId = crypto.randomUUID();

      this.processMap.set(fileId, {
        status: "processing",
        processed: 0,
        total: 0,
      });

      setTimeout(() => {
        resolve({
          success: true,
          fileId,
          message: "Upload started",
        });

        this.processFile(file, fileId);
      }, 500);
    });
  }

  private validateCSVFormat(headers: string[]): boolean {
    const requiredColumns = ["cycle_number"];
    const optionalColumns = ["capacity", "time", "current", "voltage"];

    const hasRequiredColumns = requiredColumns.every((col) =>
      headers.includes(col)
    );

    const hasValidOptionalColumns = headers.every(
      (col) => requiredColumns.includes(col) || optionalColumns.includes(col)
    );

    return hasRequiredColumns && hasValidOptionalColumns;
  }

  private processFile(file: File, fileId: string) {
    const data: CSVData[] = [];
    let isHeaderValidated = false;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      step: (results) => {
        // Validate header only once
        if (!isHeaderValidated) {
          isHeaderValidated = true;
          const isValidFormat = this.validateCSVFormat(
            Object.keys(results.data as object)
          );
          if (!isValidFormat) {
            this.processMap.set(fileId, {
              status: "error",
              processed: 0,
              total: 0,
              error:
                "Invalid CSV format. Required columns: cycle_number, and any of: capacity, time, current, voltage",
            });
            return;
          }
        }

        data.push(results.data as CSVData);

        const status = this.processMap.get(fileId);
        if (status) {
          this.processMap.set(fileId, {
            ...status,
            processed: data.length,
            data,
          });
        }
      },
      complete: () => {
        this.processMap.set(fileId, {
          status: "completed",
          processed: data.length,
          total: data.length,
          data,
        });
      },
      error: (error) => {
        this.processMap.set(fileId, {
          status: "error",
          processed: 0,
          total: 0,
          error: error.message,
        });
      },
    });
  }

  async getStatus(fileId: string): Promise<ProcessStatus> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const status = this.processMap.get(fileId);
    if (!status) {
      throw new Error("File not found");
    }

    return status;
  }
}

export const api = new ApiService();
