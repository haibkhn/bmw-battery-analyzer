import { useMemo } from "react";
import { CSVType } from "../types";
import { Metric } from "@/types/chart";

export const useMetrics = (type: CSVType): Metric[] => {
  return useMemo(() => {
    if (type === "2_column") {
      return [
        { value: "cycle_number", label: "Cycle Number" },
        { value: "capacity", label: "Capacity" },
      ];
    }
    return [
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
  }, [type]);
};
