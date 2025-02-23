import React, { useMemo } from "react";
import { BatteryData } from "../../types";
import { ChartWithControls } from "./ChartWithControls";

interface CycleOverviewProps {
  data: BatteryData[];
  cycles: number[];
}

export const CycleOverview: React.FC<CycleOverviewProps> = ({
  data,
  cycles,
}) => {
  // Calculate summary data and domains
  const { summaryData, domains } = useMemo(() => {
    const summaries = cycles.map((cycleNum) => {
      const cycleData = data.filter((d) => d.cycle_number === cycleNum);

      const voltages = cycleData.map((d) => d.voltage || 0);
      const currents = cycleData.map((d) => d.current || 0);
      const times = cycleData.map((d) => d.time || 0);

      return {
        cycle_number: cycleNum,
        avg_voltage: voltages.reduce((a, b) => a + b, 0) / voltages.length,
        peak_voltage: Math.max(...voltages),
        min_voltage: Math.min(...voltages),
        avg_current: currents.reduce((a, b) => a + b, 0) / currents.length,
        peak_current: Math.max(...currents),
        min_current: Math.min(...currents),
        duration: (Math.max(...times) - Math.min(...times)) / 1000,
      };
    });

    // Calculate domains with padding
    const getPaddedDomain = (values: number[], padding = 0.05) => {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      return [min - range * padding, max + range * padding] as [number, number];
    };

    const voltageDomain = getPaddedDomain([
      ...summaries.map((s) => s.peak_voltage),
      ...summaries.map((s) => s.avg_voltage),
      ...summaries.map((s) => s.min_voltage),
    ]);

    const currentDomain = getPaddedDomain([
      ...summaries.map((s) => s.peak_current),
      ...summaries.map((s) => s.avg_current),
      ...summaries.map((s) => s.min_current),
    ]);

    return {
      summaryData: summaries,
      domains: {
        voltage: voltageDomain,
        current: currentDomain,
        cycles: [Math.min(...cycles), Math.max(...cycles)] as [number, number],
      },
    };
  }, [data, cycles]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Voltage Chart */}
      <ChartWithControls
        data={summaryData}
        xAxis={{
          key: "cycle_number",
          label: "Cycle Number",
          domain: domains.cycles,
        }}
        yAxis={{
          key: "voltage",
          label: "Voltage (V)",
          domain: domains.voltage,
        }}
        lines={[
          { key: "peak_voltage", name: "Peak Voltage", color: "#0066B1" },
          { key: "avg_voltage", name: "Average Voltage", color: "#00B100" },
          { key: "min_voltage", name: "Min Voltage", color: "#FF0000" },
        ]}
      />

      {/* Current Chart */}
      <ChartWithControls
        data={summaryData}
        xAxis={{
          key: "cycle_number",
          label: "Cycle Number",
          domain: domains.cycles,
        }}
        yAxis={{
          key: "current",
          label: "Current (A)",
          domain: domains.current,
        }}
        lines={[
          { key: "peak_current", name: "Peak Current", color: "#B100B1" },
          { key: "avg_current", name: "Average Current", color: "#B16600" },
          { key: "min_current", name: "Min Current", color: "#00B1B1" },
        ]}
      />
    </div>
  );
};

export default CycleOverview;
