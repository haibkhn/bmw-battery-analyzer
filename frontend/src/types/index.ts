export type CSVType = "2_column" | "4_column";
export type ChartType = "line" | "scatter";
export type VisualizationMode = "overview" | "cycle_analysis";

// Base data structure
export interface BatteryData {
  id?: number;
  cycle_number: number;
  capacity?: number;
  time?: number;
  current?: number;
  voltage?: number;
  created_at?: string;
}

// API related interfaces
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

export interface DataResponse {
  success: boolean;
  data: BatteryData[];
  stats: {
    totalRows: number;
    type: CSVType;
    ranges: {
      [key: string]: { min: number; max: number };
    };
  };
}

// Chart configuration
export interface ChartConfig {
  xAxis: string;
  yAxis: string;
  type: ChartType;
}

// Chart domain types
export interface ChartDomains {
  x: [number, number];
  y: [number, number];
}

export interface DetailDomains {
  time: [number, number];
  voltage: [number, number];
  current: [number, number];
}

// Metric interface
export interface Metric {
  value: string;
  label: string;
}

// Constants for available metrics
export const TWO_COLUMN_METRICS: Metric[] = [
  { value: "cycle_number", label: "Cycle Number" },
  { value: "capacity", label: "Capacity" },
];

export const BASE_METRICS: Metric[] = [
  { value: "cycle_number", label: "Cycle Number" },
  { value: "time", label: "Time" },
  { value: "current", label: "Current" },
  { value: "voltage", label: "Voltage" },
];

export const CYCLE_ANALYSIS_METRICS: Metric[] = [
  { value: "cycle_number", label: "Cycle Number" },
  { value: "avg_voltage", label: "Average Voltage" },
  { value: "max_voltage", label: "Maximum Voltage" },
  { value: "min_voltage", label: "Minimum Voltage" },
  { value: "voltage_range", label: "Voltage Range" },
  { value: "avg_current", label: "Average Current" },
  { value: "max_current", label: "Maximum Current" },
  { value: "min_current", label: "Minimum Current" },
  { value: "current_range", label: "Current Range" },
  { value: "duration", label: "Duration (s)" },
  { value: "measurements", label: "Measurements Count" },
];
