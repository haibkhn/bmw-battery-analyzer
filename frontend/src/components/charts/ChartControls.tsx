import React from "react";
import { ChartConfig, CSVType } from "../../types";
import { Metric } from "@/types/chart";

interface ChartControlsProps {
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
  metrics: Metric[];
  selectedCycle: number | null;
  onCycleChange: (cycle: number | null) => void;
  cycles: number[];
  type: CSVType;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  config,
  onConfigChange,
  metrics,
  selectedCycle,
  onCycleChange,
  cycles,
  type,
}) => {
  return (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label
          className="block text-sm font-medium text-gray-700"
          id="x-axis-label"
        >
          X Axis
        </label>
        <select
          value={config.xAxis}
          onChange={(e) => onConfigChange({ ...config, xAxis: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          aria-labelledby="x-axis-label"
        >
          {metrics.map((metric) => (
            <option key={metric.value} value={metric.value}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          className="block text-sm font-medium text-gray-700"
          id="y-axis-label"
        >
          Y Axis
        </label>
        <select
          value={config.yAxis}
          onChange={(e) => onConfigChange({ ...config, yAxis: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          aria-labelledby="y-axis-label"
        >
          {metrics
            .filter((m) => m.value !== config.xAxis)
            .map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
        </select>
      </div>
      {type === "4_column" && (
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            id="cycle-select-label"
          >
            View Cycle Detail
          </label>
          <select
            value={selectedCycle || ""}
            onChange={(e) => {
              const cycle = Number(e.target.value);
              onCycleChange(cycle || null);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            aria-labelledby="cycle-select-label"
          >
            <option value="">Select Cycle</option>
            {cycles.map((cycle) => (
              <option key={cycle} value={cycle}>
                Cycle {cycle}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
