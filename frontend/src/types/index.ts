export interface CSVData {
  cycle_number: number;
  capacity?: number;
  time?: number;
  current?: number;
  voltage?: number;
}

export type ChartType = "2D" | "3D";

export interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string;
  zAxis?: string;
}
