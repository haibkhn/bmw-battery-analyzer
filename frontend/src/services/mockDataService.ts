import Papa from "papaparse";

export interface ProcessStatus {
  status: "processing" | "completed" | "error";
  processed: number;
  total: number;
  error?: string;
}

class MockDataService {
  private statusMap = new Map<string, ProcessStatus>();

  async processFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const fileId = crypto.randomUUID();

      // Initialize status
      this.statusMap.set(fileId, {
        status: "processing",
        processed: 0,
        total: 100,
      });

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        step: (results, parser) => {
          // Update progress
          const currentStatus = this.statusMap.get(fileId);
          if (currentStatus) {
            this.statusMap.set(fileId, {
              ...currentStatus,
              processed: currentStatus.processed + 1,
            });
          }
        },
        complete: () => {
          this.statusMap.set(fileId, {
            status: "completed",
            processed: 100,
            total: 100,
          });
          resolve(fileId);
        },
        error: (error) => {
          this.statusMap.set(fileId, {
            status: "error",
            processed: 0,
            total: 100,
            error: error.message,
          });
          resolve(fileId);
        },
      });
    });
  }

  getStatus(fileId: string): ProcessStatus | null {
    return this.statusMap.get(fileId) || null;
  }
}

export const mockDataService = new MockDataService();
