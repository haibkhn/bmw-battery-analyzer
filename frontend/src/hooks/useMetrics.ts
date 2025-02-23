import { useMemo } from "react";
import {
  CSVType,
  VisualizationMode,
  Metric,
  TWO_COLUMN_METRICS,
  BASE_METRICS,
  CYCLE_ANALYSIS_METRICS,
} from "@/types";

export const useMetrics = (
  type: CSVType,
  mode: VisualizationMode = "overview"
): Metric[] => {
  return useMemo(() => {
    if (type === "2_column") {
      return TWO_COLUMN_METRICS;
    }

    if (mode === "overview") {
      return BASE_METRICS;
    }

    return CYCLE_ANALYSIS_METRICS;
  }, [type, mode]);
};
