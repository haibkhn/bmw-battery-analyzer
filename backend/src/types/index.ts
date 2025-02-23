export type CSVType = "2_column" | "4_column";

export interface BatteryData {
  cycle_number: number;
  capacity?: number;
  time?: number;
  current?: number;
  voltage?: number;
}

export interface ProcessStatus {
  fileId: string;
  status: "processing" | "completed" | "error";
  processed: number;
  total: number;
  csvType?: CSVType;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  fileId: string;
  error?: string;
}
