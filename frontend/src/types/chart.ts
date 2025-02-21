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

export interface Metric {
  value: string;
  label: string;
}

export interface ChartDomains {
  x: [number, number];
  y: [number, number];
}

export interface DetailDomains {
  time: [number, number];
  voltage: [number, number];
  current: [number, number];
}
