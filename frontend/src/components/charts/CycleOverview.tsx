// components/charts/CycleOverview.tsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BatteryData } from "../../types";

interface CycleOverviewProps {
  data: BatteryData[];
  cycles: number[];
}

interface NormalizedPoint {
  normalizedTime: number;
  voltage: number;
  current: number;
  cycle: number;
}

export const CycleOverview: React.FC<CycleOverviewProps> = ({
  data,
  cycles,
}) => {
  const cyclesData = useMemo(() => {
    // Take first 5 cycles
    const selectedCycles = cycles.slice(0, 5);

    // Process each cycle
    return selectedCycles.map((cycleNum) => {
      // Get points for this cycle
      const cyclePoints = data.filter((d) => d.cycle_number === cycleNum);
      if (cyclePoints.length === 0) return [];

      // Find start time for normalization
      const startTime = Math.min(...cyclePoints.map((d) => d.time || 0));

      // Create normalized points
      return cyclePoints
        .map((point) => ({
          normalizedTime: ((point.time || 0) - startTime) / 1000,
          voltage: Number(point.voltage),
          current: Number(point.current),
          cycle: cycleNum,
        }))
        .sort((a, b) => a.normalizedTime - b.normalizedTime);
    });
  }, [data, cycles]);

  const flatData = useMemo(() => cyclesData.flat(), [cyclesData]);

  // Calculate domains
  const domains = useMemo(() => {
    if (flatData.length === 0) {
      return {
        time: [0, 1],
        voltage: [0, 1],
        current: [0, 1],
      };
    }

    const timeMax = Math.max(...flatData.map((d) => d.normalizedTime));
    const voltageMin = Math.min(...flatData.map((d) => d.voltage));
    const voltageMax = Math.max(...flatData.map((d) => d.voltage));
    const currentMin = Math.min(...flatData.map((d) => d.current));
    const currentMax = Math.max(...flatData.map((d) => d.current));

    const addPadding = (min: number, max: number) => {
      const padding = (max - min) * 0.05;
      return [min - padding, max + padding] as [number, number];
    };

    return {
      time: [0, timeMax * 1.05] as [number, number],
      voltage: addPadding(voltageMin, voltageMax),
      current: addPadding(currentMin, currentMax),
    };
  }, [flatData]);

  const colors = ["#0066B1", "#FF0000", "#00B100", "#B100B1", "#B16600"];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 20, right: 60, left: 60, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="normalizedTime"
            domain={domains.time}
            label={{
              value: "Time (s)",
              position: "bottom",
              offset: 40,
            }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            yAxisId="voltage"
            domain={domains.voltage}
            label={{
              value: "Voltage (V)",
              angle: -90,
              position: "insideLeft",
              offset: -45,
              style: { textAnchor: "middle" },
            }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            yAxisId="current"
            orientation="right"
            domain={domains.current}
            label={{
              value: "Current (A)",
              angle: 90,
              position: "insideRight",
              offset: 45,
              style: { textAnchor: "middle" },
            }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(4),
              name.includes("Voltage") ? "Voltage (V)" : "Current (A)",
            ]}
            labelFormatter={(label: number) => `Time: ${label.toFixed(2)}s`}
          />
          <Legend />

          {cyclesData.map((cycleData, index) => {
            if (cycleData.length === 0) return null;
            const cycleNum = cycleData[0].cycle;

            return (
              <React.Fragment key={cycleNum}>
                <Line
                  data={cycleData}
                  yAxisId="voltage"
                  type="monotone"
                  dataKey="voltage"
                  name={`Voltage (Cycle ${cycleNum})`}
                  stroke={colors[index]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
                <Line
                  data={cycleData}
                  yAxisId="current"
                  type="monotone"
                  dataKey="current"
                  name={`Current (Cycle ${cycleNum})`}
                  stroke={`${colors[index]}88`}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CycleOverview;
