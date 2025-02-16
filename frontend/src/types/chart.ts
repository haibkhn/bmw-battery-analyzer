export interface ChartConfig {
  xAxis: string;
  yAxis: string;
  type: "line" | "scatter";
}

export interface ChartData {
  cycle_number: number;
  capacity?: number;
  time?: number;
  current?: number;
  voltage?: number;
}
