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
  data?: BatteryData[];
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  fileId: string;
  error?: string;
}

export interface ChartConfig {
  xAxis: string;
  yAxis: string;
  type: "line" | "scatter";
}
