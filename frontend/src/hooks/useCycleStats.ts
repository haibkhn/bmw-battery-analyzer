import { useMemo } from "react";
import { BatteryData, CSVType } from "../types";

export interface CycleStats {
  cycle_number: number;
  avg_voltage: number;
  max_voltage: number;
  min_voltage: number;
  voltage_range: number;
  avg_current: number;
  max_current: number;
  min_current: number;
  current_range: number;
  duration: number;
  measurements: number;
}

export const useCycleStats = (
  data: BatteryData[],
  type: CSVType
): CycleStats[] => {
  return useMemo(() => {
    if (type !== "4_column") return [];

    const groupedData = data.reduce(
      (acc, point) => {
        const cycle = point.cycle_number;
        if (!acc[cycle]) acc[cycle] = [];
        acc[cycle].push(point);
        return acc;
      },
      {} as Record<number, BatteryData[]>
    );

    return Object.entries(groupedData).map(([cycle, points]): CycleStats => {
      const voltages = points.map((p) => p.voltage || 0);
      const currents = points.map((p) => p.current || 0);
      const times = points.map((p) => p.time || 0);

      return {
        cycle_number: Number(cycle),
        avg_voltage: voltages.reduce((a, b) => a + b) / voltages.length,
        max_voltage: Math.max(...voltages),
        min_voltage: Math.min(...voltages),
        voltage_range: Math.max(...voltages) - Math.min(...voltages),
        avg_current: currents.reduce((a, b) => a + b) / currents.length,
        max_current: Math.max(...currents),
        min_current: Math.min(...currents),
        current_range: Math.max(...currents) - Math.min(...currents),
        duration: (Math.max(...times) - Math.min(...times)) / 1000,
        measurements: points.length,
      };
    });
  }, [data, type]);
};
