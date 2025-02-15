export interface BatteryData {
  cycle_number: number;
  capacity?: number;
  time?: number;
  current?: number;
  voltage?: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  fileId?: string;
  error?: string;
}

export interface ProcessStatus {
  processed: number;
  total: number;
  status: "processing" | "completed" | "error";
}
