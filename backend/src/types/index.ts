export type CSVType = "2_column" | "4_column";

export interface TwoColumnData {
  cycle_number: number;
  capacity: number;
}

export interface FourColumnData {
  cycle_number: number;
  time: number;
  current: number;
  voltage: number;
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
  fileId?: string;
  error?: string;
}
