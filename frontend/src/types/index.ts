export interface ProcessStatus {
  status: "processing" | "completed" | "error";
  processed: number;
  total: number;
  data?: any[];
  error?: string;
}

export interface CSVData {
  cycle_number: number;
  capacity?: number;
  time?: number;
  current?: number;
  voltage?: number;
}

export type ChartType = "line" | "scatter";
